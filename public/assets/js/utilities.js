angular.module('Utilities', [])

    .factory('Utilities', ['Transporter', UtilitiesFnc]);

function UtilitiesFnc(Transporter) {

    // create a new object
    let utility = {};

    utility.currency = {name: "Naira", symbol: "₦"};
    utility.user = {};

    utility.ravepublic = "FLWPUBK_TEST-8f1ee05b1e4c692149cccd3afd56b1bd-X";
    utility.ravesecret = "FLWSECK_TEST-381f15e4245f9053fdd1bc29ce32a69a-X";
    utility.raveenckey = "FLWSECK_TEST31dbdcbb6286";

    utility.showForm = (id, height) => {
        utility.toTop();
        
        $("#"+id).css("visibility", "visible");
        $("#"+id).css("display", "inherit");
        $("#"+id).css("z-index", 20000);
        $("#"+id)[0].classList.add("animated", "fadeIn", "delay-0.5s");

        $("#"+id).css("height", height);
        $("#"+id).css("opacity", "1");

        return false;
    }

    utility.loginCleanUp = () => {
        store.remove("user");
        store.remove("company");
    }

    utility.toTop = () => {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    }

    utility.closeForm = (id) => {
        $("#"+id)[0].classList.remove("animated", "fadeIn", "delay-0.5s");
        $("#"+id)[0].classList.add("animated", "fadeOut", "delay-0.5s");
        setTimeout(function() {
            $("#"+id)[0].classList.remove("animated", "fadeOut", "delay-0.5s");
            $("#"+id).css("display", "none");
            $("#"+id).css("z-index", 0);
        }, 100);
        $("#"+id).css("z-index", 0);

        return false;
    }

    utility.failedRequestNotice = (xhr, ajaxOptions, thrownError) => {
        if(xhr.statusText == "error" && xhr.status == 0){
            console.log("No internet!");
            //mainFactory.notifyIt("Unable to fetch profile data. Please check your Internet connection.", "error");
        }else{
            console.log("error!");
            //mainFactory.notifyIt("Something went wrong while fetching your profile data. Please reload page to try again.", "error");
        }
    }

    utility.alternateColors = () => {
        for (var i=0; i < $(".history").length; i++) {
            if(i%2 != 0) {
                $(".history")[i].className = "history other";
            }
        }
    }

    utility.disableButton = (id, text) => {
        $("#"+id).attr("disabled", "disabled");
        $("#"+id).text(text);
    }

    utility.enableButton = (id, text) => {
        $("#"+id).removeAttr('disabled');
        $("#"+id).text(text);
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

    utility.fetchPlaces = () => {
        Transporter.fetchplaces({}).then(response => {
            console.log("response: ", response);
            
            if(response.status) {
                store.set("places", response.data[0]);
            }
            else {
                console.log("data yet to arrive!");
            }
        })
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

    utility.showSignUpType = () => {
        $("#signuptype").css("visibility", "visible");
        $("#signuptype").css("display", "inherit");
        $("#signuptype").css("z-index", 20000);
        $("#signuptype")[0].classList.add("animated", "fadeIn", "delay-0.5s");
    }

    utility.closeSignUpType = () => {
        $("#signuptype")[0].classList.remove("animated", "fadeIn", "delay-0.5s");
        $("#signuptype")[0].classList.add("animated", "fadeOut", "delay-0.5s");
        setTimeout(function() {
            $("#signuptype")[0].classList.remove("animated", "fadeOut", "delay-0.5s");
            $("#signuptype").css("display", "none");
            $("#signuptype").css("z-index", 0);
        }, 100);
        $("#signuptype").css("z-index", 0);
    }

    // return our entire utility object
    return utility;
}
