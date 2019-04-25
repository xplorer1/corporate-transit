angular.module('Utilities', [])

    .factory('Utilities', ['Transporter', UtilitiesFnc]);

function UtilitiesFnc(Transporter) {

    // create a new object
    let utility = {};

    utility.currency = {name: "Naira", symbol: "₦"};
    utility.user = {};

    utility.callCloseContactUs = () => {
        $("#booktrip").css("height", "0px");
        $("#booktrip").css("opacity", "0");

        $("#contactus").css("-webkit-transition", "height 0.5s ease-in");
        $("#contactus").css("-moz-transition", "height 0.5s ease-in");
        $("#contactus").css("-o-transition", "height 0.5s ease-in");
        $("#contactus").css("-ms-transition", "height 0.5s ease-in");
        $("#contactus").css("transition", "height 0.5s ease-in");

        $("#contactus").css("height", "0px");
        setTimeout(function(){
            $("#contactus").css("opacity", "0");
        }, 400);

        return false;
    }

    utility.closePendingTrip = () => {
        $("#booktrip").css("height", "0px");
        $("#booktrip").css("opacity", "0");

        $("#pendingtrip").css("-webkit-transition", "height 0.5s ease-in");
        $("#pendingtrip").css("-moz-transition", "height 0.5s ease-in");
        $("#pendingtrip").css("-o-transition", "height 0.5s ease-in");
        $("#pendingtrip").css("-ms-transition", "height 0.5s ease-in");
        $("#pendingtrip").css("transition", "height 0.5s ease-in");

        $("#pendingtrip").css("height", "0px");
        setTimeout(function(){
            $("#pendingtrip").css("opacity", "0");
        }, 400);

        return false;
    }

    utility.callShowContactUs = () => {
        $("#booktrip").css("height", "0px");
        $("#booktrip").css("opacity", "0");

        $("#contactus").css("-webkit-transition", "height 0.5s ease-out");
        $("#contactus").css("-moz-transition", "height 0.5s ease-out");
        $("#contactus").css("-o-transition", "height 0.5s ease-out");
        $("#contactus").css("-ms-transition", "height 0.5s ease-out");
        $("#contactus").css("transition", "height 0.5s ease-out");

        $("#contactus").css("height", "400px");
        $("#contactus").css("opacity", "1");

        return false;
    }

    utility.showPendingTrip = () => {
        $("#booktrip").css("height", "0px");
        $("#booktrip").css("opacity", "0");

        $("#pendingtrip").css("-webkit-transition", "height 0.5s ease-out");
        $("#pendingtrip").css("-moz-transition", "height 0.5s ease-out");
        $("#pendingtrip").css("-o-transition", "height 0.5s ease-out");
        $("#pendingtrip").css("-ms-transition", "height 0.5s ease-out");
        $("#pendingtrip").css("transition", "height 0.5s ease-out");

        $("#pendingtrip").css("height", "430px");
        $("#pendingtrip").css("opacity", "1");

        return false;
    }

    utility.alternateColors = () => {
        for (var i=0; i < $(".history").length; i++) {
            if(i%2 != 0) {
                $(".history")[i].className = "history other";
            }
        }
    }

    utility.disableButton = (id) => {
        $("+id+").attr("disabled", "disabled");
    }

    utility.showLoader = () => {
        $(".ui.active.dimmer").css("display", "block");
    }

    utility.hideLoader = () => {
        $(".ui.active.dimmer").css("display", "none");
    }

    utility.showGeneralLoader = () => {
        $(".generalloader").css("display", "block");
    }

    utility.hideGeneralLoader = () => {
        $(".generalloader").css("display", "none");
    }

    utility.validmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    utility.numberWithCommas = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    utility.formatDate = (date) => {
        date = date.split("-");

        let day = date[0];
        let month = date[1];
        let year = date[2];
        
        let newdate = year+"-"+month+"-"+day;
        
        return newdate;
    }

    utility.validateInput = (email, subject, text) => {
        if(!email) {
            $("#supportemail").notify("Please enter your email address.", { position: "bottom-center" });
        }
        else if(!utility.validmail(email)) {
            $("#supportemail").notify("Please enter a valid email address.", { position: "bottom-center" });
        }
        else if(!subject) {
            $("#supportsubject").notify("Please enter the subject of your message.", { position: "bottom-center" });
        }
        else if(!text) {
            $("#supporttext").notify("Please enter your message.", { position: "bottom-center" });
        }
        else {
            
            utility.showGeneralLoader();
            utility.disableButton("sendmessage-button");

            Transporter.contactus({
                subject: subject,
                email: email,
                complaint: text
            }).then(response => {
                console.log("Res: ", response);

                utility.hideGeneralLoader();

                if(response.status) {
                    $("#supportemail").notify("Message received. You will get an email shortly.", "success", { position: "bottom-center" });
                    
                    $("#supportemail").val("");
                    $("#supportsubject").val("");
                    $("#supporttext").val("");

                    setTimeout(() => {
                        utility.callCloseContactUs();
                    }, 10000);
                    
                }else {
                    $("#supportemail").notify("Sorry, there has been a problem. Please try again later.", { position: "bottom-center" });
                }
            })
        }
    }

    utility.showBookTrip = () => {
        $("#contactus").css("height", "0px");
        $("#contactus").css("opacity", "0");

        $("#booktrip").css("-webkit-transition", "height 0.5s ease-out");
        $("#booktrip").css("-moz-transition", "height 0.5s ease-out");
        $("#booktrip").css("-o-transition", "height 0.5s ease-out");
        $("#booktrip").css("-ms-transition", "height 0.5s ease-out");
        $("#booktrip").css("transition", "height 0.5s ease-out");

        $("#booktrip").css("height", "520px");
        $("#booktrip").css("opacity", "1");

        return false;
    }

    utility.callCloseBookTrip = () => {
        $("#booktrip").css("-webkit-transition", "height 0.5s ease-in");
        $("#booktrip").css("-moz-transition", "height 0.5s ease-in");
        $("#booktrip").css("-o-transition", "height 0.5s ease-in");
        $("#booktrip").css("-ms-transition", "height 0.5s ease-in");
        $("#booktrip").css("transition", "height 0.5s ease-in");

        $("#booktrip").css("height", "0px");
        setTimeout(function(){
            $("#booktrip").css("opacity", "0");
        }, 400);

        return false;
    }

    utility.formatText = (text) => {
        if(text) {
            let first = text[0];
            let others = text.slice(1);

            first = first.toUpperCase();
            others = others.toLowerCase();

            text = first+others;

            return text;
        }
    }

    utility.formatDateDisplay = (date) => {
        date = date.split(" ");

        let time = date[1];
        let sec = time.slice(5, 8);
        time = time.replace(sec, "");

        let newdate = date[0];
        let ye = newdate.slice(0, 2);
        newdate = newdate.replace(ye, "");

        return newdate+" "+time+date[2].toLowerCase();
    }

    utility.showTripMode = () => {
        $("#mode_period").css("-webkit-transition", "height 0.5s ease-out");
        $("#mode_period").css("-moz-transition", "height 0.5s ease-out");
        $("#mode_period").css("-o-transition", "height 0.5s ease-out");
        $("#mode_period").css("-ms-transition", "height 0.5s ease-out");
        $("#mode_period").css("transition", "height 0.5s ease-out");

        $("#mode_period").css("height", "130px");
        $("#mode_period").css("opacity", "0.97");
        $("#mode_period").css("background", "lightgrey");

        return false;
    }

    utility.closeTripMode = () => {
        $("#mode_period").css("-webkit-transition", "height 0.5s ease-in");
        $("#mode_period").css("-moz-transition", "height 0.5s ease-in");
        $("#mode_period").css("-o-transition", "height 0.5s ease-in");
        $("#mode_period").css("-ms-transition", "height 0.5s ease-in");
        $("#mode_period").css("transition", "height 0.5s ease-in");

        $("#mode_period").css("height", "0px");
        setTimeout(function(){
            $("#mode_period").css("opacity", "0");
        }, 400);

        return false;
    }

    // return our entire utility object
    return utility;
}
