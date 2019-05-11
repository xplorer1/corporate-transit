let mailer = require('../utils/mail');
let uuid = require('node-uuid');
let User = require("../models/user");
let Admin = require("../models/admin");
let Complaint = require("../models/contactus");
let PaymentJournal = require("../models/payment");
let BookingJournal = require("../models/bookingjournal");
let TransactionJournal = require("../models/transactions");
let CardNumbers = require("../models/cardnumbers");
let Routes = require("../models/routes");
let jwt = require('jsonwebtoken');
let config = require('../../config');
let adminsecret = config.adminsecret;
let crypto = require("crypto");
let fs = require('fs');
let axios = require('axios');
let moment = require('moment');

module.exports = function(app, express) {
    let adminRouter = express.Router();

    let generatePassword = () => {
        var length = 12,
            charset = "0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    let ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    adminRouter.post("/adminlogin", (req, res) => {

        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.password) return res.json({status: false, data: "password_required"});

        let totaldeposited = 0;
        let numtaken = 0;
        let num_cardpayments = 0;
        let num_bankpayments = 0;

        Admin.findOne({email: req.body.email, password: req.body.password}, {}, (err, admin) => {
            if(err) return res.json({status: false, data: "Error"+err});

            if(admin) {
                let token = jwt.sign({
                    email: req.body.email,
                }, adminsecret, {
                    expiresIn: 86400 // expires in 24 hours.
                });

                User.find({verified: true}, (err, users) => {
                    if(err) return res.json({statu: false, data: err.message});

                    if(users) {
                        let numusers = users.length;
                        let regions = [];
                        let routes = [];
                        let userregioncountarray = [];
                        let userroutecountarray = [];

                        users.forEach(key => {

                            regions.push(key.home);
                            routes.push(key.route);
                        });

                        let usersbyregion = regions.reduce(function (acc, curr) {
                            if (typeof acc[curr] == 'undefined') {
                                acc[curr] = 1;
                            } else {
                                acc[curr] += 1;
                            }

                                return acc;
                        }, {});

                        let usersbyroute = routes.reduce(function (acc, curr) {
                            if (typeof acc[curr] == 'undefined') {
                                acc[curr] = 1;
                            } else {
                                acc[curr] += 1;
                            }

                                return acc;
                        }, {});

                        Object.keys(usersbyregion).forEach(key => {
                            userregioncountarray.push({region: key, regioncount: usersbyregion[key]})
                        });

                        Object.keys(usersbyroute).forEach(key => {
                            userroutecountarray.push({route: key, routecount: usersbyroute[key]})
                        });

                        BookingJournal.find({}, (err, bookings) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(bookings) {
                                let numbookings = bookings.length;

                                PaymentJournal.find({paymentstatus: "Confirmed"}, (err, payments) => {
                                    if(err) return res.json({status: false, data: err.message});

                                    if(payments) {
                                        payments.forEach(payment => {
                                            totaldeposited += payment.amount;

                                            if(payment.paymenttype === "Online Instant") {
                                                num_cardpayments += payment.amount;
                                            }
                                            else if(payment.paymenttype === "Bank Payment") {
                                                num_bankpayments += payment.amount;
                                            }
                                        });

                                        bookings.forEach(booking => {
                                            if(booking.booking.bookingstatus === "Concluded") {
                                                numtaken++;
                                            }
                                        });

                                        Complaint.find({}, {"subject" : 1, "email" : 1, "complaint" : 1, "status" : 1, "createdon" : 1, "reply": 1, "replyfrom" : 1}, (err, complaints) => {
                                            if(err) return res.json({status: false, data: err.message});

                                            if(complaints) {
                                                let messages = complaints;

                                                Admin.find({}, {"username" : 1, "role" : 1, "id" : 1, name: 1}, (err, admins) => {
                                                    if(err) return res.json({status: false, data: err.message});

                                                    if(admins) {
                                                        let adminobj = {};

                                                        adminobj["numusers"] = numusers;
                                                        adminobj["email"] = admin.email;
                                                        adminobj["role"] = admin.role;
                                                        adminobj["name"] = admin.name;
                                                        adminobj["numbookings"] = numbookings;
                                                        adminobj["totaldeposited"] = totaldeposited;
                                                        adminobj["numtaken"] = numtaken;
                                                        adminobj["messages"] = messages;
                                                        adminobj["admins"] = admins;
                                                        adminobj["token"] = token;
                                                        adminobj["userregioncountarray"] = userregioncountarray;
                                                        adminobj["num_bankpayments"] = num_bankpayments;
                                                        adminobj["num_cardpayments"] = num_cardpayments;
                                                        adminobj["userroutecountarray"] = userroutecountarray;

                                                        return res.json({status: true, data: "login_successful", userdata: adminobj});
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else {
                return res.json({status: false, data: "account_notfound"});
            }
        })
    });

    adminRouter.post("/deleteuser", (req, res) => {
        //remove({createdon: {$gt: new Date("2019-01-20")}})
        if(!req.body.id) return res.json({status: false, data: "id_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Admin.findOne({id: req.body.id}, (err, user) => {
                    if(err) return res.json({status: false, data: err.message});
                    console.log("user: ", user.role);

                    if(!user) {
                        return res.json({status: false, data: "account_notfound"});
                    }

                    else if (user) {
                        if (user.role === "Super User") {
                            return res.json({status: false, data: "found_superuser"});
                        }
                        else {
                            Admin.remove({id: req.body.id}, (err, deleted) => {
                                if(err) return res.json({status: false, data: err.message});

                                if(deleted) {
                                    Admin.find({}, {"username" : 1, "role" : 1, "id" : 1}, (err, admins) => {
                                        if(err) return res.json({status: false, data: err.message});

                                        if(admins) {
                                            return res.json({status: false, data: admins, message: "admin_deleted"});
                                        }
                                    })
                                }
                            })
                        }
                    }
                });
            }
        });
    });

    adminRouter.post("/adduser", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.name) return res.json({status: false, data: "name_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Admin.findOne({username: req.body.name}, (err, exists) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(exists) {
                        return res.json({status: false, data: "username_exists"});
                    }
                    else if(!exists) {
                        Admin.findOne({email: req.body.email}, (err, email_exists) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(email_exists) {
                                return res.json({status: false, data: "user_exists"});
                            }

                            else if(!email_exists) {

                                let admin = new Admin();
                                let password = generatePassword();
                                let id = ID();

                                if(id) {

                                    admin.email = req.body.email;
                                    admin.password = password;
                                    admin.role = "Admin";
                                    admin.id = id;
                                    admin.createdon = new Date();
                                    admin.superuser = false;
                                    admin.username = req.body.name.toLowerCase();

                                    admin.save((err, saved) => {
                                        if(err) return res.json({status: false, data: err.message});

                                        if(saved) {
                                            Admin.find({}, {"username" : 1, "role" : 1, "id" : 1}, (err, admins) => {
                                                if(err) return res.json({status: false, data: err.message});

                                                if(admins) {
                                                    mailer.sendAdminMail(req.body.name, req.body.email, password);
                                                    return res.json({status: true, data: "admin_saved", admins: admins});
                                                }
                                            })
                                        }
                                    });
                                }
                            }
                        })
                    }
                })
            }
            else {
                return res.json({status: false, data: "token_expired"})
            }
        });
    });

    adminRouter.post("/verifysuper", (req, res) => {
        if(!req.body.password) return res.json({status: false, data: "password_required"});
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token.trim(), adminsecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Admin.findOne({email: req.body.email, password: req.body.password.trim(), superuser: true}, (err, admin) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!admin) {
                        return res.json({status: false, data: "account_notfound"});
                    }
                    else if(admin) {
                        return res.json({status: true, data: "user_exists"});
                    }
                })
            }
            else {
                return res.json({status: false, data: "token_expired"})
            }
        });
    });

    adminRouter.post("/replymessage", (req, res) => {
        if(!req.body.id) return res.json({status: false, data: "email_required"});
        if(!req.body.replytext) return res.json({status: false, data: "replytext_required"});
        if(!req.body.subject) return res.json({status: false, data: "subject_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});
        if(!req.body.replyfrom) return res.json({status: false, data: "replyfrom_required"});

        jwt.verify(req.body.token, adminsecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Complaint.findOne({_id: req.body.id}, (err, complaint) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(complaint && complaint.status === "Replied") {
                        return res.json({status: false, data: "already_replied"});
                    }
                    else if (!complaint) {
                        return res.json({status: false, data: "no_complaint"});
                    }
                    else if(complaint && complaint.status === "Pending") {
                        Complaint.findOneAndUpdate({_id: req.body.id}, 
                            {$set: {status: "Replied", reply: req.body.replytext, replyfrom: req.body.replyfrom} }, {new: true},  (err, modified) => {
                                if(err) return res.json({status: false, data: err.message});

                                if(modified) {
                                    Complaint.find({}, {"subject" : 1, "email" : 1, "complaint" : 1, "status" : 1, "createdon" : 1, "reply": 1, "replyfrom": 1}, (err, complaints) => {
                                        if(err) return res.json({status: false, data: err.message});

                                        if(complaints) {
                                            mailer.sendReplyText(req.body.subject, complaint.email, req.body.replytext);
                                            return res.json({status: true, data: "replied", complaints: complaints});
                                        }
                                    })
                                }
                        })

                    }
                })
            }
            else {
                return res.json({status: false, data: "token_expired"})
            }
        });
    });

    adminRouter.post("/transfersuperuser", (req, res) => {
        //coming soon.
    });
    
    return adminRouter;
};