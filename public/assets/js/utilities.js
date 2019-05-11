angular.module('Utilities', [])

    .factory('Utilities', ['Transporter', UtilitiesFnc]);

function UtilitiesFnc(Transporter) {

    // create a new object
    let utility = {};

    utility.currency = {name: "Naira", symbol: "₦"};
    utility.user = {};

    utility.showForm = (id, height) => {
        $("#"+id).css("-webkit-transition", "height 0.5s ease-out");
        $("#"+id).css("-moz-transition", "height 0.5s ease-out");
        $("#"+id).css("-o-transition", "height 0.5s ease-out");
        $("#"+id).css("-ms-transition", "height 0.5s ease-out");
        $("#"+id).css("transition", "height 0.5s ease-out");

        $("#"+id).css("height", height);
        $("#"+id).css("opacity", "1");

        return false;
    }

    utility.closeForm = (id) => {
        $("#"+id).css("-webkit-transition", "height 0.5s ease-in");
        $("#"+id).css("-moz-transition", "height 0.5s ease-in");
        $("#"+id).css("-o-transition", "height 0.5s ease-in");
        $("#"+id).css("-ms-transition", "height 0.5s ease-in");
        $("#"+id).css("transition", "height 0.5s ease-in");

        $("#"+id).css("height", "0px");
        setTimeout(function(){
            $("#"+id).css("opacity", "0");
        }, 400);

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

    utility.showLandingLoader = () => {
        $(".landingloader").css("display", "block");
    }

    utility.hideLandingLoader = () => {
        $(".landingloader").css("display", "none");
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
            utility.showLandingLoader();
            utility.disableButton("sendmessage-button");

            Transporter.contactus({
                subject: subject,
                email: email,
                complaint: text
            }).then(response => {
                console.log("Res: ", response);

                utility.hideGeneralLoader();
                utility.hideLandingLoader();

                if(response.status) {
                    $("#supporttext").notify("Message received.", "success", { position: "bottom-center" });
                    
                    $("#supportemail").val("");
                    $("#supportsubject").val("");
                    $("#supporttext").val("");

                    setTimeout(() => {
                        utility.closeForm("contactus");
                    }, 5000);
                    
                }else {
                    $("#supportemail").notify("Error. Please try again later.", { position: "bottom-center" });
                }
            })
        }
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

    // return our entire utility object
    return utility;
}
