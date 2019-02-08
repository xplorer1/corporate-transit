let mailer = require('../utils/mail');
let uuid = require('node-uuid');
let User = require("../models/user");
let Complaint = require("../models/contactus");
let PaymentJournal = require("../models/payment");
let BookingJournal = require("../models/bookingjournal");
let Slot = require("../models/slot");
let CardNumbers = require("../models/cardnumbers");
let jwt = require('jsonwebtoken');
let config = require('../../config');
let supersecret = config.secret;
let crypto = require("crypto");
let fs = require('fs');

let corporatemail = "customerservice@corporatetransit.com.ng";

module.exports =(app, express, appstorage) => {
    let apiRouter = express.Router();

    //appstorage.set("Buses", ["B1, B2, B3, B4, B5, B6, B7, B8, B9, B10"]);
    //app.set("Buses", ["B1, B2, B3, B4, B5, B6, B7, B8, B9, B10"]);

    let saveBooking = (req, res, email, frequency, bookingid) => {
        Slot.findOneAndUpdate({slotcount: {$lt: 30}, 'users.email': {$ne: email}},
            {$push: {"users": {email: email}, "validity": {email: email}}, $inc: {slotcount : 1}},
            {new: true, upsert: true}, function (err, new_slotcount) {

                if(err) console.log("err: ", err);

                if(new_slotcount) {
                    let bookingjournal = new BookingJournal();
                    let bookingdate = new Date().toLocaleDateString();

                    bookingjournal.email = email;
                    bookingjournal.booking.route = req.body.route;
                    bookingjournal.booking.frequency = req.body.frequency;
                    bookingjournal.booking.bookingid = bookingid;
                    bookingjournal.booking.bookedon = bookingdate;
                    bookingjournal.booking.from = req.body.from;
                    bookingjournal.booking.bookingstatus = "Pending";
                    bookingjournal.booking.to = req.body.to;
                    bookingjournal.booking.ct_cardnumber = req.body.ct_cardnumber;

                    let booking_info = {status: "Pending", id: bookingid, from: req.body.from, to: req.body.to, route: req.body.route, bookedon: new Date().toLocaleString()};
                    bookingjournal.save((err, success) => {
                        if(err) {
                            console.log("err: ", err);
                            return res.json({
                                status: false,
                                data: "db_error",
                                reason: "Database error. Advice user to try again later."
                            });
                        }

                        if(success) {
                            //mailer.sendSuccessfulBookingMail(user.fullname, req.body.email, booking_info);

                            return res.json({status: true, data: "booking_successful.", reason: "Booking is successful."})
                        }
                    });
                }
                else {
                    console.log("No new slot count.")
                }
            });
    };

    apiRouter.post("/confirm", (req, res) => {
        let vcode = req.body.token;
        if(vcode) {
            User.findOne({vcode: vcode}, {"verified" : 1, "email" : 1, "fullname" : 1}, (err, user) => {
                if(err) return res.json({status: false, data: "Email verification error." + err.message});

                if(user) {
                    console.log("username: ", user.username);

                    CardNumbers.find({}, {"ct_numbers" : 1}, (err, numbers) => {
                        if(err) console.log("Err: ", err.message);

                        if(numbers) {
                            numbers = numbers[0];

                            CardNumbers.updateOne({}, {$pull: {ct_numbers: numbers.ct_numbers[0]}}, (err, firstone) => {
                                if(err) console.log("Err.message: ", err.message);

                                if(firstone.nModified === 1) {
                                    let cardnumber = numbers.ct_numbers[0];

                                    User.updateOne({email: user.email}, {
                                        $set: {
                                            verified: true,
                                            verifiedon: new Date(),
                                            ct_cardnumber: cardnumber,
                                            ct_cardstatus: "assigned"
                                        }
                                    }, (err, verified) => {
                                        if (err) return res.json({status: false, data: err});

                                        if (verified.nModified === 1) {

                                            //mailer.sendCardNumberMail(user.fullname, user.email, cardnumber);

                                            return res.json({status: true, data: "Verified", user: user.email});
                                        }
                                        else {
                                            return res.json({status: false, data: "There has been a problem."})
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
                else if(!user) {
                    return res.json({status: false, data: "acct_verified"})
                }
            })
        }
        else {
            console.log("url not familiar.");
            return res.sendFile('views/pages/notfound.html', {root: './public'});
        }
    });

    apiRouter.post("/signup", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Verify your parameters"});
        if(!req.body.home) return res.json({status: false, data: "home_required", reason: "Home address not found. Verify your parameters"});
        if(!req.body.work) return res.json({status: false, data: "work_required", reason: "Workplace not found. Verify your parameters"});
        if(!req.body.phone) return res.json({status: false, data: "work_required", reason: "Phone not found. Verify your parameters"});
        if(!req.body.org) return res.json({status: false, data: "work_required", reason: "Organization not found. Verify your parameters"});
        if(!req.body.username) return res.json({status: false, data: "username_required", reason: "Username not found. Verify your parameters"});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password not found. Verify your parameters"});
        if(!req.body.fullname) return res.json({status: false, data: "fullname_required", reason: "Fullname not found. Verify your parameters"});
        if(!req.body.gender) return res.json({status: false, data: "gender_required", reason: "Gender not found. Verify your parameters"});

        User.findOne({username: req.body.username.toLowerCase()}, function(err, username) {
            if(err) return res.json({status: false, data: err});

            if(username) return res.json({status: false, data: "username_exists", reason: "Username is taken. Advice user to choose another username."});

            if(!username) {
                User.findOne({email: req.body.email}, function(err, email) {
                    if(err) return res.json({status: false, data: "db_error."});

                    if(email) return res.json({status: false, data: "email_exists", reason: "The email entered is already registered. Advice user to verify their input, or login if they have an account."});

                    if(!email) {
                        User.findOne({phone: req.body.phone}, (err, phone) => {
                            if(err) return res.json({status: false, data: "db_error."});

                            if(phone) return res.json({status: false, data: "phone_exists", reason: "The phone entered is already registered. Advice user to verify their input, or login if they have an account."});

                            if(!phone) {
                                let user = new User();
                                let vcode = uuid.v4();

                                user.work = req.body.work;
                                user.home = req.body.home;
                                user.gender = req.body.gender;
                                user.password = req.body.password;
                                user.location = req.body.location;
                                user.email = req.body.email;
                                user.phone = req.body.phone;
                                user.username = req.body.username;
                                user.fullname = req.body.fullname;
                                user.vcode = vcode;
                                user.verified = false;

                                user.save((err, success) => {
                                    if(err) console.log("Error saving user.");

                                    if(success) {
                                        mailer.sendEmailVerificationMail(req.body.fullname.split(" ")[0], "https://corporatetransit.com.ng/verify/"+vcode, req.body.email);

                                        return res.json({status: true, data: "signup_successful", reason: "Account successfully created. Advice user to also check their spam folder in case they don't find it in their primary inbox."})
                                    }
                                    else {
                                        return res.json({status: false, data: "unknown_error", reason: "There has been a problem, and we don't know the reason. Advice user to try again."})
                                    }
                                });
                            }
                        });
                    }
                    else {
                        return res.json({status: false, data: "unknown_error", reason: "An unknown error occurred. Advice user to try again."})
                    }
                });
            }
        })
    });

    apiRouter.post("/resendvcode", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Check your parameters."});

        User.findOne({email: req.body.email}, "fullname verified", (err, status) => {
            if(err) return res.json({status: false, data: "Error" + err});

            if(!status) return res.json({status: false, data: "user_notfound", reason: "Email address was not found. Advice user to check their input and try again."});

            if(status.verified) return res.json({status: false, data: "account_activated", reason: "Account is already activated. Advice to login."});
            if(!status.verified) {
                let vcode = uuid.v4();

                User.update({email: req.body.email}, {$set: {vcode: vcode, verified: false}}, (err, user) => {

                    if (err) {
                        console.log("Error saving user.");

                        return res.json({status: false, data: err})
                    }
                    if(user) {
                        mailer.sendEmailVerificationMail(status.fullname, "https://corporatetransit.com.ng/verify/"+vcode, req.body.email);

                        return res.json({status: true, data: "vcode_sent", reason: "Verification link has been sent to user's email address. confirmation page."});
                    }
                });
            }
            else {
                return res.json({status: false, data: "unknown_error", reason: "An unknown error has occurred. Advice user to try again."});
            }
        })
    });

    apiRouter.post("/login", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Verify your parameters"});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password not found. Verify your parameters"});

        User.findOne({email: req.body.email, password: req.body.password}, {"verified" : 1, "fullname" : 1, "username" : 1, "balance" : 1, "ct_cardnumber" : 1, "home" : 1, "work" : 1}, (err, user) => {
            if(err) return res.json({status: false, data: "Error"+err});

            if(user) {
                if(!user.verified) {
                    let vcode = uuid.v4();

                    user.vcode = vcode;

                    mailer.sendEmailVerificationMail(vcode, req.body.email);

                    return res.json({status: false, data: "not_activated", reason: "Email not verified. Then open to the account/email activation page"});
                }else {
                    let token = jwt.sign({
                        name: user.fullname,
                        email: req.body.email,
                        username: user.username,
                    }, supersecret, {
                        expiresIn: 7200 // expires in 2 hour.
                    });

                    return res.json({status: true, data: "login_successful", reason: "Login is successful.", token: token, user: user});
                }
            }
            if(!user) {
                return res.json({status: false, data: "account_notfound", reason: "The email or password is incorrect. Advice to check and try again, or register if they have no account."});
            }
        })
    });

    apiRouter.post("/forgotpassword", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email Address Required."});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) return res.json({status: false, data: "Database error."+err});

            if(!user) return res.json({status: false, data: "user_notfound", reason: "Advice to verify their input and try again or register."});

            if(user) {
                let resettoken = uuid.v4();

                let expirydate = new Date() + 3600000;

                User.findOneAndUpdate({email: req.body.email}, {$set: {resetpasswordtoken: resettoken, resetpasswordexpires: expirydate}}, (err, reset) =>{
                    if(err) console.log("err: ", err);

                    if(reset) {
                        jwt.sign({
                            email: req.body.email,
                            }, supersecret, {
                                expiresIn: 360 // expires in 1 hour
                            }
                        );
                        mailer.sendPasswordResetMail(user.fullname, req.body.email, "https://corporatetransit.com/reset/"+resettoken);
                        return res.json({status: true, data: "password_resetlink_sent", reason: "Password reset link to user's email address.", resettoken: resettoken});
                    }
                });
            }
        })
    });

    apiRouter.post("/checkcode", (req, res) => {
        let token = req.body.token;

        if(token) {
            User.findOne({resetpasswordtoken: token}, (err, valid) => {
                if(err) return res.json({status: false, data: "db_error", reason: err});

                if(!valid) {
                    return res.json({status: false, data: "invalid_token", reason: "Password reset token invalid."});
                }
                if(valid) {
                    return res.json({status: true, data: "token_valid", reason: "Password token is valid."});
                }
                else {
                    return res.json({status: false, data: "unknown_error", reason: "Password token is valid."});
                }
            })
        }
        else {
            return res.json({status: false, data: "notfound", reason: "Token was not found."});
        }
    });

    apiRouter.post("/resetpassword", (req, res) => {

        if(!req.body.token) return res.json({status: false, data: "token_required", reason: "Token required."});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password Required."});

        User.findOne({resetpasswordtoken: req.body.token, resetpasswordexpires: { $lt: Date.now() }}, {"fullname": 1, "email" : 1}, function(err, user) {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again."});
            if(!user) return res.json({status: false, data: "Password reset token invalid or has expired. Advice user to try again."});

            if(user) {
                User.updateOne({email: user.email}, {$set: {password: req.body.password, resetpasswordexpires: undefined, resetpasswordtoken: undefined}}, (err, changed) => {
                    if(err) console.log("error changing password: ", err);

                    if(changed) {
                        //mailer.sendPasswordChangedMail(user.fullname, req.body.email);

                        return res.json({status: true, data: "password_change_successful", reason: "Password Successfully Changed."});
                    }
                });
            }
        })
    });

    apiRouter.post("/booking",(req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!req.body.ct_cardnumber) return res.json({status: false, data: "ct_cardnumber_required", reason: "Corporate Transit card number required."});
        if(!req.body.route) return res.json({status: false, data: "booking_route_required", reason: "Booking route not supplied."});
        if(!req.body.bookingtype) return res.json({status: false, data: "booking_type_required", reason: "Booking type not supplied."});
        if(!req.body.frequency) return res.json({status: false, data: "booking_frequency_required", reason: "Booking frequency not supplied."});

        if(req.body.frequency === "1 Day") {
            if(!req.body.from) return res.json({status: false, data: "booking_from_required", reason: "Booking from not supplied."});
        }else{
            if(!req.body.from) return res.json({status: false, data: "booking_from_required", reason: "Booking from not supplied."});
            if(!req.body.to) return res.json({status: false, data: "booking_to_required", reason: "Booking to not supplied."});
        }

        let id = uuid.v4();

        let bookingid = req.body.ct_cardnumber+"_"+id;

        jwt.verify(token, supersecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err);
                return res.json({status: false, data: "token_expired."})
            }
            else if(decoded) {
                User.findOne({email: decoded.email}, function(err, user) {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!user) return res.json({status: false, data: "user_not_found", reason: "User with email address not registered."});

                    if(user) {

                        Slot.findOne({"users.email": decoded.email}, (err, email) => {
                            if(err) console.log("err: ", err);

                            if(email) {
                                return res.json({status: false, data: "slot_email"})
                            }
                            else if(!email) {

                                if(req.body.frequency === "1 Day") {
                                    saveBooking(req, res, req.body.email, 1, bookingid);
                                }else if(req.body.frequency === "5 Days") {
                                    saveBooking(req, res, req.body.email, 5, bookingid);
                                }else if(req.body.frequency === "10 Days") {
                                    saveBooking(req, res, req.body.email, 10, bookingid);
                                }else if(req.body.frequency === "1 Month") {
                                    saveBooking(req, res, req.body.email, 30, bookingid);
                                }else {
                                    console.log("Unknown input.");
                                }
                            }
                        });
                    }else {
                        console.log("no user");
                        return res.json({status: false, data: "not_found"})
                        //return res.sendFile("notfound.html");
                    }
                });
            }else {
                return res.json({status: false, data: "token_expired"})
            }
        });
    });

    apiRouter.post("/cancelbooking", (req, res) => {
        if(!req.body.bookingid) return res.json({status: false, data: "bookingid_required", reason: "No booking id supplied."});
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: decoded.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!client) return res.json({status: false, data: "user_not_found", reason: "No account with that email address was found."});

                    if(client) {
                        BookingJournal.findOne({email: decoded.email}, (err, user) => {
                            if(err) return res.json({status: false, data: "database error: " + err});
                            if(!user) return res.json({status: false, data: "User has no existing bookings."});
                            if(user) {

                                BookingJournal.findOneAndUpdate({"booking.bookingid": req.body.bookingid}, {
                                    $set: {"booking.bookingstatus": "Cancelled"}
                                }, {new: true},  (err, booking) => {
                                    if(err) return res.json({status: false, data: "finding booking error: " + err});

                                    if(!booking) return res.json({status: false, data: "Problem cancelling booking. Client email not found."});

                                    if(booking) {
                                        Slot.findOneAndUpdate({"users.email": decoded.email}, {
                                            $inc: {slotcount: -1},
                                            $pull: {users: {email: decoded.email}}}, {new: true}, (err, status) => {
                                            if (err) return res.json({status: false, data: "updating slotcount err: " + err});

                                            if(status) {
                                                mailer.sendBookingCancelledMail(decoded.fullname, decoded.email);
                                                return res.json({status: true, data: "Booking Cancellation Successful."});
                                            }else {
                                                return res.json({status: false, data: "Unable to update slot count."})
                                            }
                                        });
                                    }
                                    else {
                                        return res.json({status: false, data: "Unable to cancel booking."})
                                    }
                                })
                            }else {
                                return res.json({status: false, data: "user_notfound"})
                            }
                        })
                    }else {
                        return res.json({status: false, data: "user_notfound"})
                    }
                });
            }else {
                return res.json({status: false, data: "token_expired"})
            }
        });
    });

    apiRouter.post("/paymenthistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});

        User.findOne({email: req.body.email}, {"fullname" : 1, "balance" : 1}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                PaymentJournal.find({email: req.body.email}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(history) {
                        return res.json({status: true, data: history, user_details: client})
                    }
                });
            }
        });
    });

    apiRouter.post("/bookinghistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});

        User.findOne({email: req.body.email}, {"fullname" : 1}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                BookingJournal.find({email: req.body.email}, {"booking" : 1, "email" : 1}, (err, history) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(history) {
                        return res.json({status: true, data: history, fullname: client.fullname})
                    }
                });
            }
        });
    });

    apiRouter.post("/sortbookinghistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});
        if(!req.body.filter) res.json({status: false, data: "filter_required", reason: "Filter params not found."});

        var sorthistory = (numdays, fullname) => {
            let date = new Date();

            date.setDate(date.getDate() - numdays);
            let datethen = new Date(date);

            BookingJournal.find({email: req.body.email, "booking.bookedon" : {$gt: datethen}}, {"booking" : 1, "email" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history, fullname: fullname})
                }
            });
        };

        User.findOne({email: req.body.email}, {"fullname" : 1}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                switch (req.body.filter) {
                    case "last7days":
                        sorthistory(7, client.fullname);
                        break;
                    case "last30days":
                        sorthistory(30, client.fullname);
                        break;
                    case "last3months":
                        sorthistory(60, client.fullname);
                        break;
                    case "last6months":
                        sorthistory(180, client.fullname);
                        break;
                    case "last1year":
                        sorthistory(365, client.fullname);
                        break;
                    default:
                        BookingJournal.find({email: req.body.email}, {"booking" : 1, "email" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                            if(history) {
                                return res.json({status: true, data: history, fullname: client.fullname})
                            }
                        });
                        break;
                }
            }
        });
    });

    apiRouter.post("/sortpaymenthistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});
        if(!req.body.filter) res.json({status: false, data: "filter_required", reason: "Filter params not found."});

        var sorthistory = (numdays, fullname) => {
            let date = new Date();

            date.setDate(date.getDate() - numdays);
            let datethen = new Date(date);

            PaymentJournal.find({email: req.body.email, created : {$gt: datethen}}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history, fullname: fullname})
                }
            });
        };

        User.findOne({email: req.body.email}, {"fullname" : 1}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                switch (req.body.filter) {
                    case "last7days":
                        sorthistory(7, client.fullname);
                        break;
                    case "last30days":
                        sorthistory(30, client.fullname);
                        break;
                    case "last3months":
                        sorthistory(60, client.fullname);
                        break;
                    case "last6months":
                        sorthistory(180, client.fullname);
                        break;
                    case "last1year":
                        sorthistory(365, client.fullname);
                        break;
                    default:
                        BookingJournal.find({email: req.body.email}, {"booking" : 1, "email" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                            if(history) {
                                return res.json({status: true, data: history, fullname: client.fullname})
                            }
                        });
                        break;
                }
            }
        });
    });

    apiRouter.post('/fund_ct', (req, res) => {
        if (!req.body.email) return res.json({status: false, message: 'Email not found.'});
        if (!req.body.amount) return res.json({status: false, message: 'Payment amount is required. Pick a bundle.'});

        let payment = new PaymentJournal();

        let id = uuid.v4();

        payment.paymentid = id;
        payment.email = req.body.email;
        payment.paymenttype = "Online Instant";
        payment.amount = req.body.amount;
        payment.createdon = new Date().toDateString();

        payment.save(function (err) {
            if (err) return res.send(err);

            User.update({email: req.body.email}, {$push: {"payments": id}},
                {safe: true, upsert: true, new: true}, function (err, payment) {
                    if (err) return res.send(err);

                    if (payment.nModified > 0) {
                        User.findOne({email: req.body.email}, function (err, ctime) {
                            if (err) return res.send(err);

                            if (ctime) {
                                return res.json({status: true, ref: id, email: ctime.email});
                            } else {
                                return res.json({status: false, message: "There was a problem initiating your payment."});
                            }
                        });
                    } else {
                        return res.json({status: false, message: "There was a problem initiating payment."});
                    }
                });
        });
    });

    apiRouter.post("/contactus", (req, res) => {
        if(!req.body.name) return res.json({status: false, data: "name_required", reason: "Name not supplied."});
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email not supplied."});
        if(!req.body.complaint) return res.json({status: false, data: "complaint_required", reason: "Complaint body not supplied."});

        let complaint = new Complaint();

        complaint.email = req.body.email;
        complaint.name = req.body.name;
        complaint.complaint = req.body.complaint;

        complaint.save(err => {
            console.log("Error saving complaint. ", err);

            mailer.sendComplaintRecieptMail(req.body.name, req.body.email);

            mailer.sendComplaintMail(req.body.name, req.body.email, req.body.complaint, corporatemail);

            return res.json({status: true, data: "complaint_received.", reason: "Complaint has been received. Advice user support will get in touch shortly."})
        });
    });

    apiRouter.post("/payevents", (req, res) => {
        if(!req.body.data.customer.email) return res.json({status: false, data: "Email not found."});
        if(!req.body.data.reference) return res.json({status: false, data: "Reference missing."});

        let secret = "sk_test_625a6940222e312c4529a248db6aeefaeea7d2f1";
        let hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash === req.headers['x-paystack-signature']) {

            PaymentJournal.find({ paymentid: req.body.data.reference}, function(err, payments) {
                console.log("Payments: ", payments);

                if (err) console.log(err);

                if(payments) {
                    if(req.body.data.status === "success"){
                        User.updateOne({email: req.body.data.customer.email}, {$inc: {balance: req.body.data.amount}}, (err, updated) => {
                            if(err) console.log("error updating balance: ", err);
                            if(updated) {
                                console.log("Updated!");
                                return res.sendStatus(200);
                                //return res.json({status: true, data: "Balance updated."})
                            }
                        });
                    }
                }
            });
        }
    });

    apiRouter.post("/cardpayment", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found."});
        if(!req.body.cardnumber) return res.json({status: false, data: "ct_cardnumber_required", reason: "User card number not found."});
        if(!req.body.amount) return res.json({status: false, data: "amount_required", reason: "Amount user paid is required."});

        let amount = -1 * req.body.amount;

        User.findOne({email: req.body.email, ct_cardnumber: req.body.cardnumber}, {"fullname" : 1}, (err, user) => {
            if(err) {
                console.log("Error finding user: ", err);
            }
            if(user) {
                User.updateOne({email: req.body.email}, {$inc: {balance: amount}}, (err, update) => {
                    if(err) {
                        console.log("error deducting from user's balance: ", err);
                    }
                    if(update){
                        Slot.findOneAndUpdate({"users.email": req.body.email}, {
                            $inc: {slotcount: -1},
                            $pull: {users: {email: req.body.email}}}, {new: true}, (err, status) => {
                            if (err) return res.json({status: false, data: "updating slotcount err: " + err});

                            if(status) {
                                mailer.sendBookingCancelledMail(user.fullname, req.body.email);
                                return res.json({status: true, data: "Updated"});
                            }else {
                                return res.json({status: false, data: "Unable to update slot count."})
                            }
                        });
                    }
                })
            }
        })
    });

    apiRouter.post("/banktransfer", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found."});
        if(!req.body.amount) return res.json({status: false, data: "amount_required", reason: "Amount user paid is required."});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) {
                console.log("Error finding user: ", err);
            }

            if(user) {
                let payment = new PaymentJournal();

                let id = uuid.v4();

                payment.paymentid = id;
                payment.email = req.body.email;
                payment.paymenttype = "Bank Transfer";
                payment.amount = req.body.amount;
                payment.createdon = new Date().toDateString();

                payment.save(err => {
                    if(err) console.log("Error saving payment: ", err);

                    console.log("payment: ", payment);
                    User.updateOne({email: req.body.email}, {$inc: {balance: req.body.amount}}, (err, update) => {
                        if(err) {
                            console.log("error deducting from user's balance.");
                        }
                        if(update){
                            return res.json({status: true, data: "Updated"})
                        }
                    })
                });
            }
        })
    });

    return apiRouter;
};