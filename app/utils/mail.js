let nodemailer = require('nodemailer');

module.exports = {
    sendEmailVerificationMail: function sendEmailVerificationMail(firstname, confirmlink, recipient){

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        let mailOptions = {
            from: '"Hello From Corporate Transit" <chijioke543@gmail.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
                subject: 'WELCOME TO CORPORATE TRANSIT ✔', // Subject line
            text: 'Hello ' + firstname + '! Thank you for choosing Corporate Transit. We are pleased to have you on board. To activate your account and verify your email, click or copy the link below to your browser.' + confirmlink + ' All future notifications will be sent to this email address. We look forward to enhancing your daily commute experience. For inquires and information; contact E: information@corporatetransit.com.ng \n' +
            '                                                                T: 080011122222\n' +
            '                                                                W: www.corporatetransit.com.ng\n', // plaintext body
            html: 'Hello ' + firstname +'!<br><br>Thank you for choosing Corporate Transit. We are pleased to have you on board. <br><br>To activate your account and verify your email, click or copy the link below to your browser.<br><br><strong>' + confirmlink + '</strong><br><br><br> <a  target="_blank" href="' + confirmlink + '" style="text-decoration: none; padding: 2% 4%; border: 1px solid #4d5862; color: #fff !important; cursor: pointer; background: #4d5862; width: 100%;">Confirm Email</a> <br><br><br>All future notifications will be sent to this email address.<br><br>We look forward to enhancing your daily commute experience.<br><br>Best regards!<br><br> For inquires and information; contact:<br>  E: information@corporatetransit.com.ng<br> T: 080011122222 <br>W: www.corporatetransit.com.ng' // html body
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendPasswordResetMail: function sendPasswordResetMail(recipients, pwdresetlink){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <hello@corporatetransit.com>', // sender address
            to: recipients,
            subject: 'Corporate Transit Password Reset ✔',
            text: 'Hello! We heard you need your password reset. Click the link below and you\'ll be redirected to a secure location from where you can set a new password. ' + pwdresetlink + '. This link is valid for only 1 hour. If you didn\'t try to reset your password, simply ignore this email. The Corporate Transit Team.', // plaintext body
            html: 'Hello!<br><br>We heard you need your password reset. Click the link below and you\'ll be redirected to a secure location from where you can set a new password.<br><br><a target="_blank" href="' + pwdresetlink + '">' + pwdresetlink + '/</a><br><br>This link is valid for only 1 hour. <br><br>If you didn\'t try to reset your password, simply ignore this mail, and we\'ll forget this ever happened.<br><br>The Corporate Transit Team' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendPasswordChangedMail: function sendPasswordChangedMail(fullname, recipients){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <hello@corporatetransit.com>', // sender address
            to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Corporate Transit Password Changed ✔', // Subject line
            text: 'Hello ' + fullname + '! Your password has been successfully reset and changed. You may now login with your new password. Don\'t forget to store your password safely.', // plaintext body
            html: 'Hello ' + fullname + '!<br><br>Your password has been successfully reset and changed. You may now login with your new password.<br><br>Don\'t forget to store your password safely.<br>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendSuccessfulBookingMail: function sendSuccessfulBookingMail(recipients, booking){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <hello@corporatetransit.com>', // sender address
            to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Booking Successful. ✔', // Subject line
            text: 'Hello!This is to inform you that your booking was successful. Find below the details of you booking.<br><br> Status: ' + booking.status + 'Departure: ' + booking.from + 'Destination: ' + booking.to + 'Route: ' + booking.route + 'Booking Date' + booking.bookedon, // plaintext body
            html: 'Hello!<br><br>This is to inform you that your booking was successful. Find below the details of you booking.<br><br> Status: ' + booking.status + '<br><br>' + ' From: ' + booking.from + '<br><br>' + 'To: ' + booking.to + '<br><br>' + 'Route: ' + booking.route + '<br><br>' + 'Booking Date: ' + booking.bookedon // html body // html body
        }; //

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendComplaintRecieptMail: function sendComplaintRecieptMail(recipients){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Complaint Received. ✔', // Subject line
            text: 'Hello!This is to inform you that your message was received. We will get in touch soon.', // plaintext body
            html: 'Hello!<br><br>This is to inform you that your message was received. We will get in touch soon.<br>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendComplaintMail: function sendComplaintMail(name, email, complaint, recipient){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello" <customerservice@corporatetransit.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Pending Complaint. ✔', // Subject line
            text: 'Hello! There is a pending complaint for your to review. Find the details below. Name: + ' + name + '. Email: ' + email + '. Complaint: ' + complaint, // plaintext body
            html: 'Hello!<br><br>There is a pending complaint for your to review. Find the details below.<br>' + 'Name: ' + name + '<br>' + 'Email: ' + email + '<br>' + 'Complaint: ' + complaint // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendBookingCancelledMail: function sendBookingCancelledMail(fullname, recipients){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Booking Cancelled. ✔', // Subject line
            text: 'Hello ' + fullname + '!This is to inform you that your request to cancel your booking was successful. Thanks for choosing us.', // plaintext body
            html: 'Hello ' + fullname + '!<br><br>This is to inform you that your request to cancel your booking was successful. Thanks for choosing us.<br>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendBookingConcludedMail: function sendBookingConcludedMail(recipients){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipients, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'You have a message. ✔', // Subject line
            text: 'Hello!This is to inform your of your successful card payment. Thanks for choosing us.', // plaintext body
            html: 'Hello! <br><br>This is to inform your of your successful card payment. Thanks for choosing us.<br>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendCardNumberMail: function sendCardNumberMail(recipient, cardnumber){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Your card number! ✔', // Subject line
            text: 'Hello !Your email has been verified! This is your card number. ' + cardnumber + 'Save it, as you will need it to identify your card. Thanks for choosing us.', // plaintext body
            html: 'Hello !<br><br>Your account has been activated! <br><br> This is your card number. <br><br>' + cardnumber + '<br><br> Save it, as you will need it to identify your card. <br>Thanks for choosing us.<br>' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendAdminMail: function sendAdminMail(fullname, recipient, password){
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Admin Invitation! ✔', // Subject line
            text: 'Hello ' + fullname + 'You have been invited to collaborate on Corporate Transit. ' + password + ' is your password.', // plaintext body
            html: 'Hello ' + fullname + '!<br><br>You have been invited to collaborate on Corporate Transit! <br><br> This is your password. <br><br><b>' + password + '<b><br><br' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendReplyText: function sendReplyText(prevsubject, recipient, text) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'Re: ' + prevsubject, // Subject line
            text: text, // plaintext body
            html: text // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    },

    sendAddedMail: function sendAddedMail(fullname, recipient, company, confirmlink) {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            auth: {
                user: 'cranky.uncle3@gmail.com',
                pass: 'privateryan'
            }
        });

        // setup e-mail data with unicode symbols
        let mailOptions = {
            from: '"Hello From Corporate Transit" <customerservice@corporatetransit.com>', // sender address
            to: recipient, //'bar@blurdybloop.com, baz@blurdybloop.com' // list of receivers
            subject: 'You have been added!', // Subject line
            text: 'Hello ' + fullname + ', This is to inform you that you have been successfully added by your your company ' + company + ' on Corporate Transit! We are delighted to have you on board and look forward to starting an amazing journey with you. To get started, please click the button below to confirm your email address and receive your card number, or copy the link below and paste on your browser if the button does not work. We wish you a safe ride.', // plaintext body
            html: 'Hello ' + fullname + ', <br><br>This is to inform you that you have been successfully added by your company ' + company + ' on Corporate Transit! <br><br> We are delighted to have you on board and look forward to starting an amazing journey with you. <br><br> To get started, please click on the button below to confirm your email and receive your card number, or copy the link below and paste on your browser if the button does not work. <br><br> ' + confirmlink + '<br><br><br> <a  target="_blank" href="' + confirmlink + '" style="text-decoration: none; padding: 2% 4%; border: 1px solid #4d5862; color: #fff !important; cursor: pointer; background: #4d5862; width: 100%;">Confirm Email</a> <br><br>Have a safe ride!' // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log('Mail Error: ', error, ' : ', new Date());
            }
        });
    }
};