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
let Places = require("../models/places");
let Fares = require("../models/fares");
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

    adminRouter.post("/deleteadmin", (req, res) => {
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

                    if(!user) {
                        return res.json({status: false, data: "account_notfound"});
                    }

                    else if (user) {
                        if (user.role === "Super User") {
                            return res.json({status: false, data: "found_superuser"});
                        }
                        else {
                            User.deleteOne({email: user.email}, (err, userremoved) => {
                                if(err) console.log("err: ", err.message);

                                if(userremoved) {
                                    Admin.deleteOne({id: req.body.id}, (err, deleted) => {
                                        if(err) return res.json({status: false, data: err.message});

                                        if(deleted) {
                                            Admin.find({}, {"username" : 1, "role" : 1, "id" : 1}, (err, admins) => {
                                                if(err) return res.json({status: false, data: err.message});

                                                if(admins) {
                                                    return res.json({status: true, data: admins, message: "admin_deleted"});
                                                }
                                            })
                                        }
                                    })
                                }
                            });
                        }
                    }
                });
            }
        });
    });

    adminRouter.post("/disablecard", (req, res) => {
        if(!req.body.cardnumber) return res.json({status: false, data: "cardnumber_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                User.findOne({ct_cardnumber: req.body.cardnumber}, (err, user) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!user) {
                        return res.json({status: false, data: "card_notfound"});
                    }

                    else if (user) {
                        if (user.cardstatus === "disabled") {
                            return res.json({status: false, data: "card_alreadydisabled"});
                        }
                        else {
                            User.findOneAndUpdate({ct_cardnumber: req.body.cardnumber}, 
                                {$set: {cardstatus: "disabled"} }, {new: true},  (err, modified) => {
                                    if(err) return res.json({status: false, data: err.message});

                                    if(modified) {
                                        return res.json({status: true, data: "card_disabled"});
                                    }
                            })
                        }
                    }
                });
            }
        });
    });

    adminRouter.post("/changefare", (req, res) => {
        if(!req.body.token) return res.json({status: false, data: "token_required"});
        if(!req.body.route) return res.json({status: false, data: "route_required"});
        if(!req.body.fareoneway) return res.json({status: false, data: "fareoneway_required"});
        if(!req.body.farereturn) return res.json({status: false, data: "farereturn_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Routes.findOne({route: req.body.route}, (err, route) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!route) {
                        return res.json({status: false, data: "route_notfound"});
                    }
                    else if(route) {
                        Fares.findOneAndUpdate({route: req.body.route}, 
                            {$set: {farereturn: req.body.farereturn, fareoneway: req.body.fareoneway} }, 
                            {new: true},  (err, modified) => {
                                if(err) return res.json({status: false, data: err.message});

                                if(modified) {
                                    return res.json({status: true, data: "fareupdated"});
                                }
                                else {
                                    return res.json({status: false, data: "unknown_error"});
                                }
                        })
                    }
                });
            }
        });
    });

    adminRouter.post("/addroute", (req, res) => {
        if(!req.body.token) return res.json({status: false, data: "token_required"});
        if(!req.body.route) return res.json({status: false, data: "route_required"});

        if(!req.body.dep) return res.json({status: false, data: "dep_required"});
        if(!req.body.dest) return res.json({status: false, data: "dest_required"});

        if(!req.body.morningpickuptime) return res.json({status: false, data: "morningpickuptime_required"});
        if(!req.body.morningpickupplace) return res.json({status: false, data: "morningpickupplace_required"});
        if(!req.body.eveningpickuptime) return res.json({status: false, data: "eveningpickuptime_required"});
        if(!req.body.eveningpickupplace) return res.json({status: false, data: "eveningpickupplace_required"});

        if(!req.body.morningdroptime) return res.json({status: false, data: "morningdroptime_required"});
        if(!req.body.morningdropplace) return res.json({status: false, data: "morningdropplace_required"});
        if(!req.body.eveningdroptime) return res.json({status: false, data: "eveningdroptime_required"});
        if(!req.body.eveningdropplace) return res.json({status: false, data: "eveningdropplace_required"});

        if(!req.body.fareoneway) return res.json({status: false, data: "fareoneway_required"});
        if(!req.body.farereturn) return res.json({status: false, data: "farereturn_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Routes.findOne({route: req.body.route}, (err, route) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(route) {
                        return res.json({status: false, data: "route_exists"});
                    }
                    else if(!route) {
                        let rou = new Routes();

                        rou.route = req.body.route;

                        rou.pickup_morning.time = req.body.morningpickuptime;
                        rou.pickup_morning.point = req.body.morningpickupplace;

                        rou.pickup_evening.time = req.body.eveningpickuptime;
                        rou.pickup_evening.point = req.body.eveningpickupplace;

                        rou.drop_morning.time = req.body.morningdroptime;
                        rou.drop_morning.point = req.body.morningdropplace;

                        rou.drop_evening.time = req.body.eveningdroptime;
                        rou.drop_evening.point = req.body.eveningdropplace;

                        rou.save((err, routessaved) => {

                            if(err) return res.json({status: false, data: err.message});

                            if(routessaved) {
                                let fare = new Fares();

                                fare.route = req.body.route;
                                fare.fareoneway = req.body.fareoneway;
                                fare.farereturn = req.body.farereturn;
 
                                fare.save((err, faresaved) => {

                                    if(err) return res.json({status: false, data: err.message});

                                    if(faresaved) {

                                        Places.update({}, {$push: {"home": req.body.dep.toUpperCase(), "work": req.body.dest.toUpperCase()}}, {new: true}, (err, updated) => {
                                            if(err) console.log("err: ", err.message);

                                            if(updated.nModified) {
                                                console.log("saved!");
                                                return res.json({status: true, data: "stuffsaved"});
                                            }
                                            else {
                                                console.log("update query wrong.");
                                            }
                                        });
                                    }
                                    else {
                                        return res.json({status: false, data: "unknown_error2"});
                                    }
                                })
                            }
                            else {
                                return res.json({status: false, data: "unknown_error1"});
                            }
                        })
                    }
                })
            }
        });
    });

    adminRouter.post("/enablecard", (req, res) => {
        if(!req.body.cardnumber) return res.json({status: false, data: "cardnumber_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, adminsecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                User.findOne({ct_cardnumber: req.body.cardnumber}, (err, user) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!user) {
                        return res.json({status: false, data: "card_notfound"});
                    }

                    else if (user) {
                        if (user.cardstatus === "enabled") {
                            return res.json({status: false, data: "card_alreadyenabled"});
                        }
                        else {
                            User.findOneAndUpdate({ct_cardnumber: req.body.cardnumber}, 
                                {$set: {cardstatus: "enabled"} }, {new: true},  (err, modified) => {
                                    if(err) return res.json({status: false, data: err.message});

                                    if(modified) {
                                        return res.json({status: true, data: "card_enabled"});
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
                User.findOne({email: req.body.email}, (err, exists) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(exists) {
                        return res.json({status: false, data: "email_exists"});
                    }
                    else if(!exists) {
                        Admin.findOne({email: req.body.email}, (err, email_exists) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(email_exists) {
                                return res.json({status: false, data: "user_exists"});
                            }

                            else if(!email_exists) {

                                let admin = new Admin();
                                let user = new User();
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

                                            user.email = req.body.email;
                                            user.password = password;
                                            user.role = "admin";

                                            user.save((err, usersaved) => {
                                                if(err) return res.json({status: false, data: err.message});

                                                if(usersaved) {
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

    adminRouter.post("/viewusers", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, adminsecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Admin.findOne({email: req.body.email, superuser: true}, (err, admin) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!admin) {
                        return res.json({status: false, data: "account_notfound"});
                    }
                    else if(admin) {
                        User.find({}, {"email" : 1, "role" : 1, "verified": true}, (err, users) => {
                            if(err) console.log("err: ", err.message);

                            if(users) {
                                let individuals = [];
                                let companies = [];
                                let motherarray = [];
                                let userobject = {};

                                users.forEach(user => {
                                    if(user.role === "individual") {
                                        individuals.push(user.email);
                                    }

                                    if(user.role === "company") {
                                        companies.push(user.email);
                                    }
                                });

                                individuals.forEach(email => {
                                    console.log("email: ", email);

                                    Individual.findOne({email: email}, {"fullname": 1, "email" : 1, "work" : 1, "org" : 1, "ct_cardnumber" : 1, "home": 1, "balance" : 1}, (err, user) => {
                                        if(err) console.log("err: ", err.message);

                                        if(user) {
                                            console.log("user: ", user);
                                            userobject["individual"] = user;
                                        }
                                    });
                                });

                                companies.forEach(email => {
                                    console.log("email: ", email);

                                    Company.findOne({email: email}, {"companyname": 1, "email" : 1, "office_location" : 1, "employeescount" : 1, "ct_cardnumber" : 1, "balance" : 1}, (err, user) => {
                                        if(err) console.log("err: ", err.message);

                                        if(user) {
                                            console.log("user: ", user);
                                            userobject["company"] = user;
                                        }
                                    });
                                });

                                motherarray.push(userobject);

                                return res.json({status: true, data: motherarray});
                            }
                            else {
                                console.log("no registered user found!");
                                return res.json({status: false, data: "nouserfound"});
                            }
                        })
                    }
                    else {
                        return res.json({status: false, data: "user_notfound"});
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