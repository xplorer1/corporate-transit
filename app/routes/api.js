let mailer = require('../utils/mail');
let uuid = require('node-uuid');
let User = require("../models/user");
let Complaint = require("../models/contactus");
let PaymentJournal = require("../models/payment");
let BookingJournal = require("../models/bookingjournal");
let TransactionJournal = require("../models/transactions");
let CardNumbers = require("../models/cardnumbers");
let Routes = require("../models/routes");
let jwt = require('jsonwebtoken');
let config = require('../../config');
let supersecret = config.secret;
let crypto = require("crypto");
let fs = require('fs');
let axios = require('axios');
let moment = require('moment');
moment().format();

let corporatemail = "customerservice@corporatetransit.com.ng";

module.exports =(app, express, appstorage) => {
    let apiRouter = express.Router();
    let ravepublic = "FLWPUBK-6195e6a12e7c7472d88a24f73a30b586-X";
    let ravesecret = "FLWSECK-a41b96804d32e685bf8c88833abd1439-X";
    let raveenckey = "a41b96804d32cc68726db659";

    let saveRoutes = () => {
        let route = new Routes();

        route.route = "KYI - VI";

        route.pickup_morning.time = "5:45 AM";
        route.pickup_morning.point = "Conoil Petrol Station";

        route.drop_morning.time = "7:25 AM";
        route.drop_morning.point ="Akin Adesola / Adeola Odeku";

        route.pickup_evening.time = "17:45 PM";
        route.pickup_evening.point = "Zenith Bank, Adeola Odeku";

        route.drop_evening.time = "19:45 PM";
        route.drop_evening.point = "Oworo/MaryLand/Ikeja";

        route.save();
    }

    //saveRoutes();

    apiRouter.post("/confirm", (req, res) => {
        let vcode = req.body.token;

        if(vcode) {
            User.findOne({vcode: vcode}, {"verified" : 1, "email" : 1, "fullname" : 1}, (err, user) => {
                if(err) return res.json({status: false, data: "Email verification error." + err.message});

                if(user) {

                    CardNumbers.find({}, {"ct_numbers" : 1}, (err, numbers) => {
                        if(err) console.log("Err: ", err.message);

                        if(numbers) {
                            numbers = numbers[0];

                            User.updateOne({email: user.email}, {
                                $set: {
                                    verified: true,
                                    verifiedon: new Date(),
                                    ct_cardnumber: "ewew23232",
                                    ct_cardstatus: "assigned"
                                }
                            }, (err, verified) => {
                                if (err) return res.json({status: false, data: err});

                                if (verified.nModified === 1) {

                                    mailer.sendCardNumberMail(user.fullname, user.email, "ewew23232");

                                    return res.json({status: true, data: "Verified", user: user.email});
                                }
                                else {
                                    return res.json({status: false, data: "There has been a problem."})
                                }
                            });

                            /*CardNumbers.updateOne({}, {$pull: {ct_numbers: numbers.ct_numbers[0]}}, (err, firstone) => {
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

                                            mailer.sendCardNumberMail(user.fullname, user.email, cardnumber);

                                            return res.json({status: true, data: "Verified", user: user.email});
                                        }
                                        else {
                                            return res.json({status: false, data: "There has been a problem."})
                                        }
                                    });
                                }
                            })*/
                        }
                    });
                }
                else if(!user) {
                    return res.json({status: false, data: "token_expired"})
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

        User.findOne({email: req.body.email, password: req.body.password}, {"verified" : 1, "work": 1, "home": 1, "balance" : 1, "email": 1, "phone" : 1, "fullname": 1, "username": 1, "ct_cardnumber": 1}, (err, user) => {
            if(err) return res.json({status: false, data: "Error"+err});

            if(user) {
                if(!user.verified) {
                    let vcode = uuid.v4();

                    User.update({email: req.body.email}, {$set: {vcode: vcode, verified: false}}, (err, user) => {

                        if (err) {
                            console.log("Error saving user.");

                            return res.json({status: false, data: err})
                        }
                        if(user) {
                            mailer.sendEmailVerificationMail(user.fullname, "https://ae91e863.ngrok.io/verify/"+vcode, req.body.email);

                            return res.json({status: false, data: "not_activated", reason: "Email not verified. Then open to the account/email activation page"});
                        }
                    });
                }else {
                    let token = jwt.sign({
                        name: user.fullname,
                        email: req.body.email,
                        username: user.username,
                    }, supersecret, {
                        expiresIn: 86400 // expires in 24 hours.
                    });

                    let totaldeposited = 0;
                    let numtaken = 0;
                    let pendingtrip;
                    let num_cardpayments = 0;
                    let num_bankpayments = 0;

                    PaymentJournal.find({email: req.body.email}, (err, paid) => {
                        if(err) console.log("Err: ", err.message);

                        if(paid) {
                            
                            paid.forEach(item => {
                                totaldeposited += item.amount;

                                if(item.paymenttype === "Online Instant") {
                                    num_cardpayments += item.amount;
                                }
                                else if(item.paymenttype === "Bank Payment") {
                                    num_bankpayments += item.amount;
                                }
                            });

                            console.log("Card Payments: ", num_cardpayments, "Bank Transfer: ", num_bankpayments);

                            BookingJournal.find({email: req.body.email}, (err, bookings) => {
                                if(err) {
                                    console.log("Err: ", err.message);
                                    return res.json({status: false, data: err.message});
                                }

                                if(bookings) {
                                    bookings.forEach(booking => {
                                        if(booking.booking.bookingstatus === "Concluded") {
                                            numtaken++;
                                        }

                                        if(booking.booking.bookingstatus === "Pending") {
                                            pendingtrip = booking.booking.from + " " + booking.booking.bookingtime;
                                        }
                                    });

                                    let sortedbooking = bookings.sort(function (obj1, obj2) {
                                        return obj2.bookedon - obj1.bookedon;
                                    });

                                    let latestbooking = sortedbooking[0];

                                    let userobj = {};
                                    userobj["paymentinfo"] = {};

                                    userobj.balance = user.balance;
                                    userobj.email = user.email;
                                    userobj.fullname = user.fullname;
                                    userobj.username = user.username;
                                    userobj.cardnumber = user.ct_cardnumber;
                                    userobj.work = user.work;
                                    userobj.home = user.home;
                                    userobj.token = token;
                                    userobj.totaldeposited = totaldeposited;
                                    userobj.numtrips = bookings.length;
                                    userobj.numtaken = numtaken;
                                    userobj.latestbooking = pendingtrip;
                                    userobj.num_bankpayments = num_bankpayments;
                                    userobj.num_cardpayments = num_cardpayments;

                                    return res.json({status: true, data: "login_successful", reason: "Login is successful.", user: userobj});
                                }
                            })
                        }
                    })
                    
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

    apiRouter.post("/getbalance", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email Address Required."});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) return res.json({status: false, data: "db_error", reason: err});

            if(!user) {
                return res.json({status: false, data: "user_notfound", reason: "User with email not found."});
            }
            if(user) {
                return res.json({status: true, data: user.balance});
            }
            else {
                return res.json({status: false, data: "unknown_error"});
            }
        })
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

    let bookTrip = (req, res, email, bookingtype, routefrom, routeto, from, to, ct_cardnumber, tripmode, fullname) => {
        let bookingjournal = new BookingJournal();
        let bookingdate = new Date().toDateString();
        let bookingtime = new Date().toLocaleTimeString();

        let id = uuid.v4();
        let bookingid = ct_cardnumber+"_"+id;

        bookingjournal.email = email;
        bookingjournal.booking.bookingid = bookingid;
        bookingjournal.booking.bookingtype = bookingtype;
        bookingjournal.booking.bookedon = new Date().toDateString();
        bookingjournal.booking.bookedonformatted = bookingdate;
        bookingjournal.booking.bookingtime = bookingtime;
        bookingjournal.booking.bookingstatus = "Pending";
        bookingjournal.booking.routefrom = routefrom;
        bookingjournal.booking.routeto = routeto;
        bookingjournal.booking.from = from;
        bookingjournal.booking.to = to;
        bookingjournal.booking.mode = "Card Tap";
        bookingjournal.booking.ct_cardnumber = ct_cardnumber;
        bookingjournal.booking.tripmode = tripmode;

        let booking_info = {status: "Pending", id: bookingid, from: from, to: to, bookedon: new Date().toLocaleString()};
        bookingjournal.save((err, success) => {
            if(err) {
                console.log("err: ", err.message);
                return res.json({
                    status: false,
                    data: "db_error",
                    reason: "Database error. Advice user to try again later."
                });
            }

            if(success) {
                mailer.sendSuccessfulBookingMail(fullname, email, booking_info);

                return res.json({status: true, data: "booking_successful.", reason: "Booking is successful."})
            }
        });
    }

    apiRouter.post("/booking",(req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!token) return res.json({status: false, data: "token_required"});
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.ct_cardnumber) return res.json({status: false, data: "ct_cardnumber_required"});
        if(!req.body.bookingtype) return res.json({status: false, data: "booking_type_required"});
        if(!req.body.routefrom) return res.json({status: false, data: "booking_departure_required"});
        if(!req.body.routeto) return res.json({status: false, data: "booking_destination_required"});
        if(!req.body.from) return res.json({status: false, data: "booking_from_required"});

        if((req.body.from && req.body.to) && (new Date(req.body.from).toString() === new Date(req.body.to).toString())) {
            return res.json({status: false, data: "same_date"});
        }

        if(new Date(req.body.from).getTime() < new Date().getTime()) {
            return res.json({status: false, data: "dateone_in_the_past"});
        }
        else if(new Date(req.body.to).getTime() < new Date().getTime()) {
            return res.json({status: false, data: "datetwo_in_the_past"});
        }
        else if(new Date(req.body.to).getTime() < new Date(req.body.from).getTime()) {
            return res.json({status: false, data: "dateone_greater"});
        }

        if(req.body.bookingtype === "One Way Trip") {
            if(!req.body.tripmode) return res.json({status: false, data: "no_mode"});
        }

        jwt.verify(token, supersecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                User.findOne({email: decoded.email}, (err, user) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!user) return res.json({status: false, data: "user_not_found", reason: "User with email address not registered."});

                    if(user) {
                        BookingJournal.findOne({email: req.body.email, "booking.bookingstatus" : "Pending"}, (err, trip) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(trip) {
                                console.log("Trip: ", trip);
                                if(moment(req.body.from).isBetween(trip.booking.from, trip.booking.to)) {
                                    return res.json({status: false, data: "dateone_one_less_than_pending", pendingbooking: trip});
                                }
                                if(moment(req.body.to).isBetween(trip.booking.from, trip.booking.to)) {
                                    return res.json({status: false, data: "dateone_one_less_than_pending", pendingbooking: trip});
                                }
                                else if(moment(req.body.from).isSame(trip.booking.from)) {
                                    return res.json({status: false, data: "dateone_one_less_than_pending", pendingbooking: trip});
                                }
                                else if(moment(req.body.to).isSame(trip.booking.to)) {
                                    return res.json({status: false, data: "dateone_one_less_than_pending", pendingbooking: trip});
                                }
                                else {
                                    return bookTrip(req, res, req.body.email, req.body.bookingtype, req.body.routefrom, req.body.routeto, req.body.from, req.body.to, req.body.ct_cardnumber, req.body.tripmode, user.fullname);
                                }
                            }
                            else {
                                return bookTrip(req, res, req.body.email, req.body.bookingtype, req.body.routefrom, req.body.routeto, req.body.from, req.body.to, req.body.ct_cardnumber, req.body.tripmode, user.fullname);
                            }
                        })
                    }
                    else {
                        return res.json({status: false, data: "not_found"})
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
                                        mailer.sendBookingCancelledMail(decoded.fullname, decoded.email);
                                        return res.json({status: true, data: "Booking Cancellation Successful."});
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
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!token) return res.json({status: false, data: "token_required"});
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
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
            }
        })
    });

    apiRouter.post("/transactionhistory", (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!req.body.email) res.json({status: false, data: "email_required"});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, {"fullname" : 1, "balance" : 1}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

                    if(client) {
                        TransactionJournal.find({email: req.body.email}, {"transaction" : 1, "amount" : 1, "success" : 1, "created" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                            if(history) {
                                return res.json({status: true, data: history, user_details: client})
                            }
                        });
                    }
                });
            }
        })
    });

    apiRouter.post("/bookinghistory", (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, {"fullname" : 1}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(!client) {
                        console.log("Client: ", client)
                        return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});
                    }

                    if(client) {
                        BookingJournal.find({email: req.body.email}, {"booking" : 1, "email" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                            if(history) {
                                return res.json({status: true, data: history, fullname: client.fullname})
                            }
                        });
                    }
                });
            }
        })
    });

    apiRouter.post("/searchhistory", (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.type) return res.json({status: false, data: "type_required"});
        if(!req.body.startdate) return res.json({status: false, data: "Date one required"});
        if(!req.body.enddate) return res.json({status: false, data: "Date two required"});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    
                    if(!client) {
                        return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});
                    }

                    if(client) {
                        switch (req.body.type) {
                            case "payment":
                                sortPaymentHistory(req.body.startdate, req.body.enddate, req.body.email);
                                break;
                            case "transaction":
                                sortTransactionHistory(req.body.startdate, req.body.enddate, req.body.email);
                                break;
                            case "booking":
                                sortBookingHistory(req.body.startdate, req.body.enddate, req.body.email);
                                break;
                        }
                    }
                });
            }
        });

        let sortPaymentHistory = (dateone, datetwo, email) => {

            dateone = new Date(dateone);
            datetwo = new Date(datetwo);

            PaymentJournal.find({email: req.body.email, created : {$gt: dateone, $lt: datetwo}}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }

        let sortBookingHistory = (dateone, datetwo, email) => {
            dateone = new Date(dateone);
            datetwo = new Date(datetwo);

            BookingJournal.find({email: req.body.email, "booking.bookedon" : {$gt: dateone, $lt: datetwo}}, {"booking" : 1, "email" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }

        let sortTransactionHistory = (dateone, datetwo, email) => {
            dateone = new Date(dateone);
            datetwo = new Date(datetwo);

            TransactionJournal.find({email: req.body.email, created : {$gt: dateone, $lt: datetwo}}, {"transaction" : 1, "amount" : 1, "success" : 1, "created" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }
    });

    apiRouter.post("/gethistory", (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.numofdays) return res.json({status: false, data: "numofdays_required"});
        if(!req.body.type) return res.json({status: false, data: "type_required"});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(!client) {
                        return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});
                    }

                    if(client) {
                        switch (req.body.type) {
                            case "payment":
                                sortPaymentHistory(req.body.numofdays, req.body.email);
                                break;
                            case "transaction":
                                sortTransactionHistory(req.body.numofdays, req.body.email);
                                break;
                            case "booking":
                                sortBookingHistory(req.body.numofdays, req.body.email);
                                break;
                        }
                    }
                });
            }
        });

        let sortPaymentHistory = (numofdays, email) => {
            let date = new Date();

            date.setDate(date.getDate() - numofdays);
            let datethen = new Date(date);

            PaymentJournal.find({email: req.body.email, created : {$gt: datethen}}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }

        let sortBookingHistory = (numofdays, email) => {
            let date = new Date();

            date.setDate(date.getDate() - numofdays);
            let datethen = new Date(date);

            BookingJournal.find({email: req.body.email, "booking.bookedon" : {$gt: datethen}}, {"booking" : 1, "email" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }

        let sortTransactionHistory = (numofdays, email) => {
            let date = new Date();

            date.setDate(date.getDate() - numofdays);
            let datethen = new Date(date);

            TransactionJournal.find({email: req.body.email, created : {$gt: datethen}}, {"transaction" : 1, "amount" : 1, "success" : 1, "created" : 1}, (err, history) => {
                if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                if(history) {
                    return res.json({status: true, data: history})
                }
            });
        }
    })

    apiRouter.post('/fund_ct', (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if (!req.body.email) return res.json({status: false, message: 'Email not found.'});
        if (!req.body.amount) return res.json({status: false, message: 'Payment amount is required.'});
        if (!req.body.paymenttype) return res.json({status: false, message: 'Payment Type is required.'});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, (err, ctime) => {
                    if (err) return res.send(err);

                    if (ctime) {
                        let payment = new PaymentJournal();

                        let id = uuid.v4();

                        payment.paymentid = id;
                        payment.email = req.body.email;
                        payment.paymenttype = req.body.paymenttype;
                        payment.amount = req.body.amount;
                        payment.createdon = new Date().toDateString();

                        payment.save(function (err) {
                            if (err) return res.send(err);

                            User.update({email: req.body.email}, {$push: {"payments": id}}, function (err, payment) {
                                if (err) return res.send(err);

                                if (payment.nModified > 0) {
                                    
                                    return res.json({status: true, ref: id, email: ctime.email, phone: ctime.phone});
                                    
                                } else {
                                    return res.json({status: false, message: "There was a problem initiating payment."});
                                }
                            });
                        });
                        
                    } else {
                        return res.json({status: false, message: "User not found."});
                    }
                });
            }
        });
    });

    apiRouter.post("/contactus", (req, res) => {
        if(!req.body.subject) return res.json({status: false, data: "subject_required", reason: "Name not supplied."});
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email not supplied."});
        if(!req.body.complaint) return res.json({status: false, data: "complaint_required", reason: "Complaint body not supplied."});

        let complaint = new Complaint();

        complaint.email = req.body.email;
        complaint.subject = req.body.subject;
        complaint.complaint = req.body.complaint;
        complaint.createdon = new Date().toDateString();

        complaint.save((err, success) => {

            if(err) {
                console.log("Error saving complaint. ", err.message);
                return res.json({status: false, data: err.message});
            }
            else if(success) {
                mailer.sendComplaintRecieptMail(req.body.name, req.body.email);

                //mailer.sendComplaintMail(req.body.name, req.body.email, req.body.complaint, corporatemail);

                return res.json({status: true, data: "complaint_received.", reason: "Complaint has been received."});
            }
        });
    });

    apiRouter.post("/payevents", (req, res) => {
        console.log();
        console.log("Req.body: ", req.body);
        console.log();
        
        /*if(!req.body.customer.email) return res.json({status: false, data: "Email not found."});
        if(!req.body.txRef) return res.json({status: false, data: "Reference missing."});*/

        let secret = "173a9d15-c11b-4c4d-a1d4-48b488665fbb5c5716d9ece0a9a2ecc7a0ca";

        //let hash = req.headers["verif-hash"];
        let hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash === req.headers["verif-hash"]) {

            PaymentJournal.find({ paymentid: req.body.txRef}, function(err, payments) {

                if (err) console.log(err);

                if(payments) {
                    if(req.body.status === "successful") {
                        User.updateOne({email: req.body.customer.email}, {$inc: {balance: req.body.amount}}, (err, updated) => {
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
        else {
            console.log("Hashe and secret don't match.", secret, hash);
        }

        res.sendStatus(200);
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
                    if(update.nModified > 0){
                        BookingJournal.findOneAndUpdate({"booking.bookingstatus": "Pending"}, 
                            {$set: {"booking.bookingstatus": "Concluded"}
                        }, {new: true},  (err, concluded) => {
                            if(err) return res.json({status: false, data: "finding booking error: " + err});

                            if(concluded) {
                                mailer.sendBookingCancelledMail(user.fullname, req.body.email);
                                return res.json({status: true, data: "Updated"});
                            }
                            else {
                                return res.json({status: false, data: "Unable to cancel booking."})
                            }
                        })
                    }
                })
            }
        })
    });

    /*apiRouter.post("/banktransfer", (req, res) => {
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
    });*/

    return apiRouter;
};