let path = require('path');
let User = require("../models/user");
let mailer = require('../utils/mail');
let cheerio = require('cheerio');
let fs = require('fs');

module.exports = function(app, express) {
    let generalRouter = express.Router();

    generalRouter.use(function(req, res, next) {

        if(req.url.includes("/confirm/")) {
            let vcode = req.url.split("/confirm/")[1];

            console.log("verification code: ", vcode);

            if(vcode) {
                User.findOne({vcode: vcode}, (err, user) => {
                    if(err) return res.json({status: false, data: "Email verification error."});

                    if(user) {
                        let cardnumber;

                        cardnumber = "";

                        User.updateOne({email: user.email}, {$set: {verified: true, verifiedon: new Date(), ct_cardnumber: cardnumber, ct_cardstatus: "assigned"}}, (err, verified) => {
                            if(err) return res.json({status: false, data: err});

                            if(verified.nModified === 1) {

                                mailer.sendCardNumberMail(user.fullname, user.email, cardnumber);

                                let $ = cheerio.load(fs.readFileSync('./public/views/main.html'));

                                $("#verified").val(true);

                                return res.send($.html());

                                //return res.sendFile(path.join(__dirname + '../../../public/views/index.html'))
                            }
                            else {
                                return res.json({status: false, data: "There has been a problem."})
                            }
                        });

                        //return res.json({status: true, data: "account_activation_successful", user: user.email, reason: "Account has been successful confirmed. User can now login."})
                    }
                    if(req.url.endsWith("index.html") || req.url === "/"){
                        return res.sendFile(path.join(__dirname + '../../../public/views/index.html'));
                    }else if(req.url.startsWith("/assets")){
                        return res.sendFile(path.join(__dirname + '../../../public' + req.url));
                    }else {
                        console.log("url: ", req.url);
                        //probably return not found page.
                    }
                    /*else {
                        return res.json({status: false, data: "account_activation_unsuccessful", reason: "Incorrect activation code entered. Advice user to check their email and verify they have not tampered with the link."})
                    }*/
                })
            }
        }
        else {
            next();
        }
    });

    generalRouter.get("/", (req, res) => {

        console.log("got here. req.url: ", req.url);

        if(req.url.endsWith("index.html") || req.url.endsWith("/")) {
            return res.sendFile(path.join(__dirname + '../../../public/views/index.html'));
        }
        else if(req.url.endsWith("/routes")) {
            return res.sendFile(path.join(__dirname + '../../../public/views/pages/routes.html'));
        }
        else if(req.url.endsWith("booking.html") || req.url.endsWith("contact_us.html") || req.url.endsWith("notfound.html") || req.url.endsWith("email_activation.html") || req.url.endsWith("faqs.html") || req.url.endsWith("how_it_works.html") || req.url.endsWith("login.html") || req.url.endsWith("payment.html") || req.url.endsWith("pricing.html") || req.url.endsWith("routes.html") || req.url.endsWith("signup.html")){
            return res.sendFile(path.join(__dirname + '../../../public/views/pages' + req.url));
        }else if(req.url.startsWith("/assets")) {
            return res.sendFile(path.join(__dirname + '../../../public/assets/' + req.url));
        }

    });
    return generalRouter;
};