let mailer = require('../utils/mail');
let uuid = require('node-uuid');
let User = require("../models/user");
let Individual = require("../models/individual");
let Admin = require("../models/admin");
let Complaint = require("../models/contactus");
let PaymentJournal = require("../models/payment");
let BookingJournal = require("../models/bookingjournal");
let TransactionJournal = require("../models/transactions");
let CardNumbers = require("../models/cardnumbers");
let CardTransactions = require("../models/cardtransactions");
let Routes = require("../models/routes");
let Places = require("../models/places");
let Company = require("../models/company");
let jwt = require('jsonwebtoken');
let config = require('../../config');
let supersecret = config.secret;
let crypto = require("crypto");
let fs = require('fs');
let axios = require('axios');
let moment = require('moment');
let storage = require('node-persist');
moment().format();

let corporatemail = "customerservice@corporatetransit.com.ng";
let BASE_URL = "https://corporatetransit.com.ng";
//let BASE_URL = "https://2b736707.ngrok.io";
//let BASE_URL = "http://127.0.0.1:8080";

module.exports =(app, express, appstorage) => {
    let apiRouter = express.Router();
    let ravepublic = "FLWPUBK-8bfe4998fd6b9ba7e26740d4959535f3-X";
    let ravesecret = "FLWSECK-6e3c53e9f283aff4c35c6b8d55bf27eb-X";
    let raveenckey = "6e3c53e9f283315642573777";

    let generatePassword = () => {
        var length = 8,
            charset = "0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    let uniqueSuffix = (id) => {
        var length = id,
            charset = "abcdefghijklmnopqrstuvwxyz",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    }

    let test = () => {
        let pl = new Places();
        pl.home = "IKEJA - IKE";
        pl.work = "IKOYI - IKO";

        pl.save();
    }

    //test();

    let getFullname = (email, role, callback) => {
        let userfullname;
        
        if(role === "individual") {
            Individual.findOne({email: email}, {"fullname": 1}, (err, name) => {
                if(err) console.log("err: ", err.message);

                if(name) {
                    callback.call(this, name.fullname);
                }
                else {
                    callback.call(this, "Ct User");
                }
            });
        }
        else if(role === "admin") {
            Admin.findOne({email: email}, {"fullname": 1}, (err, name) => {
                if(err) console.log("err: ", err.message);

                if(name) {
                    callback.call(this, name.fullname);
                }
                else {
                    callback.call(this, "Ct User");
                }
            });
        }
        else if(role === "company") {
            Company.findOne({email: email}, {"fullname": 1}, (err, name) => {
                if(err) console.log("err: ", err.message);

                if(name) {
                    callback.call(this, name.fullname);
                }
                else {
                    callback.call(this, "Ct User");
                }
            });
        }
    };

    apiRouter.get("/getplaces", (req, res) => {
        if(app.get("places")) {
            return res.json({status: true, data: app.get("places")});
        }
        else {
            Places.find({}, (err, places) => {
                
                if(err) console.log("err: ", err.message);

                if(places) {
                    app.set("places", places);
                    return res.json({status: true, data: app.get("places")});
                }
            })
        }
    });

    apiRouter.post("/confirm", (req, res) => {
        let vcode = req.body.token;

        if(vcode) {
            User.findOne({vcode: vcode}, (err, user) => {
                if(err) return res.json({status: false, data: err.message});

                if(user) {

                    if(user.verified) {
                        return res.json({status: false, data: "account_activated"});
                    }

                    if(!user.verified) {
                        
                        User.updateOne({email: user.email}, {
                            $set: {
                                verified: true,
                                verifiedon: new Date()
                            }
                        }, (err, verified) => {
                            if (err) return res.json({status: false, data: err});

                            if (verified.nModified === 1) {

                                getFullname(user.email, user.role, (name) => {
                                    if(!name) {
                                        name = "CT User";
                                    }
                                    mailer.sendEmailConfirmedMail(name, user.email);

                                    return res.json({status: true, data: "Verified", user: user.email});
                                });
                            }
                            else {
                                return res.json({status: false, data: "There has been a problem."})
                            }
                        });
                    }
                }
            })
        }
        else {
            console.log("url not familiar.");
            return res.sendFile('views/pages/notfound.html', {root: './public'});
        }
    });

    apiRouter.post("/companysignup", (req, res) => {

        if(!req.body.companyname) return res.json({status: false, data: "companyname_required"});
        if(!req.body.officelocation) return res.json({status: false, data: "offlice_location_required"});
        if(!req.body.companyphone) return res.json({status: false, data: "companyphone_required"});
        if(!req.body.companyemail) return res.json({status: false, data: "companyemail_required"});
        if(!req.body.employeesno) return res.json({status: false, data: "employeesno_required"});
        if(!req.body.password) return res.json({status: false, data: "password_required"});
        if(!req.body.routefrom) return res.json({status: false, data: "routefrom_required"});
        if(!req.body.routeto) return res.json({status: false, data: "routeto_required"});

        User.findOne({email: req.body.companyemail}, function(err, email) {
            if(err) return res.json({status: false, data: err.message});

            console.log("emaiil: ", email);

            if(email) return res.json({status: false, data: "email_exists"});

            if(!email) {
                Company.findOne({phone: req.body.companyphone}, (err, phone) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(phone) return res.json({status: false, data: "phone_exists"});

                    if(!phone) {

                        let company = new Company();
                        let user = new User();
                        let vcode = uuid.v4();

                        company.email = req.body.companyemail;
                        company.office_location = req.body.officelocation;
                        company.phone = req.body.companyphone;
                        company.route = req.body.routefrom + " To " + req.body.routeto;
                        company.companyname = req.body.companyname;
                        company.password = req.body.password;
                        company.employeescount = req.body.employeesno;
                        company.role = "company";

                        user.email = req.body.companyemail;
                        user.password = req.body.password;
                        user.role = "company";
                        user.createdon = new Date();
                        user.vcode = vcode;
                        user.verified = false;

                        company.save((err, success) => {
                            if(err) console.log("Error saving user: ", err.message);

                            if(success) {

                                user.save((err, success) => {
                                    if(err) console.log("err: ", err.message);

                                    if(success) {
                                        mailer.sendEmailVerificationMail(req.body.companyname, BASE_URL+"/verify/"+vcode, req.body.companyemail);

                                        return res.json({status: true, data: "signup_successful"})
                                    }
                                });
                            }
                            else {
                                return res.json({status: false, data: "unknown_error"})
                            }
                        });
                    }
                });
            }
            else {
                return res.json({status: false, data: "unknown_error"})
            }
        });
    });

    apiRouter.post("/signup", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.home) return res.json({status: false, data: "home_required"});
        if(!req.body.work) return res.json({status: false, data: "work_required"});
        if(!req.body.phone) return res.json({status: false, data: "work_required"});
        if(!req.body.org) return res.json({status: false, data: "org_required"});
        if(!req.body.username) return res.json({status: false, data: "username_required"});
        if(!req.body.password) return res.json({status: false, data: "password_required"});
        if(!req.body.fullname) return res.json({status: false, data: "fullname_required"});
        if(!req.body.gender) return res.json({status: false, data: "gender_required"});

        Individual.findOne({username: req.body.username.toLowerCase()}, function(err, username) {
            if(err) return res.json({status: false, data: err});

            if(username) return res.json({status: false, data: "username_exists"});

            if(!username) {
                User.findOne({email: req.body.email}, function(err, email) {
                    if(err) return res.json({status: false, data: "db_error."});

                    if(email) return res.json({status: false, data: "email_exists"});

                    if(!email) {
                        Individual.findOne({phone: req.body.phone}, (err, phone) => {
                            if(err) return res.json({status: false, data: "db_error."});

                            if(phone) return res.json({status: false, data: "phone_exists"});

                            if(!phone) {
                                let user = new User();
                                let ind = new Individual();
                                let vcode = uuid.v4();

                                ind.work = req.body.work;
                                ind.home = req.body.home;
                                ind.route = req.body.home + " To " + req.body.work;
                                ind.gender = req.body.gender;
                                ind.password = req.body.password;
                                ind.org = req.body.org;
                                ind.email = req.body.email;
                                ind.phone = req.body.phone;
                                ind.username = req.body.username;
                                ind.fullname = req.body.fullname;

                                user.email = req.body.email;
                                user.password = req.body.password;
                                user.role = "individual";
                                user.createdon = new Date();
                                user.vcode = vcode;
                                user.verified = false;

                                user.save((err, success) => {
                                    if(err) console.log("Error saving user: ", err.message);

                                    if(success) {
                                        ind.save((err, success) => {
                                            if(err) console.log("err: ", err.message);

                                            mailer.sendEmailVerificationMail(req.body.fullname.split(" ")[0], BASE_URL+"/verify/"+vcode, req.body.email);

                                            return res.json({status: true, data: "signup_successful"});
                                        });
                                    }
                                    else {
                                        return res.json({status: false, data: "unknown_error"})
                                    }
                                });
                            }
                        });
                    }
                    else {
                        return res.json({status: false, data: "unknown_error"})
                    }
                });
            }
        })
    });

    apiRouter.post("/resendvcode", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});

        User.findOne({email: req.body.email}, "fullname verified", (err, status) => {
            if(err) return res.json({status: false, data: "Error" + err});

            if(!status) return res.json({status: false, data: "user_notfound"});

            if(status.verified) return res.json({status: false, data: "account_activated"});
            
            if(!status.verified) {
                let vcode = jwt.sign({
                    email: req.body.email,
                    }, supersecret, {
                        expiresIn: 360 // expires in 1 hour
                    }
                );

                User.update({email: req.body.email}, {$set: {vcode: vcode, verified: false}}, (err, user) => {

                    if (err) {
                        console.log("Error saving user.");

                        return res.json({status: false, data: err})
                    }
                    if(user) {
                        getFullname(status.email, status.role, (name) => {
                            if(!name) {
                                name = "CT User";
                            }

                            mailer.sendEmailVerificationMail(name, BASE_URL+"/verify/"+vcode, req.body.email);

                            return res.json({status: true, data: "vcode_sent"});
                        });
                    }
                });
            }
            else {
                return res.json({status: false, data: "unknown_error", reason: "An unknown error has occurred. Advice user to try again."});
            }
        })
    });

    apiRouter.post("/updatedetails", (req, res) => {
        let token = req.body.token;
        if(!token) return res.json({status: false, data: "token_required"});

        let updateIndividual = () => {
            Individual.findOne({email: req.body.old}, (err, ind) => {
                if(err) console.log("err: ", err.message);

                if(ind) {
                    Individual.updateOne({email: req.body.old}, {
                        $set: {
                            email: req.body.email || ind.email,
                            phone: req.body.phone || ind.phone,
                            username: req.body.username || ind.username,
                            work: req.body.work || ind.work,
                            home: req.body.home || ind.home,
                            org: req.body.org || ind.org,
                            fullname: req.body.fullname || ind.fullname
                        }
                    }, 
                    (err, updated) => {
                        if (err) return res.json({status: false, data: err});

                        if(updated) {

                            User.updateOne({email: req.body.old}, {
                                $set: {
                                    email: req.body.email || user.email,
                                }
                            }, (err, userupdated) => {
                                if(err) return res.json({status: false, data: err});

                                if(userupdated) {
                                    return res.json({status: true, data: "updated"});
                                }
                            })
                        }
                        else {
                            return res.json({status: false, data: "unknown_error"});
                        }
                    })
                }
            });
        }

        let updateCompany = () => {
            Company.findOne({email: req.body.old}, (err, com) => {
                if(err) console.log("err: ", err.message);

                if(com) {
                    Company.updateOne({email: req.body.old}, {
                        $set: {
                            email: req.body.email || com.email,
                            phone: req.body.phone || com.phone,
                            companyname: req.body.companyname || com.companyname,
                            employeescount: req.body.employeescount || com.employeescount,
                        }
                    }, 
                    (err, updated) => {
                        console.log('updated: ', updated);

                        if (err) return res.json({status: false, data: err});

                        if(updated) {

                            User.updateOne({email: req.body.old}, {
                                $set: {
                                    email: req.body.email || com.email,
                                }
                            }, (err, userupdated) => {
                                if(err) return res.json({status: false, data: err});

                                if(userupdated) {
                                    return res.json({status: true, data: "updated"});
                                }
                            })
                        }
                        else {
                            return res.json({status: false, data: "unknown_error"});
                        }
                    })
                }
            });
        }

        let updateAdmin = () => {
            //update admin details
        }

        jwt.verify(req.body.token, supersecret, function (err, decoded) {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                console.log("check1")
                User.findOne({email: req.body.old}, (err, user) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(user) {
                        console.log("check2: ", user.role);
                        switch (user.role) {
                            case "individual":
                                updateIndividual();
                                break;
                            case "company":
                                updateCompany();
                                break;
                            case "admin":
                                updateAdmin();
                                break;
                        }
                    }
                    else {
                        return res.json({status: false, data: "account_notfound"});
                    }
                })
            }
        });
    });

    apiRouter.post("/resendresetcode", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) return res.json({status: false, data: err.message});

            if(!user) return res.json({status: false, data: "user_notfound"});

            if(user) {

                let expirydate = new Date() + 3600000;
                let resettoken = jwt.sign({
                    email: req.body.email,
                    }, supersecret, {
                        expiresIn: 360 // expires in 1 hour
                    }
                );

                User.findOneAndUpdate({email: req.body.email}, {$set: {resetpasswordtoken: resettoken, resetpasswordexpires: expirydate}}, (err, reset) => {
                    if(err) console.log("err: ", err);

                    if(reset) {
                        getFullname(req.body.email, user.role, (name) => {
                            if(!name) {
                                name = "Ct User";
                            }

                            mailer.sendPasswordResetMail(name, req.body.email, BASE_URL+"/reset/"+resettoken);
                            return res.json({status: true, data: "password_resetlink_sent", resettoken: resettoken});
                        });
                    }
                    else {
                        return res.json({status: false, data: "user_notfound"});
                    }
                });
            }
        })
    });

    apiRouter.post("/login", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.password) return res.json({status: false, data: "password_required"});

        User.findOne({email: req.body.email, password: req.body.password}, (err, user) => {
            if(err) return res.json({status: false, data: err.message});

            if(!user) {
                return res.json({status: false, data: "account_notfound"});
            }

            //let validpassword = user.comparePassword(req.body.password);

            //if(!validpassword) {
                //return res.json({status: false, data: "account_notfound"});
            //}
            //else {
                if(!user.verified) {
                    let vcode = uuid.v4();

                    User.update({email: req.body.email}, {$set: {vcode: vcode, verified: false}}, (err, u) => {

                        if (err) {
                            return res.json({status: false, data: err.message});
                        }
                        if(u.nModified > 0) {
                            getFullname(req.body.email, user.role, (name) => {
                                if(!name) {
                                    name = "Ct User";
                                }

                                mailer.sendEmailVerificationMail(name, BASE_URL+"/verify/"+vcode, req.body.email);

                                return res.json({status: false, data: "not_activated"});
                            });
                        }
                    });
                }
                else if(user.cardstatus === "disabled") {
                    return res.json({status: false, data: "carddisabled"});
                }
                else if(user.role === "individual") {

                    Individual.findOne({email: req.body.email}, (err, ind) => {
                        if(err) console.log("err: ", err.message);

                        if(ind) {
                            let token = jwt.sign({
                                email: req.body.email,
                            }, supersecret, {
                                expiresIn: 86400 // expires in 24 hours.
                            });

                            let totaldeposited = 0;
                            let numtaken = 0;
                            let pendingtrip;
                            let num_cardpayments = 0;
                            let num_bankpayments = 0;

                            PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed"}, (err, paid) => {
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

                                            let rou = ind.route.split("To");

                                            let rou1 = rou[0].split(' - ')[1].trim();
                                            let rou2 = rou[1].split(' - ')[1].trim();

                                            Routes.findOne({route: rou1 +" - "+ rou2}, (err, routeinfo) => {
                                                if(err) console.log("err: ", err.message);

                                                userobj.balance = ind.balance;
                                                userobj.email = ind.email;
                                                userobj.fullname = ind.fullname;
                                                userobj.username = ind.username;
                                                userobj.cardnumber = user.ct_cardnumber;
                                                userobj.phone = ind.phone;
                                                userobj.work = ind.work;
                                                userobj.home = ind.home;
                                                userobj.org = ind.org;
                                                userobj.routeinfo = routeinfo;
                                                userobj.role = user.role;
                                                userobj.token = token;
                                                userobj.totaldeposited = totaldeposited;
                                                userobj.numtrips = bookings.length;
                                                userobj.numtaken = numtaken;
                                                userobj.latestbooking = pendingtrip;
                                                userobj.num_bankpayments = num_bankpayments;
                                                userobj.num_cardpayments = num_cardpayments;

                                                return res.json({status: true, data: "login_successful", user: userobj});

                                            });
                                        }
                                    })
                                }
                            });
                        }
                    });
                }
                else if(user.role === "company") {
                    Company.findOne({email: req.body.email}, (err, com) => {
                        if(err) console.log("err: ", err.message);

                        if(com) {
                            let token = jwt.sign({
                                email: req.body.email,
                            }, supersecret, {
                                expiresIn: 86400 // expires in 24 hours.
                            });

                            let totaldeposited = 0;
                            let numtaken = 0;
                            let pendingtrip;
                            let num_cardpayments = 0;
                            let num_bankpayments = 0;

                            PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed"}, (err, paid) => {
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

                                            let rou = com.route.split("To");

                                            let rou1 = rou[0].split(' - ')[1].trim();
                                            let rou2 = rou[1].split(' - ')[1].trim();

                                            Routes.findOne({route: rou1 +" - "+ rou2}, (err, routeinfo) => {
                                                if(err) console.log("err: ", err.message);

                                                let latestbooking = sortedbooking[0];

                                                let userobj = {};

                                                userobj.balance = com.balance;
                                                userobj.email = com.email;
                                                userobj.phone = com.phone;
                                                userobj.employeescount = com.employeescount;
                                                userobj.companyname = com.companyname;
                                                userobj.cardnumber = user.ct_cardnumber;
                                                userobj.route = com.route;
                                                userobj.routeinfo = routeinfo;
                                                userobj.token = token;
                                                userobj.role = user.role;
                                                userobj.totaldeposited = totaldeposited;
                                                userobj.numtrips = bookings.length;
                                                userobj.numtaken = numtaken;
                                                userobj.latestbooking = pendingtrip;
                                                userobj.num_bankpayments = num_bankpayments;
                                                userobj.num_cardpayments = num_cardpayments;

                                                return res.json({status: true, data: "login_successful", user: userobj});

                                            });
                                        }
                                    })
                                }
                            })
                        }
                    });
                }
                else if(user.role === "admin") {
                    let totaldeposited = 0;
                    let numtaken = 0;
                    let num_cardpayments = 0;
                    let num_bankpayments = 0;

                    let token = jwt.sign({
                        email: req.body.email,
                    }, config.adminsecret, {
                        expiresIn: 86400 // expires in 24 hours.
                    });

                    Admin.findOne({email: req.body.email, password: req.body.password}, (err, admin) => {
                        if(err) return res.json({status: false, data: "Error"+err});
                        console.log("check: ", admin.email);

                        if(admin) {
                            User.find({verified: true, role: !"admin"}, (err, users) => {
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

                                                            Admin.find({}, {"username" : 1, "role" : 1, "id" : 1, "name": 1}, (err, admins) => {
                                                                if(err) return res.json({status: false, data: err.message});

                                                                if(admins) {
                                                                    let adminobj = {};

                                                                    adminobj["numusers"] = numusers;
                                                                    adminobj["email"] = admin.email;
                                                                    adminobj["role"] = admin.role;
                                                                    adminobj["name"] = admin.fullname;
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

                                                                    return res.json({status: true, data: "login_successful", user: adminobj});
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
                                    return res.send("No Verified Users Found!");
                                }
                            })
                        }
                        else {
                            return res.json({status: false, data: "account_notfound"});
                        }
                    })
                }
            //}
        })
    });

    apiRouter.post("/forgotpassword", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});

        User.findOne({email: req.body.email}, (err, user) => {
            if(err) return res.json({status: false, data: err});

            if(!user) return res.json({status: false, data: "user_notfound"});

            if(user) {
                let token = jwt.sign({
                    email: req.body.email,
                    }, supersecret, {
                        expiresIn: 360 // expires in 1 hour
                    }
                );

                let expirydate = new Date() + 3600000;

                User.findOneAndUpdate({email: req.body.email}, {$set: {resetpasswordtoken: token, resetpasswordexpires: expirydate}}, (err, reset) => {
                    if(err) console.log("err: ", err);

                    if(reset) {

                        getFullname(req.body.email, user.role, (name) => {
                            if(!name) {
                                name = "Ct User";
                            }

                            mailer.sendPasswordResetMail(name, req.body.email, BASE_URL+"/reset/"+token);
                            return res.json({status: true, data: "password_resetlink_sent", resettoken: token});
                        });
                    }
                });
            }
        })
    });

    apiRouter.post("/checkcode", (req, res) => {
        let token = req.body.token;
        console.log("req.body: ", req.body);

        if(!token) return res.json({status: false, data: "token_required"});

        User.findOne({resetpasswordtoken: token}, (err, valid) => {
            if(err) return res.json({status: false, data: err.message});

            if(!valid) {
                return res.json({status: false, data: "invalid_token"});
            }
            if(valid) {
                return res.json({status: true, data: "token_valid"});
            }
            else {
                return res.json({status: false, data: "unknown_error"});
            }
        })
    });

    apiRouter.post("/getbalance", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});
        let totaldeposited = 0;

        jwt.verify(req.body.token, supersecret, function (err, decoded) {

            if (err) {
                console.log("err: ", err.message);
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                User.findOne({email: req.body.email}, (err, user) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!user) {
                        return res.json({status: false, data: "user_notfound"});
                    }

                    if(user) {
                        PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed"}, (err, paid) => {
                            if(err) console.log("Err: ", err.message);

                            if(paid) {
                                
                                paid.forEach(item => {
                                    totaldeposited += item.amount;
                                });

                                if(user.role === "individual") {
                                    Individual.findOne({email: req.body.email}, (err, individual) => {
                                        if(err) console.log("err: ", err.message);

                                        if(individual) {
                                            return res.json({status: true, data: individual.balance, totaldeposited: totaldeposited});
                                        }
                                    });
                                }
                                else if(user.role === "company") {
                                    Company.findOne({email: req.body.email}, (err, com) => {
                                        if(err) console.log("err: ", err.message);

                                        if(com) {
                                            return res.json({status: true, data: com.balance, totaldeposited: totaldeposited});
                                        }
                                    });
                                }
                            }
                        });
                    }
                    else {
                        return res.json({status: false, data: "unknown_error"});
                    }
                })
            }
        });
    });

    apiRouter.post("/resetpassword", (req, res) => {

        if(!req.body.token) return res.json({status: false, data: "token_required"});
        if(!req.body.password) return res.json({status: false, data: "password_required"});

        User.findOne({resetpasswordtoken: req.body.token, resetpasswordexpires: { $lt: Date.now() }}, {"fullname": 1, "email" : 1, "role": 1}, function(err, user) {
            if(err) return res.json({status: false, data: err.message});
            if(!user) return res.json({status: false, data: "token_expired"});

            if(user) {
                user.password = req.body.password ? req.body.password : user.password;
                user.resetpasswordexpires = undefined;
                user.resetpasswordtoken = undefined;

                user.save((err, saved) => {
                    if(err) {
                        return res.status(500).json({
                            message: 'Error when changing password.',
                            error: err
                        });
                    }

                    getFullname(user.email, user.role, (name) => {
                        if(!name) {
                            name = "Ct User";
                        }

                        mailer.sendPasswordChangedMail(name, req.body.email);

                        return res.json({status: true, data: "password_change_successful"});
                    });
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

        let booking_info = {status: "Pending", from: from, to: to, route: routefrom + " To " + routeto, bookedon: new Date().toLocaleString()};
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

                return res.json({status: true, data: "booking_successful."})
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
                    if(err) return res.json({status: false, data: err.message});

                    if(!user) return res.json({status: false, data: "user_not_found"});

                    if(user) {
                        BookingJournal.findOne({email: req.body.email, "booking.bookingstatus" : "Pending"}, (err, trip) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(trip) {
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
        if(!req.body.bookingid) return res.json({status: false, data: "bookingid_required"});
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: decoded.email}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error"});

                    if(!client) return res.json({status: false, data: "user_not_found"});

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
                                        getFullname(client.email, client.role, (name) => {
                                            if(!name) {
                                                name = "Ct User";
                                            }

                                            mailer.sendBookingCancelledMail(name, decoded.email);
                                            return res.json({status: true, data: "Booking Cancellation Successful."});
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
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if(!token) return res.json({status: false, data: "token_required"});
        if(!req.body.email) res.json({status: false, data: "email_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, {"fullname" : 1, "balance" : 1}, (err, client) => {
                    if(err) return res.json({status: false, data: "db_error"});
                    if(!client) return res.json({status: false, data: "user_notfound"});

                    if(client) {
                        PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed"}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: "db_error"});
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
                    if(err) return res.json({status: false, data: "db_error"});
                    if(!client) return res.json({status: false, data: "user_notfound"});

                    if(client) {
                        TransactionJournal.find({email: req.body.email}, {"transaction" : 1, "amount" : 1, "success" : 1, "created" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: err.message});
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
        if(!req.body.email) res.json({status: false, data: "email_required"});
        if(!token) return res.json({status: false, data: "token_required"});

        jwt.verify(token, supersecret, function (err, decoded) {
            if (err) {
                return res.json({status: false, data: "token_expired"});
            }
            else if(decoded && decoded.email) {
                User.findOne({email: req.body.email}, {"fullname" : 1}, (err, client) => {
                    if(err) return res.json({status: false, data: err.message});
                    if(!client) {
                        console.log("Client: ", client)
                        return res.json({status: false, data: "user_notfound"});
                    }

                    if(client) {
                        BookingJournal.find({email: req.body.email}, {"booking" : 1, "email" : 1}, (err, history) => {
                            if(err) return res.json({status: false, data: err.message});
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
                    if(err) return res.json({status: false, data: "db_error"});
                    
                    if(!client) {
                        return res.json({status: false, data: "user_notfound"});
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

            PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed", created : {$gt: dateone, $lt: datetwo}}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
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

            PaymentJournal.find({email: req.body.email, paymentstatus: "Confirmed", created : {$gt: datethen}}, {"paymenttype" : 1, "amount" : 1, "created" : 1}, (err, history) => {
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
    });

    apiRouter.post('/fund_ct', (req, res) => {
        let token = req.body.token || req.params.token || req.headers['x-access-token'];

        if (!req.body.email) return res.json({status: false, data: "email_required"});
        if (!req.body.amount) return res.json({status: false, data: "amount_required"});
        if (!token) return res.json({status: false, data: "token_required"});

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
                        payment.amount = req.body.amount;
                        payment.createdon = new Date().toDateString();
                        payment.paymentstatus = "Pending";

                        payment.save(function (err) {
                            if (err) console.log("err: ", err.message);

                            if(ctime.role === "individual") {

                                Individual.update({email: req.body.email}, {$push: {"payments": id}}, function (err, payment) {
                                    if (err) return res.send(err);

                                    if (payment.nModified > 0) {
                                        
                                        return res.json({status: true, ref: id, email: ctime.email, phone: ctime.phone});
                                        
                                    } else {
                                        return res.json({status: false, message: "There was a problem initiating payment."});
                                    }
                                });
                            }
                            else {
                                Company.update({email: req.body.email}, {$push: {"payments": id}}, function (err, payment) {
                                    if (err) return res.send(err);

                                    if (payment.nModified > 0) {
                                        
                                        return res.json({status: true, ref: id, email: ctime.email, phone: ctime.phone});
                                        
                                    } else {
                                        return res.json({status: false, message: "There was a problem initiating payment."});
                                    }
                                });
                            }
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
        complaint.status = "Pending";

        complaint.save((err, success) => {

            if(err) {
                console.log("Error saving complaint. ", err.message);
                return res.json({status: false, data: err.message});
            }
            else if(success) {
                mailer.sendComplaintRecieptMail(req.body.email);

                //mailer.sendComplaintMail(req.body.name, req.body.email, req.body.complaint, corporatemail);

                return res.json({status: true, data: "complaint_received.", reason: "Complaint has been received."});
            }
        });
    });

    apiRouter.post("/payevents", (req, res) => {

        if(!req.body.customer.email) return res.json({status: false, data: "Email not found."});
        if(!req.body.txRef) return res.json({status: false, data: "Reference missing."});

        //let secret = "FLWSECK_TEST-381f15e4245f9053fdd1bc29ce32a69a-X";

        let hash = req.headers["verif-hash"];
        let MY_HASH = config.hash;
        let type;

        if(req.body["event.type"] === "CARD_TRANSACTION") {
            type = "Card Payment";
        }
        else if(req.body["event.type"] === "ACCOUNT_TRANSACTION") {
            type = "Bank Payment";
        }
    
        if (hash === MY_HASH) {

            PaymentJournal.find({ paymentid: req.body.txRef}, function(err, payments) {

                if (err) console.log(err.message);

                if(payments) {
                    PaymentJournal.findOneAndUpdate({paymentid: req.body.txRef}, { $set: {paymentstatus: "Confirmed", paymenttype: type}}, {new: true},  (err, payment) => {
                        if(err) {
                            console.log(err.message);
                        }

                        if(payment) {
                            if(req.body.status === "successful") {
                                User.findOne({email: req.body.customer.email}, (err, user) => {
                                    if(err) console.log ("err: ", err.message);

                                    if(user) {
                                        if(user.role === "individual") {
                                            Individual.updateOne({email: req.body.customer.email}, {$inc: {balance: req.body.amount}}, (err, updated) => {
                                                if(err) console.log("error updating balance: ", err.message);
                                                if(updated) {
                                                    //console.log("update individual: ", updated)
                                                    //return res.sendStatus(200);
                                                    //return res.json({status: true, data: "Balance updated."})
                                                }
                                            });
                                        }
                                        else {
                                            Company.updateOne({email: req.body.customer.email}, {$inc: {balance: req.body.amount}}, (err, updated) => {
                                                if(err) console.log("error updating balance: ", err.message);
                                                if(updated) {
                                                    console.log("update company: ", updated)
                                                    //return res.sendStatus(200);
                                                    //return res.json({status: true, data: "Balance updated."})
                                                }
                                            });
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            });
        }
        else {
            console.log("Hashe and secret don't match.", secret, hash);
        }

        res.sendStatus(200);
    });

    apiRouter.post("/cardpayment", (req, res) => {

        if(!Array.isArray(req.body)) return res.json({status: false, data: "not-array"});
        if((req.body.length < 1)) return res.json({status: false, data: "array-empty"});

        let details = req.body[0];

        let amount = -1 * details.amount;
        let cardnumber = details.cardSerial;
        let transid = details.transID;
        let transdate = details.transDate;

        if(!amount) return res.json({status: false, data: "no-amount"});
        if(!cardnumber) return res.json({status: false, data: "no-cardnumber"});
        if(!transid) return res.json({status: false, data: "no_transid"});
        if(!transdate) return res.json({status: false, data: "no_transdate"});

        User.findOne({ct_cardnumber: cardnumber}, {"email" : 1, "role" : 1}, (err, user) => {
            if(err) {
                console.log("Error finding user: ", err.message);
                return res.json({status: false, data: err.message});
            }
            if(user) {

                CardTransactions.findOne({cardnumber: cardnumber, transid: transid}, (err, _id) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(_id) {
                        return res.json({status: false, data: "dup-id"});
                    }

                    if(!_id) {

                        let trs = new CardTransactions();

                        trs.cardnumber = cardnumber;
                        trs.transid = transid;
                        trs.transdate = transdate;
                        trs.amount = amount;
                        trs.create = new Date();
                        trs.createdonformatted = new Date().toDateString();

                        trs.save((err, saved) => {
                            if(err) return res.json({status: false, data: err.message});

                            if(saved) {
                                User.updateOne({ct_cardnumber: cardnumber}, {$inc: {balance: amount}}, (err, update) => {
                                    if(err) {
                                        console.log("error deducting from user's balance: ", err.message);
                                        return res.json({status: false, data: err.message});
                                    }
                                    if(update.nModified > 0){
                                        BookingJournal.findOneAndUpdate({"booking.bookingstatus": "Pending", ct_cardnumber: cardnumber}, 
                                            {$set: {"booking.bookingstatus": "Concluded"}
                                        }, {new: true},  (err, concluded) => {
                                            if(err) return res.json({status: false, data: err.message});

                                            if(concluded) {
                                                getFullname(user.email, user.role, (name) => {
                                                    if(!name) {
                                                        name = "Ct User";
                                                    }

                                                    mailer.sendBookingConcludedMail(name, user.email);
                                                    return res.json({status: true, data: "updated"});
                                                });
                                            }
                                            else {
                                                return res.json({status: false, data: "Unable to conclude booking."})
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
                return res.json({status: false, data: "account_notfound"})
            }
        })
    });

    apiRouter.post("/checkbalance", (req, res) => {
        if(!req.body.cardnumber) return res.json({status: false, data: "ct_cardnumber_required"});

        User.findOne({ct_cardnumber: req.body.cardnumber}, {"fullname" : 1, "balance" : 1}, (err, user) => {
            if(err) {
                return res.json({status: false, data: err.message});
            }
            if(user) {
                if(user.role === "individual") {
                    Individual.findOne({ct_cardnumber: req.body.cardnumber}, (err, ind) => {
                        if(err) console.log("err: ", err.message);

                        if(ind) {
                            return res.json({status: true, data: ind.balance});
                        }
                    });
                }
                else if(user.role === "company") {
                    Company.findOne({ct_cardnumber: req.body.cardnumber}, (err, com) => {
                        if(err) console.log("err: ", err.message);

                        if(com) {
                            return res.json({status: true, data: com.balance});
                        }
                    });
                }
            }
            else {
                return res.json({status: false, data: "account_notfound"})
            }
        })
    });

    apiRouter.post("/confirmbalancewritten", (req, res) => {
        if(!req.body.cardnumber) return res.json({status: false, data: "ct_cardnumber_required"});
        if(!req.body.status) return res.json({status: false, data: "status_required"});

        User.findOne({ct_cardnumber: req.body.cardnumber}, {"fullname" : 1}, (err, user) => {
            if(err) {
                console.log("Error finding user: ", err.message);
                return res.json({status: false, data: err.message});
            }
            if(user) {
                User.updateOne({ct_cardnumber: req.body.cardnumber}, {$set: {updatestatus: req.body.status}}, (err, update) => {
                    if(err) {
                        
                        return res.json({status: false, data: err.message});
                    }
                    if(update.nModified > 0){
                        console.log("Write to card balance successful.");
                    }
                })
            }
            else {
                return res.json({status: false, data: "account_notfound"})
            }
        })
    });

    apiRouter.post("/assigncard", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.cardnumber) return res.json({status: false, data: "cardnumber_required"});

        User.find({ct_cardnumber: req.body.cardnumber}, (err, card) => {
            if(err) console.log("err: ", err.message);

            if(!card.length) {
                User.findOne({email: req.body.email}, (err, user) => {
                    if(err) {
                        return res.json({status: false, data: err.message});
                    }
                    else if (user) {
                        if(user.ct_cardnumber) {
                            return res.json({status: false, data: "cardpresent", card: user.ct_cardnumber});
                        }
                        /*else if(user.ct_cardnumber === req.body.cardnumber) {
                            return res.json({status: false, data: "cardassigned"});
                        }*/
                        else {
                            User.updateOne({email: req.body.email}, {$set: {ct_cardstatus: "assigned", ct_cardnumber: req.body.cardnumber}}, (err, update) => {
                                if(err) {
                                    console.log("err: ", err.message);

                                    return res.json({status: false, data: err.message});
                                }
                                if(update.nModified > 0) {
                                    return res.json({status: true, data: "assigned"});
                                }
                            })
                        }
                    }
                    else {
                        return res.json({status: false, data: "account_notfound"});
                    }
                })
            }
            else {
                return res.json({status: false, data: "cardexists", owner: card[0].email});
            }
        });
    });

    apiRouter.post("/addemployee", (req, res) => {
        if(!req.body.fullname) return res.json({status: false, data: "fullname_required"});
        if(!req.body.gender) return res.json({status: false, data: "gender_required"});
        if(!req.body.home) return res.json({status: false, data: "home_required"});
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.phone) return res.json({status: false, data: "phone_required"});
        if(!req.body.owner) return res.json({status: false, data: "owner_required"});

        Company.findOne({email: req.body.owner}, (err, company) => {
            if(err) console.log("err: ", err.message);

            if(company) {

                Individual.findOne({email: req.body.email}, (err, user) => {
                    if(err) console.log("err: ", err.message);

                    if(user) {
                        return res.json({status: false, data: "email_exists"});
                    } 
                    else {

                        Individual.findOne({phone: req.body.phone}, (err, phone) => {
                            if(err) console.log("err: ", err.message);

                            if(phone) {
                                return res.json({status: false, data: "phone_exists"});
                            }
                            else {
                                User.findOne({email: req.body.email}, (err, user) => {
                                    if(err) console.log("err: ", err.message);

                                    if(user) {
                                        return res.json({status: false, data: "email_exists"});
                                    }
                                    else {
                                        let user = new User();
                                        let ind = new Individual();
                                        let vcode = uuid.v4();
                                        let password = uniqueSuffix(10);

                                        ind.work = company.office_location;
                                        ind.home = req.body.home;
                                        ind.route = req.body.home + " To " + company.office_location;
                                        ind.gender = req.body.gender;
                                        ind.password = password;
                                        ind.org = company.companyname;
                                        ind.email = req.body.email;
                                        ind.phone = req.body.phone;
                                        ind.username = req.body.fullname.split(" ")[0]+uniqueSuffix(3);
                                        ind.fullname = req.body.fullname;

                                        user.email = req.body.email;
                                        user.password = password
                                        user.role = "individual";
                                        user.createdon = new Date();
                                        user.vcode = vcode;
                                        user.verified = false;

                                        ind.save((err, success) => {
                                            if(err) console.log("err: ", err.message);

                                            if(success) {
                                                user.save((err, success) => {
                                                    if(err) console.log("err: ", err.message);

                                                    if(success) {

                                                        Company.update({email: req.body.owner}, {$push: {"employees": req.body.email}}, function (err, emp) {
                                                            if (err) return res.send(err);

                                                            if (emp.nModified > 0) {
                                                                
                                                                mailer.sendAddedMail(req.body.fullname, req.body.email, company.companyname, BASE_URL+"/verify/"+vcode);
                                                                return res.json({status: false, data: "employeeadded"});
                                                                 
                                                            } else {
                                                                return res.json({status: false, message: "There was a problem initiating payment."});
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
            }
            else {
                console.log("no such company");
                return res.json({status: false, data: "company_notfound"})
            }
        })
    });

    apiRouter.post("/removeemployee", (req, res) => {
        if(!req.body.email) return res.json({status: false, data: "email_required"});
        if(!req.body.token) return res.json({status: false, data: "token_required"});

        jwt.verify(req.body.token, supersecret, (err, decoded) => {

            if (err) {
                return res.json({status: false, data: "token_expired"})
            }
            else if(decoded) {
                Company.findOne({email: decoded.email}, (err, com) => {
                    if(err) return res.json({status: false, data: err.message});

                    if(!com) {
                        return res.json({status: false, data: "com_notfound"});
                    }

                    else if (com) {
                        User.findOne({email: req.body.email}, (err, emp) => {
                            if(err) console.log("err: ", err.message);

                            if(!emp) {
                                return res.json({status: false, data: "emp_notfound"})
                            }
                            else {
                                User.deleteOne({email: req.body.email}, (err, userremoved) => {
                                    if(err) console.log("err: ", err.message);

                                    if(userremoved) {
                                        Individual.deleteOne({email: req.body.email}, (err, deleted) => {
                                            if(err) return res.json({status: false, data: err.message});

                                            if(deleted.n > 0) {

                                                User.find({verified: true, role: !"admin"}, (err, users) => {
                                                    if(err) console.log("err: ", err.message);

                                                    if(users) {
                                                        return res.json({status: true, data: "employeeremoved"});
                                                    }
                                                    else {
                                                        return res.json({status: false, data: "noemployeefound"});
                                                    }
                                                })
                                            }
                                        })
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    return apiRouter;
};