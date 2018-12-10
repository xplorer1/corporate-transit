let mailer = require('../utils/mail');
let uuid = require('node-uuid');
let User = require("../models/user");
let Complaint = require("../models/contactus");
let TransactionJournal = require("../models/transactions");
let PaymentJournal = require("../models/payment");
let BookingJournal = require("../models/bookingjournal");
let Slot = require("../models/slot");
let jwt = require('jsonwebtoken');
let config = require('../../config');
let supersecret = config.secret;
let crypto = require("crypto");
let axios = require("axios");
let bcrypt = require('bcrypt-nodejs');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');

let corporatemail = "customerservice@corporatetransit.com.ng";

module.exports =(app, express) => {
    let apiRouter = express.Router();

    apiRouter.get("/ct/confirm/:vcode", (req, res) => {
        let vcode = req.params.vcode;

        console.log("vcode: ", vcode);

        if(vcode) {
            User.findOne({vcode: vcode}, "email fullname", (err, user) => {
                if(err) return res.json({status: false, data: "Email verification error."});
                if(user) {
                    let cardnumber;

                    cardnumber = "";

                    user.verified = true;
                    user.verifiedon = new Date();
                    user.ct_cardnumber = cardnumber;
                    user.ct_cardstatus = "assigned";

                    user.save();

                    mailer.sendCardNumberMail(status.fullname, user.email, cardnumber);

                    let $ = cheerio.load(fs.readFileSync('./public/views/pages/email_activation.html'));

                    $("#user").val(user.email);

                    return res.send($.html());

                    //return res.json({status: true, data: "account_activation_successful", user: user.email, reason: "Account has been successful confirmed. User can now login."})
                }
                else {
                    return res.json({status: false, data: "account_activation_unsuccessful", reason: "Incorrect activation code entered. Advice user to check their email and verify they have not tampered with the link."})
                }
            })
        }
        console.log("NO params")
    });

    apiRouter.post("/ct/signup", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Verify your parameters"});
        if(!req.body.home) return res.json({status: false, data: "home_required", reason: "Home address not found. Verify your parameters"});
        if(!req.body.work) return res.json({status: false, data: "work_required", reason: "Workplace not found. Verify your parameters"});
        if(!req.body.phone) return res.json({status: false, data: "work_required", reason: "Phone not found. Verify your parameters"});
        if(!req.body.org) return res.json({status: false, data: "work_required", reason: "Organization not found. Verify your parameters"});
        if(!req.body.username) return res.json({status: false, data: "username_required", reason: "Username not found. Verify your parameters"});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password not found. Verify your parameters"});
        if(!req.body.fullname) return res.json({status: false, data: "fullname_required", reason: "Fullname not found. Verify your parameters"});

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
                                        mailer.sendEmailVerificationMail("http://api.corporatetransit.com.ng/api/ct/confirm/"+vcode, req.body.email);

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

    apiRouter.post("/ct/resendvcode", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Check your parameters."});

        User.findOne({email: req.body.email}, "verified", (err, status) => {
            if(err) return res.json({status: false, data: "Error" + err});

            if(!status) return res.json({status: false, data: "user_notfound", reason: "Email address was not found. Advice user to check their input and try again."});

            if(status.verified) return res.json({status: false, data: "account_activated", reason: "Account is already activated. Advice to login."});
            if(!status.verified) {
                let user = new User();
                let vcode = uuid.v4();

                user.vcode = vcode;
                user.verified = false;

                user.save((err, success) => {
                    if (err) console.log("Error saving user.");

                    if (success) {
                        mailer.sendEmailVerificationMail(vcode, req.body.email);

                        return res.json({status: true, data: "vcode_sent", reason: "Verification link has been sent to user's email address. Open account/email confirmation page.  Advice user to also check their spam folder in case they don't find it in their primary inbox."});
                    }
                })
            }
            else {
                return res.json({status: false, data: "unknown_error", reason: "An unknown error has occurred. Advice user to try again."});
            }
        })
    });

    apiRouter.post("/ct/login", (req, res) => {
        console.log("Req login: ", req.body);
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found. Verify your parameters"});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password not found. Verify your parameters"});

        //bcrypt.compare('somePassword', hash, function(err, res) { if(res) { // Passwords match } else { // Passwords don't match } });
        User.findOne({email: req.body.email, password: req.body.password}, "verified fullname username", (err, user) => {
            if(err) return res.json({status: false, data: "Error"+err});
            console.log("User: ", user);

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
                        expiresIn: 432000 // expires in 5 days
                    });

                    return res.json({status: true, data: "login_successful", reason: "Login is successful.", token: token});
                }
            }
            if(!user) {
                return res.json({status: false, data: "account_notfound", reason: "The email or password is incorrect. Advice to check and try again, or register if they have no account."});
            }
        })
    });

    apiRouter.post("/ct/forgotpassword", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email Address Required."});

        User.findOne({email: req.body.email}, "resetPasswordExpires resetpasswordtoken", (err, user) => {
            if(err) return res.json({status: false, data: "Database error."+err});
            if(!user) return res.json({status: false, data: "user_notfound", reason: "The email entered does not match any account. Advice to verify their input and try again or register."});
            if(user) {
                let resettoken = crypto.randomBytes(20, (err, buffer) => {
                    return buffer.toString('hex');
                });

                /*jwt.sign({
                    email: user.req.body.email,
                }, supersecret, {
                    expiresIn: 360 // expires in 1 hour
                });*/

                user.resetPasswordExpires = Date.now() + 3600000;
                user.resetpasswordtoken = resettoken;

                user.save(function(err) {
                    console.log("Error saving reset password expiry date ", err);
                });

                mailer.sendPasswordResetMail(user.fullname, req.body.email, "https://corporatetransit.com/resetpassword/"+resettoken);
                return res.json({status: true, data: "password_resetlink_sent", reason: "Password reset link to user's email address.", resettoken: resettoken});
            }
        })
    });

    apiRouter.get("/ct/reset/:token", (req, res) => {
        let token = req.params.token;

        User.findOne({resetpasswordtoken: token, resetpasswordexpires: { $gt: Date.now() }}, (err, valid) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again."});
            if(!valid) return res.json({status: false, data: "invalid_token", reason: "Password reset token invalid."});

            if(valid) {
                console.log("Password reset page send!");
                return res.send("https://corporatetransit.com/resetpassword.html/"+req.params.token);
                //reply user with page to reset password.
            }
            else {
                console.log("Password reset token expired.");
                return res.send("https://corporatetransit.com/token-expired.html");
            }
        })
    });

    apiRouter.post("/ct/resetpassword", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email Required."});
        if(!req.body.token) return res.json({status: false, data: "token_required", reason: "Token required."});
        if(!req.body.password) return res.json({status: false, data: "password_required", reason: "Password Required."});

        User.findOne({resetpasswordtoken: req.body.token, resetpasswordexpires: { $gt: Date.now() }}, "fullname", function(err, user) {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again."});
            if(!user) return res.json({status: false, data: "Password reset token invalid or has expired. Advice user to try again."});
            if(user) {

                user.password = req.body.password;
                user.resetpasswordtoken = undefined;
                user.resetpasswordexpires = undefined;

                user.save(err => console.log("err saving new password: ", err));

                mailer.sendPasswordChangedMail(user.fullname, req.body.email);

                return res.json({status: true, data: "password_change_successful", reason: "Password Successfully Changed."});
            }
        })
    });

    //for routes that must be authenticated.
    /*apiRouter.use((req, res, next) => {
        // check header or url parameters or post parameters for token
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        // decode token
        if (token) {
            jwt.verify(token, supersecret, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return res.status(403).send({ success: false, message: 'Token expired.' });
                    } else {
                        return res.json({ success: false, message: 'Failed to authenticate token.' });
                    }
                } else {
                    // if everything is good, save to request for use in other routes
                    delete decoded.iat;
                    delete decoded.exp;
                    req.decoded = decoded;

                    next(); // make sure we go to the next routes and don't stop here
                }
            });
        } else {
            // if there is no token
            // return an HTTP response of 403 (access forbidden[…]
            return res.status(403).send({ success: false, message: 'No token provided.' });
        }
    });*/

    apiRouter.post("/ct/booking",(req, res) => { //check token
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!req.body.ct_cardnumber) return res.json({status: false, data: "ct_cardnumber_required", reason: "Corporate Transit card number required."});
        if(!req.body.route) return res.json({status: false, data: "booking_route_required", reason: "Booking route not supplied."});
        if(!req.body.bookingtype) return res.json({status: false, data: "booking_type_required", reason: "Booking type not supplied."});
        if(!req.body.frequency) return res.json({status: false, data: "booking_frequency_required", reason: "Booking frequency not supplied."});
        if(!req.body.from) return res.json({status: false, data: "booking_departurepoint_required", reason: "Booking departure point not supplied."});
        if(!req.body.to) return res.json({status: false, data: "booking_destination_required", reason: "Booking destination not supplied."});

        let id = uuid.v4();

        let bookingid = req.body.ct_cardnumber+"_"+id;

        jwt.verify(token, supersecret, function (err, decoded) {
            console.log("Decoded: ", decoded);

            if (err) {
                return res.sendFile('index.html');
            }
            else {
                User.findOne({email: decoded.email}, function(err, user) {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!user) return res.json({status: false, data: "user_not_found", reason: "User with email address not registered."});

                    if(user) {
                        //{ $set: { queue: [], queuecount: 0 }}
                        Slot.findOneAndUpdate({slotcount: {$lt: 30}, 'users.email': {$ne: decoded.email}}, {$push: {"users": {email: decoded.email}, added: new Date()}, $inc: {slotcount: 1}, availableseats: -1}, {new: true}, (err, docs) =>{
                            if(err) console.log("err: ", err);
                            console.log("docs", docs);
                            if(docs) {
                                let bookingjournal = new BookingJournal();

                                bookingjournal.email = decoded.email;
                                bookingjournal.booking.route = req.body.route;
                                bookingjournal.booking.frequency = req.body.frequency;
                                bookingjournal.booking.bookingid = bookingid;
                                bookingjournal.booking.bookedon = new Date();
                                bookingjournal.booking.from = req.body.from;
                                bookingjournal.booking.status = "Pending";
                                bookingjournal.booking.to = req.body.to;
                                bookingjournal.booking.ct_cardnumber = req.body.ct_cardnumber;

                                bookingjournal.save(err => {
                                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                                    mailer.sendSuccessfulBookingMail(user.fullname, req.body.email);

                                    return res.json({status: true, data: "booking_successful.", reason: "Booking is successful."})
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    apiRouter.post("/ct/bookingcancellation", (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        jwt.verify(token, supersecret, function (err, decoded) {
            console.log("Decoded: ", decoded);

            if (err) {
                return res.sendFile('index.html');
            }
            else {
                User.findOne({email: decoded.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!client) return res.json({status: false, data: "user_not_found", reason: "No account with that email address was found."});

                    if(client) {
                        BookingJournal.find({email: decoded.email}, "bookingtype route bookingid from to", (err, bookings) => {
                            if(err) return res.json({status: false, data: err});

                            if(!bookings) return res.json({status: false, data: "no_bookings", reason: "User has no bookings."});

                            if(bookings) {
                                return res.json({status: true, data: bookings, reason: "Bookings found."});
                            }
                        })
                    }
                });
            }
        });
    });

    apiRouter.post("/ct/cancelbooking", (req, res) => {
        if(!req.body.bookingid) return res.json({status: false, data: "bookingid_required", reason: "No booking id supplied."});
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        jwt.verify(token, supersecret, function (err, decoded) {
            console.log("Decoded: ", decoded);

            if (err) {
                return res.sendFile('index.html');
            }
            else {
                User.findOne({email: decoded.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

                    if(!client) return res.json({status: false, data: "user_not_found", reason: "No account with that email address was found."});

                    if(client) {
                        BookingJournal.findOne({email: decoded.email}, (err, user) => {
                            if(err) return res.json({status: false, data: err});
                            if(!user) return res.json({status: false, data: "User has no existing bookings."});
                            if(user) {

                                BookingJournal.findOneAndUpdate({"booking.bookingid": req.body.bookingid}, {
                                    $set: {"booking.bookingstatus": "Cancelled"}
                                }, {new: true},  (err, booking) => {
                                    if(err) return res.json({status: false, data: err});
                                    console.log("Booking Cancellation: ", booking);

                                    if(booking) {
                                        if(err) return res.json({status: false, data: err});

                                        if(!client) return res.json({status: false, data: "Problem cancelling booking. Client email not found."});

                                        if(client) {

                                            Slot.update({"users.email": decoded.email}, {
                                                $inc: {slotcount: -1, availableseats: 1},
                                            $pull: {"users": decoded.email}}, {new: true}, (err, status) => {
                                                if (err) return res.json({status: false, data: err});

                                                if(status) {
                                                    mailer.sendBookingCancelledMail(decoded.fullname, decoded.email);
                                                    return res.json({status: true, data: "Booking Cancellation Successful."});
                                                }
                                            });
                                        }
                                    }
                                    else {
                                        return res.json({status: false, data: "Unable to cancel booking."})
                                    }
                                })
                            }
                        })
                    }
                });
            }
        });
    });

    apiRouter.post("/ct/paymenthistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});

        User.findOne({email: req.body.email}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                PaymentJournal.find({}, (err, history) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(history) {
                        console.log("Payment History: ", history);
                        return res.json({status: true, data: history})
                    }
                });
            }
        });
    });

    apiRouter.post("/ct/transactionhistory", (req, res) => {
        if(!req.body.email) res.json({status: false, data: "email_required", reason: "Email not found."});

        User.findOne({email: req.body.email}, (err, client) => {
            if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
            if(!client) return res.json({status: false, data: "user_notfound", reason: "No account found for that email address."});

            if(client) {
                TransactionJournal.find({}, (err, history) => {
                    if(err) return res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});
                    if(history) {
                        console.log("Transaction History: ", history);
                        return res.json({status: true, data: history})
                    }
                });
            }
        });

    });

    apiRouter.post('/ct/fund_ct', (req, res) => {
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

    apiRouter.post("/ct/onlineinstant", (req, res) => {  //come back later and save this to transaction and payment.
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email required."});
        if(!req.body.amount) return res.json({status: false, data: "amount_required", reason: "Amount to pay supplied."});
        if(!req.body.bankcode) return res.json({status: false, data: "bankcode_required", reason: "Bank Code Required"});
        if(!req.body.account_number) return res.json({status: false, data: "account_number_required", reason: "Account Number Required."});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) res.json({status: false, data: "Error pulling payment history."});

            if(!user) return res.json({status: false, data: "user_notfound", reason: "Account with email not found."});

            if(user) {
                axios.post("https://api.paystack.co/charge", {
                    email: req.body.email,
                    amount: req.body.amount,
                    bank: {
                        code: req.body.bankcode,
                        account_number: req.body.account_number
                    },
                    "headers": {
                        "Authorization": "Bearer sk_test_625a6940222e312c4529a248db6aeefaeea7d2f1",
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    if(response.status === "pending") return res.json({status: false, data: "pending", reason: "Transaction is being processed."});
                    if(response.status === "timeout") return res.json({status: false, data: "failed", reason: "Transaction has failed. Please try again."});
                    if(response.status === "success") {
                        axios.get("https://api.paystack.co/transaction/verify/DG4uishudoq90LD").then(function(response) {
                            if(response.status) {
                                CT_wallet.findOneAndUpdate({email: req.body.email}, {$inc: {balance: req.body.amount}}, (err, balance) => {
                                    if(err) res.json({status: false, data: "Error pulling payment history."});

                                    return res.json({status: true, data: "successful", reason: "Transaction is successful.", balance: balance});
                                });
                            }
                            else {
                                console.log("Response: ", response);
                            }
                        }).catch(err => {
                            console.log("Error: ", err);
                        });
                    }
                    if(response.status === "send_birthday") return res.json({status: false, data: "send_birthday", reason: "Customer's birthday is needed to complete the transaction."});
                    if(response.status === "send_otp") return res.json({status: false, data: "send_otp", reason: "Paystack needs OTP from customer to complete the transaction."});
                    if(response.status === "failed") return res.json({status: false, data: "failed", reason: "Transaction failed."});
                    if(response.status === "false ") {
                        console.log("False status: ", response.data);
                        return res.json({status: false, data: "Transaction is being processed."});
                    }
                }).catch(err => {
                    console.log("Bank transfer: ", err);
                    return res.json({status: false, data: "Error", reason: "An Error has occurred."+err})
                })
            }
        });
    });

    apiRouter.post("/ct/payviaussd", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email required."});
        if(!req.body.amount) return res.json({status: false, data: "amount_required", reason: "Amount to pay supplied."});

        let secret = "sk_test_625a6940222e312c4529a248db6aeefaeea7d2f1";

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) res.json({status: false, data: "db_error", reason: "Advice user to try again."});

            if(!user) return res.json({status: false, data: "user_notfound", reason: "Email not registered."});

            if(user) {
                axios.post("https://api.paystack.co/charge", {
                    email: req.body.email,
                    amount: req.body.amount,
                    ussd: {
                        type: "737"
                    },
                    "headers": {
                        "Authorization": "Bearer sk_test_625a6940222e312c4529a248db6aeefaeea7d2f1",
                        "Content-Type": "application/json"
                    }
                }).then(response => {
                    if(response.status === true) {

                        let id = crypto.randomBytes(20, (err, buffer) => {
                            return buffer.toString('hex');
                        });

                        let payment = new PaymentJournal();

                        payment.paymentid = id;
                        payment.paymenttype = "Ussd";
                        payment.amount = req.body.amount;
                        payment.success = new Date();

                        payment.save((err, success) => {
                            if(err) return res.json({status: false, data: "Error saving payment."});

                            let transaction = new TransactionJournal();

                            transaction.paymentid = id;
                            transaction.paymenttype = "Ussd";
                            transaction.amount = req.body.amount;
                            transaction.success = true;
                            transaction.success = new Date();

                            transaction.save((err, success) => {
                                if(err) return res.json({status: false, data: "Error saving transaction."});
                                if(success) return res.json({status: true, ussd_code: response.ussd_code, data: "Please dial "+response.ussd_code+" on your mobile phone to complete the transaction."})
                            });
                        });
                    }
                    else {
                        console.log("Response: ", response);
                    }
                }).catch(err => {
                    console.log("Error here: ", err);

                    let id = crypto.randomBytes(20, (err, buffer) => {
                        return buffer.toString('hex');
                    });

                    let payment = new PaymentJournal();

                    payment.paymentid = id;
                    payment.paymenttype = "ussd";
                    payment.amount = req.body.amount;
                    payment.success = new Date();

                    payment.save(err => {
                        if(err) return res.json({status: false, data: "Error saving payment."});

                        console.log("Bank transfer: ", err);
                        return res.json({status: false, data: err});
                    });
                })
            }
        });
    });

    apiRouter.post("/ct/contactus", (req, res) => {
        if(!req.body.name) return res.json({status: false, data: "name_required", reason: "Name not supplied."});
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email not supplied."});
        if(!req.body.complaint) return res.json({status: false, data: "complaint_required", reason: "Complaint body not supplied."});

        User.findOne({email: req.body.email}, "fullname", (err, user) => {
            if(err) res.json({status: false, data: "db_error", reason: "Database error. Advice user to try again later."});

            if(user) {
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
            }
            if(!user) return res.json({status: false, data: "user_notfound", reason: "No account with that email address was found."})
        });
    });

    apiRouter.post("/ct/payevents", (req, res) => {
        let secret = "sk_test_625a6940222e312c4529a248db6aeefaeea7d2f1";
        let hash = crypto.createHmac('sha512', config.secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            let req = req.body;

            console.log("Request paystack: ", request);

            if(!req.body.email) return res.json({status: false, data: "Email not found."});
            if(!req.body.reference) return res.json({status: false, data: "Reference missing."});
            // Retrieve the request's body
            // Do something with event

            PaymentJournal.find({ paymentid: req.body.reference, success: false }, function(err, payments) {
                console.log("Payments: ", payments);

                if (err) console.log(err);

                if(req.body.status === "success"){
                    payments.forEach(function(ctp){
                        if(ctp.total * 100 <= Number(event.data.amount)){
                            ctp.success = true;
                            ctp.save(function(err){
                                if(!err){
                                    User.findOne({payments: ctp.cid}, function(err, payamount){
                                        if(!err && payamount){
                                            payamount.balance = payamount.balance + ctp.amount;
                                            payamount.save();
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

            // paystack.transactions.verify(req.body.reference, function(error, body) {
            //     console.log(error);
            //     console.log(body);
            // });

            return res.sendStatus(200);
        }
    });

    apiRouter.post("/ct/cardpayment", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required", reason: "Email address not found."});
        if(!req.body.ct_cardnumber) return res.json({status: false, data: "ct_cardnumber_required", reason: "User card number not found."});
        if(!req.body.amount) return res.json({status: false, data: "amount_required", reason: "Amount user paid is required."});

    });

    apiRouter.post("/ct/banktransfer", (req, res) => {

    });

    return apiRouter;
};