angular.module('ControllersModule', [])
    .controller('MainPageController', ['$scope', '$state', '$log', '$window', '$location', MainPageController])
    .controller('PaymentPageController', ['$scope', '$log', 'Transporter', '$state', '$stateParams', 'Utilities', PaymentPageController])
    .controller('PaymentHistoryController', ['$scope', '$log', 'Transporter', '$state', 'Utilities', PaymentHistoryController])
    .controller('SignUpPageController', ['$scope',  '$log', 'Transporter', '$stateParams', '$state', 'Utilities', SignUpPageController])
    .controller('LoginPageController', ['$scope', '$log', 'Transporter', '$state', '$stateParams', 'Utilities', LoginPageController])
    .controller('LandingController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', LandingController])
    .controller('HowItWorksController', ['$scope', '$log', '$state', '$stateParams', HowItWorksController])
    .controller('BookingHistoryController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', BookingHistoryController])
    .controller('TransactionController', ['$scope', 'Utilities', '$log', 'Transporter', '$state', TransactionController]);

    function MainPageController($scope, $state, $log, $window, $location) {
        var url = $location.url();

        if(url === "/" || url === "#") {
            $(".ui.active.dimmer").css("display", "none");
        }

        $('.ui.accordion')
            .accordion()
        ;

        angular.element($window).bind("scroll", () => {

            $("#navbar").css("background", "#4d5862");
            $(".navother").css("background", "white");
            $(".nav-item.active.border").css("background", "none");
            $("#navbar a").css("color", "white");
            $(".navother a").css("color", "#4d5862");

            if ($window.pageYOffset < 2) {
                $("#navbar").css("background", "none");
                $(".navother").css("background", "white");
                $(".nav-item.active.border").css("background", "#4d5862");
                $("#navbar a").css("color", "white");
                $(".navother a").css("color", "#4d5862");
            }
        });

        $scope.showSubMenu = () => {
            $("#categories").css("-webkit-transition", "height 0.5s ease-out");
            $("#categories").css("-moz-transition", "height 0.5s ease-out");
            $("#categories").css("-o-transition", "height 0.5s ease-out");
            $("#categories").css("-ms-transition", "height 0.5s ease-out");
            $("#categories").css("transition", "height 0.5s ease-out");

            $("#categories").css("height", "125px");
            $("#categories").css("opacity", "0.97");

            return false;
        }

        $scope.closeCat = () => {
            $("#categories").css("-webkit-transition", "height 0.5s ease-in");
            $("#categories").css("-moz-transition", "height 0.5s ease-in");
            $("#categories").css("-o-transition", "height 0.5s ease-in");
            $("#categoriescategories").css("-ms-transition", "height 0.5s ease-in");
            $("#contactus").css("transition", "height 0.5s ease-in");

            $("#categories").css("height", "0px");
            setTimeout(function(){
                $("#categories").css("opacity", "0");
            }, 400);

            return false;
        }
    }

    function SignUpPageController($scope, $log, Transporter, $stateParams, $state, Utilities) {
        $(".ui.active.dimmer").css("display", "none");

        let token = $stateParams.vcode;

        if(token) {
            Transporter.confirm({
                token: token
            }).then(response => {
                $log.log("response: ", response);

                $(".ui.active.dimmer").css("display", "none");

                if(response.status) {
                    $("#notverified").css("display", "none");
                    $("#verified").css("display", "block");
                }else {
                    if(response.data === "acct_verified") {
                        $("#verified").css("display", "none");
                        $("#notverified").css("display", "block");
                    }else if(response.data === "token_notfound") {
                        $state.go("notfound");
                    }
                }
                $log.log("response: ", response);
            })
        }

        let beginSignup = (phone) => {
            Utilities.showGeneralLoader();

            Transporter.signup({
                fullname: $scope.fullname,
                org: $scope.org,
                work: $scope.work_location,
                gender: $scope.gender,
                home: $scope.home_location,
                email: $scope.email,
                phone: phone,
                username: $scope.username,
                password: $scope.password
            }).then(response => {
                $log.log("Response: ", response);

                Utilities.hideGeneralLoader();

                switch (response.data){
                    case "username_exists":
                        $("#username").notify("Username is not available. Please choose another.", { position: "bottom-center" });
                        break;
                    case "email_exists":
                        $("#email").notify("Email is registered. Please login if you have an account.", { position: "bottom-center" });
                        break;
                    case "phone_exists":
                        $("#phone").notify("Phone is registered. Please login if you have an account.", { position: "bottom-center" });
                        break;
                    case "db_error":
                        $("#signupform").notify("Error. Please try again later.", { position: "bottom-center" });
                        break;
                    case "signup_successful":
                        store.set("user", {email: $scope.email});
                        Utilities.user["email"] = $scope.email;

                        $("#signup").hide();
                        $("#email_confirmation").show();
                        break;
                    default:
                        $("#signupform").notify("There has been a problem. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        };

        let phone;

        $scope.signUp = () => {

            if(!$scope.fullname) {
                $("#fullname").notify("Full name is required.", { position: "bottom-center" });
            }
            else if($scope.fullname && $scope.fullname.split(" ").length < 2) {
                $("#fullname").notify("Please enter your two names.", { position: "bottom-center" });
            }
            else if(!$scope.org) {
                $("#org").notify("Organization name is required.", { position: "bottom-center" });
            }
            else if(!$scope.work_location) {
                $("#work_location").notify("Work location is required.", { position: "bottom-center" });
            }
            else if(!$scope.home_location) {
                $("#home_location").notify("Home location is required.", { position: "bottom-center" });
            }
            else if(!$scope.email) {
                $("#email").notify("Email address is required.", { position: "bottom-center" });
            }
            else if(!Utilities.validmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
            }
            else if(!$scope.phone) {
                $("#phone").notify("Phone number is required.", { position: "bottom-center" });
            }
            else if(!$scope.username) {
                $("#username").notify("Username is required.", { position: "bottom-center" });
            }
            else if(!$scope.gender) {
                $("#gender").notify("Gender is required.", { position: "bottom-center" });
            }
            else if(!$scope.password) {
                $("#password").notify("Password is required.", { position: "bottom-center" });
            }
            else if($scope.password && $scope.password.trim().length < 8) {
                $("#password").notify("Password must have at least 8 characters.", { position: "bottom-center" });
            }
            else if($scope.phone.startsWith("0") && $scope.phone.length === 11) {
                beginSignup($scope.phone);
            }
            else if($scope.phone.startsWith("+234") && $scope.phone.length === 14) {
                phone = "0" + $scope.phone.slice(4);
                beginSignup(phone);
            }
            else if(($scope.phone.startsWith("8") || $scope.phone.startsWith("9")) && $scope.phone.length === 10) {
                phone = "0" + $scope.phone;
                beginSignup(phone);
            }
            else if($scope.phone.startsWith("234") && $scope.phone.length === 13) {
                phone = "0" + $scope.phone.slice(3);
                beginSignup(phone);
            }
            else if($scope.phone.trim().length < 10 || $scope.phone.trim().length > 14) {
                $("#phone").notify("Please enter a valid phone number.", { position: "bottom-center" });
            }
        };

        $scope.resendCode = () => {
            let user = store.get("user");

            let email = Utilities.user["email"] || user.email;

            Utilities.showGeneralLoader();

            Transporter.resendcode({
                email: email
            }).then(response => {
                $log.log("Response: ", response);

                Utilities.hideGeneralLoader();

                switch (response.data){
                    case "user_notfound":
                        $("#email_confirmation").notify("Your email address was not found. Please register if you have no account.", { position: "bottom-center" });
                        break;
                    case "account_activated":
                        $("#email_confirmation").notify("Your account has already been activated. Login instead.", { position: "bottom-center" });
                        $("#email_confirmation").hide();
                        break;
                    case "db_error":
                        $("#email_confirmation").notify("Error. Please try again later.", { position: "bottom-center" });
                        break;
                    case "vcode_sent":

                        $("#email_confirmation").notify("Activation email sent to your email address.", "success", { position: "bottom-center" });
                        break;
                    default:
                        $("#signupform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        }
    }

    function LoginPageController($scope, $log, Transporter, $state, $stateParams, Utilities) {
        $(".ui.active.dimmer").css("display", "none");

        if($stateParams.resetcode) {
            Transporter.confirm({
                token: $stateParams.resetcode
            }).then(response => {
                $log.log("response: ", response);

                $(".ui.active.dimmer").css("display", "none");

                if(response.status) {
                    $("#resetform").show();
                    $("#loginbutton").hide();
                }else {
                    if(response.data === "invalid_token") {
                        $("#resetform").hide();
                        $("#notverified").show();
                    }else if(response.data === "notfound") {
                        $state.go("notfound");
                    }else {

                    }
                }
            });
        }

        $scope.login = () => {

            if(!$scope.email) {
                $("#email").notify("Please enter your email address.", { position: "bottom-center" });
            }
            else if(!Utilities.validmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
            }
            else if(!$scope.password) {
                $("#password").notify("Please enter your password.", { position: "bottom-center" });
            }
            else {
                $scope.loginclicked = true;

                Utilities.showGeneralLoader();

                Transporter.login({
                    email: $scope.email,
                    password: $scope.password
                }).then(response => {
                    $log.log("Response: ", response);
                    $scope.loginclicked = false;

                    Utilities.hideGeneralLoader();

                    switch (response.data){
                        case "not_activated":
                            $("#loginform").notify("Your account has not been verified. Activation link has been sent to your email address. Also check your spam/junk folders.", { position: "bottom-center" });
                            break;
                        case "login_successful":
                            let user = store.get("user");

                            Utilities.user["email"] = $scope.email;
                            Utilities.user["token"] = response.token;

                            store.set("user", {data: response.user});

                            $state.go("landing");
                            break;
                        case "account_notfound":
                            $("#loginform").notify("Invalid username or password.", { position: "bottom-center" });
                            break;
                        case "ErrorMongoError: Topology was destroyed":
                            $("#loginform").notify("There was an error. Please refresh your page and try again.", { position: "bottom-center" });
                        default:
                            $("#loginform").notify("There has been a problem. Please try again later.", { position: "bottom-center" });
                            break;
                    }
                })
            }
        };

        $scope.verifyEmail = () => {
            if(!$scope.resetemail) {
                $("#resetemail").notify("Email address is required.", { position: "bottom-center" });
            }
            else {
                Utilities.showGeneralLoader();

                $scope.resetpasswordclicked = true;

                Transporter.forgotpassword({
                    email: $scope.resetemail
                }).then(response => {
                    $log.log("Response: ", response);

                    $scope.resetpasswordclicked = false;

                    Utilities.hideGeneralLoader();

                    switch (response.data){
                        case "user_notfound":
                            $("#resetemail").notify("Email is not registered.", { position: "bottom-center" });
                            break;
                        case "password_resetlink_sent":
                            $("#resetemail").notify("Link to reset password has been sent to your email.", "success", { position: "bottom-center" });
                            break;
                        default:
                            $("#resetemail").notify("There has been a problem. Please try again later.", { position: "bottom-center" });
                            break;
                    }
                })
            }
        };

        $scope.resetPassword = () => {
            if(!$scope.new_password) {
                $("#new_password").notify("Please provide a new password.", {position: "bottom-center"});
            }
            else if($scope.new_password && $scope.new_password.trim().length < 8) {
                $("#new_password").notify("Password must have at least 8 characters.", { position: "bottom-center" });
            }
            else if(!$scope.confirm_password) {
                $("#confirm_password").notify("Please confirm your password.", { position: "bottom-center" });
            }
            else {
                Utilities.showGeneralLoader();

                $scope.changepasswordclicked = true;

                Transporter.resetpassword({
                    password: $scope.new_password,
                    token: $stateParams.resetcode
                }).then(response => {
                    $log.log("response: ", response);

                    Utilities.hideGeneralLoader();

                    $scope.changepasswordclicked = false;

                    if(response.status) {
                        $(".resetbutton").notify("Your password has been successfully changed.", { position: "bottom-center" });

                        setTimeout(() => {
                            $state.go("login");
                        }, 2000)
                    }else {
                        $(".resetbutton").notify("Password change unsuccessful. Please try again later.", { position: "bottom-center" });
                    }
                })
            }
        }
    }

    function BookingHistoryController($scope, $log, $state, Transporter, Utilities) {

        $scope.showContactUs = () => {
            Utilities.callShowContactUs();
        };

        $scope.closecontactus = () => {
            Utilities.callCloseContactUs();
        };

        $scope.showBookTrip = () => {
            return Utilities.callShowBookTrip();
        };

        $scope.closeBookTrip = () => {
            return Utilities.callCloseBookTrip();
        };

        let showOptions = () => {
            $("#edit_options").css("-webkit-transition", "height 0.5s ease-out");
            $("#edit_options").css("-moz-transition", "height 0.5s ease-out");
            $("#edit_options").css("-o-transition", "height 0.5s ease-out");
            $("#edit_options").css("-ms-transition", "height 0.5s ease-out");
            $("#edit_options").css("transition", "height 0.5s ease-out");

            $("#edit_options").css("height", "87px");
            $("#edit_options").css("opacity", "0.97");

            return false;
        }

        $scope.closeOptions = () => {
            $("#edit_options").css("-webkit-transition", "height 0.5s ease-in");
            $("#edit_options").css("-moz-transition", "height 0.5s ease-in");
            $("#edit_options").css("-o-transition", "height 0.5s ease-in");
            $("#edit_options").css("-ms-transition", "height 0.5s ease-in");
            $("#edit_options").css("transition", "height 0.5s ease-in");

            $("#edit_options").css("height", "0px");
            setTimeout(function(){
                $("#edit_options").css("opacity", "0");
            }, 400);

            return false;
        }

        let showChoice = () => {
            $scope.closeOptions();

            $("#edit_choice").css("-webkit-transition", "height 0.5s ease-out");
            $("#edit_choice").css("-moz-transition", "height 0.5s ease-out");
            $("#edit_choice").css("-o-transition", "height 0.5s ease-out");
            $("#edit_choice").css("-ms-transition", "height 0.5s ease-out");
            $("#edit_choice").css("transition", "height 0.5s ease-out");

            $("#edit_choice").css("height", "87px");
            $("#edit_choice").css("opacity", "0.97");

            return false;
        }

        $scope.closeChoice = () => {
            $("#edit_choice").css("-webkit-transition", "height 0.5s ease-in");
            $("#edit_choice").css("-moz-transition", "height 0.5s ease-in");
            $("#edit_choice").css("-o-transition", "height 0.5s ease-in");
            $("#edit_choice").css("-ms-transition", "height 0.5s ease-in");
            $("#edit_choice").css("transition", "height 0.5s ease-in");

            $("#edit_choice").css("height", "0px");
            setTimeout(function(){
                $("#edit_choice").css("opacity", "0");
            }, 400);

            return false;
        }

        let user = store.get("user");

        if(user) {
            Transporter.getbookinghistory({
                email: user.data.email,
                token: user.data.token
            }).then(response => {

                Utilities.hideLoader();

                if(response.status) {
                    if(response.data.length > 0) {
                        $scope.booking_history = response.data;

                        Utilities.alternateColors();

                        setTimeout(() => {
                            Utilities.alternateColors();

                        }, 1000);
                    }else{
                        $(".booking_one").css("display", "block");

                    }
                }else {
                    console.log("there has been an unknown problem.")
                }
            })
        }
        else {
            $state.go("login");
        }

        $(".close").click(() => {
            $('.c_trip')
                .modal('hide')
            ;
        });

        let booking_id;
        $scope.modifyTrip = (id, status)  => {
            booking_id = id;

            if(status === "Pending") {
                showOptions();
            }
        };

        $scope.getChoice = () => {
            showChoice();
        }

        $scope.modifyChoice = (choice) => {

            if(choice === "no") {
                $scope.closeOptions();
                $scope.closeChoice();
            }
            else if(choice === "yes") {
                Utilities.showGeneralLoader();
                Utilities.disableButton("yes-button");
               
                Transporter.cancelbooking({
                    bookingid: booking_id,
                    token: user.data.token
                }).then(response => {
                    Utilities.showGeneralLoader();

                    $log.log("response cancel booking: ", response);

                    if(response.status) {
                        $(".b_cat_body").notify("Booking Successfully cancelled.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            $scope.closeOptions();
                            $scope.closeChoice();
                        }, 6000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        $(".header").notify("Sorry. Access time expired. Redirecting to login now", { position: "bottom-center" });

                        setTimeout(() => {
                            $state.go("login");
                        }, 1500)
                    }else {
                        $(".header").notify("Sorry. There has been a problem. Please try again.", { position: "bottom-center" });
                    }
                })
            }
        };

        $scope.sendComplaint = () => {
            
            let email = $scope.supportemail;
            let subject = $scope.supportsubject;
            let text = $scope.supporttext;

            return Utilities.validateInput(email, subject, text);
        }

        let checkedvalue
        let BookTrip = (email, type1, type2, routefrom, routeto, from, to, ct_cardnumber, token) => {
            if(email) {
                if(!document.querySelector("input[value=roundtrip]").checked && !document.querySelector("input[value=oneride]").checked) {
                    $(".choicefields").notify("Please check one of the fields.", { position: "bottom-center" });
                }
                else if (!routefrom) {
                    $("#dep").notify("Point of departure is required.", { position: "bottom-center" });
                }
                else if (!routeto) {
                    $("#dest").notify("Destination is required.", { position: "bottom-center" });
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                }
                else if(!from) {
                    $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                }
                else if(!ct_cardnumber) {
                    $("#cardnumber").notify("Please enter your card number.", { position: "bottom-center" });
                }
                else {

                    if(document.querySelector("input[value=roundtrip]").checked) {
                        checkedvalue = "Round Trip"
                    }
                    else {
                        checkedvalue = "One Way Trip"
                    }

                    if(from) {
                        from = Utilities.formatDate(from);
                    }
                    if(to) {
                        to = Utilities.formatDate(to);
                    }

                    Utilities.showGeneralLoader();
                    Utilities.disableButton("bookaride-button");

                    Transporter.booktrip({
                        email: email,
                        bookingtype: checkedvalue,
                        routefrom: routefrom,
                        routeto: routeto,
                        from: from,
                        to: to,
                        ct_cardnumber: ct_cardnumber,
                        token: token,
                        tripmode: $("#tripmode").val()
                    }).then(response => {
                        console.log("response: ", response);

                        Utilities.hideGeneralLoader();

                        if(response.status) {
                            $(".popup_title").notify("Your booking was successful. Check your mail for details.", "success", { position: "top-center" });

                            $("#dep").val("");
                            $("#dest").val("");
                            $("#cardnumber").val("");
                            $("#demo1").val("");
                            $("#demo2").val("");

                            setTimeout(() => {
                                Utilities.callCloseBookTrip();
                            }, 10000);
                        }
                        else if(response.data === "not_found") {
                            $(".booktrip").notify("Authentication problem. Login out in 5 seconds...", { position: "bottom-center" });

                            setTimeout(() => {
                                $scope.logOut();
                            }, 5000);
                        }
                        else if(response.data === "booking_from_required") {
                            $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                        }
                        else if(response.data === "booking_to_required") {
                            $("#demo2").notify("Please select trip date.", { position: "bottom-center" });
                        }
                        else if (response.data === "same_date") {
                            $("#demo2").notify("Please select a different date.", { position: "bottom-center" });
                        }
                        else if (response.data === "dateone_in_the_past") {
                            $("#demo1").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if (response.data === "datetwo_in_the_past") {
                            $("#demo2").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if (response.data === "dateone_greater") {
                            $("#demo1").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if(response.data === "token_expired") {
                            $scope.logOut();
                        }
                        else if(response.data === "no_mode") {
                            $scope.showTripMode();
                        }
                        else if(response.data === "dateone_one_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.callCloseBookTrip();
                            Utilities.showPendingTrip();
                        }
                        else if(response.data === "dateone_two_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.callCloseBookTrip();
                            Utilities.showPendingTrip();
                        }
                        else {
                            $(".booktrip").notify("Sorry there has been a problem.", { position: "bottom-center" });
                        }
                    })
                }
            }
        }

        $scope.bookTrip = () => {
            let email = user.data.email;
            let type1 = document.querySelector("input[value=roundtrip]");
            let type2 = document.querySelector("input[value=oneride]");
            let routefrom = $scope.dep;
            let routeto = $scope.dest;
            let from = $("#demo1").val();
            let to = $("#demo2").val();
            let ct_cardnumber = $scope.cardnumber;
            let token = user.data.token;

            BookTrip(email, type1, type2, routefrom, routeto, from, to, ct_cardnumber, token);
        }

        $scope.loadHistory = (numofdays) => {
            Transporter.gethistory({
                type: "booking",
                numofdays: numofdays,
                email: email,
                token: user.data.token
            }).then(response => {
                $log.log("Response: ", response);

                $scope.booking_history = response.data;

            })
        }

        $scope.showTripMode = () => {

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

        $scope.closeModePeriod = () => {
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

        $scope.determineMode = (mode) => {
            if(mode === "oneride") {
                $scope.showTripMode();
            }
            else if(mode === "roundtrip") {
                $scope.closeModePeriod();
            }
        }

        let tripmode;
        $scope.modifyMode = (mode) => {
            tripmode = mode;
            $("#tripmode").val(mode);

            setTimeout(() => {
                $scope.closeModePeriod();
            }, 400);
        }

        $scope.closePendingTrip = () => {
            return Utilities.closePendingTrip();
        };

        $scope.cancelTrip = () => {
            let id = $("#id").val();

            $log.log("Id: ", id);

            if(id) {
                Transporter.cancelbooking({
                    bookingid: id,
                    token: user.data.token
                }).then(response => {
                    Utilities.showGeneralLoader();

                    if(response.status) {
                        $(".trip_note").notify("Booking Successfully cancelled.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            Utilities.closePendingTrip();
                        }, 10000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        $(".trip_note").notify("Sorry. Access time expired. Redirecting to login now", { position: "bottom-center" });

                        setTimeout(() => {
                            $state.go("login");
                        }, 5000)
                    }else {
                        $(".trip_note").notify("Sorry. There has been a problem. Please try again.", { position: "bottom-center" });
                    }
                })
            }
            else {
                $log.log("No id !");
            }
        }
    }

    function PaymentPageController($scope, $log, Transporter, $state, $stateParams, Utilities) {

        $(".ui.active.dimmer").css("display", "none");
        let ravepublic = "FLWPUBK-6195e6a12e7c7472d88a24f73a30b586-X";

        let user = store.get("user");
        let updated_bal = store.get("updated_bal");

        if(user) {
            
            $scope.total_bal = user.data.balance;
            $scope.fullname = user.data.fullname;
            $scope.ct_cardnumber = user.data.cardnumber;
            $scope.num_bankpayments = "N"+Utilities.numberWithCommas(user.data.num_bankpayments);
            $scope.num_cardpayments = "N"+Utilities.numberWithCommas(user.data.num_cardpayments);
        }
        else {
            $state.go("login");
        }

        let showLoader = () => {
            $(".paymentloader").css("display", "block");
        }

        let hideLoader = () => {
            $(".paymentloader").css("display", "none");
        }

        //5438898014560229
        //cvv 564
        //Expiry: 10/20
        //Pin 3310
        //otp 12345

        let getBalance = (email) => {
            if(email) {
                Transporter.getbalance({
                    email: email
                })
                .then(response => {

                    $scope.total_bal = response.data;
                    let obj = store.get("user");

                    obj.data.balance = response.data;

                    store.set("user", obj);

                    $(".successful_payment").css("display", "none");
                });
            }
        }

        let payWithRavePay = (email, phone, txref, amount) => {
            var x = getpaidSetup({
                PBFPubKey: ravepublic,
                customer_email: email,
                amount: amount,
                customer_phone: phone,
                currency: "NGN",
                txref: txref,
                onclose: function() {
                    console.log("Closed!");
                },
                callback: function(response) {
                    var txref = response.tx.txRef; // collect txRef returned and pass to a server page to complete status check.
                    console.log("This is the response returned after a charge", response);
                    if (response.tx.chargeResponseCode == "00" || response.tx.chargeResponseCode == "0" ) {

                        $(".successful_payment").css("display", "block");
                        getBalance(email);

                        console.log("Successfully paid.")
                        // redirect to a success page
                    } else {
                        $(".failed_payment").css("display", "block");
                        console.log("Payment Failed.")
                        // redirect to a failure page.
                    }

                    x.close(); // use this to close the modal immediately after payment.
                }
            });
        }

        $scope.payInstant = () => {
            if(!$scope.onlineemail) $("#onlineemail").notify("Please enter your email address.", { position: "bottom-center" });
            
            else if(!validateEmail($scope.onlineemail)) $("#onlineemail").notify("Please enter a valid email address.", { position: "bottom-center" });
            
            else if(!$scope.onlineamount) $("#onlineamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
            
            else {

                showLoader();

                Transporter.fund_ct({
                    email: $scope.onlineemail,
                    amount: $scope.onlineamount,
                    paymenttype: "Online Instant"
                }).then(response => {
                    if(response.status) {
                        hideLoader();
                        console.log("Response: ", response);

                        payWithRavePay(response.email, response.phone, response.ref, $scope.onlineamount);
                    }
                });
            }
        };

        $scope.payBank = () => {
            if(!$scope.bankemail) $("#bankemail").notify("Please enter your email address.", { position: "bottom-center" });
            
            else if(!Utilities.validmail($scope.bankemail)) $("#bankemail").notify("Please enter a valid email address.", { position: "bottom-center" });
            
            else if(!$scope.bankamount) $("#bankamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
            
            else {

                //showLoader();

                Transporter.fund_ct({
                    email: $scope.bankemail,
                    amount: $scope.bankamount,
                    paymenttype: "Bank Payment",
                    token: user.data.token
                }).then(response => {
                    if(response.status) {
                        //hideLoader();
                        console.log("Response: ", response);
                        payWithRavePay(response.email, response.phone, response.ref, $scope.bankamount);

                        /*store.set("bankdata", {ref: response.ref, email: $scope.bankemail, amount: bankamount, phone: bankphone});

                        $('.ui.modal')
                            .modal({
                                blurring: true
                            })
                            .modal('show')
                        ;*/
                    }
                    else {
                        console.log("Response: ", response);
                    }
                });
            }
        };

        /*$scope.payToRave = () => {//bank_id
            if(!$scope.acct_number) $("#acct_number").notify("Please enter your account number.", { position: "bottom-center" });

            else if(!$scope.bank_id) $("#bank_id").notify("Please select your bank.", { position: "bottom-center" });
            
            //else if(!$scope.bank_bvn) $("#bank_bvn").notify("Please enter your card number.", { position: "bottom-center" });
            
            else {

                let data = store.get("bankdata");

                //showLoader();

                Transporter.paytoravebank({
                    PBFPubKey: ravepublic,
                    accountbank: $scope.bank_id,
                    accountnumber: $scope.acct_number,
                    amount: data.amount,
                    email: data.email,
                    phonenumber: data.phone,
                    txRef: data.ref,
                    payment_type: "account"

                }).then(response => {
                    console.log("Response from rave ", response);
                });
            }
        }*/
    }

    function PaymentHistoryController($scope, $log, Transporter, $state, Utilities) {

        let user = store.get("user");

        if(user) {
            $scope.fullname = user.data.fullname;
            $scope.ct_cardnumber = user.data.cardnumber;
        }
        else {
            $state.go("login")
        }

        if(user && user.data.email) {
            Transporter.getpaymenthistory({
                email: user.data.email,
                token: user.data.token
            }).then(response => {
                $log.log("response payment: ", response);

                Utilities.hideLoader();

                if(response.status) {
                    if(response.data.length > 0) {

                        $scope.payments_history = response.data;
                        $scope.fullname = response.user_details.fullname;
                        $scope.balance = response.user_details.balance;
                        $scope.cardnumber = user.data.cardnumber;

                        Utilities.alternateColors();

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 1000);

                    }else{
                        $(".payment_one").show();
                        console.log("no payment history found.");
                    }
                }
                else {
                    console.log("there has been an unknown problem.")
                }
            })
        }else {
            $state.go("login");
        }

        $scope.showContactUs = () => {

            return Utilities.callShowContactUs();
        };

        $scope.closecontactus = () => {

            return Utilities.callCloseContactUs();
        };

        $scope.sendComplaint = () => {
            let email = $scope.supportemail;
            let subject = $scope.supportsubject;
            let text = $scope.supporttext;

            return Utilities.validateInput(email, subject, text);
        }

        $scope.loadHistory = (numofdays) => {
            Utilities.showLoader();

            Transporter.gethistory({
                type: "payment",
                numofdays: numofdays,
                email: user.data.email,
                token: user.data.token
            }).then(response => {
                $log.log("Response loadHistory: ", response);
                Utilities.hideLoader();

                if(response.data.length > 0) {
                    $scope.payments_history = response.data;
                    $(".payment_one").hide();

                    setTimeout(() => {
                        Utilities.alternateColors();
                    }, 1000);

                } 
                else {
                    $scope.payments_history = response.data;
                    $(".payment_one").show();
                    console.log("no payment history found.");
                }
            })
        }

        $scope.searchHistory = () => {

            if(!$("#tr_from").val()) {
                $("#tr_from").notify("Please select a date.", {"position" : "bottom-center"});
            }
            else if(!$("#tr_to").val()) {
                $("#tr_to").notify("Please select a date.", {"position" : "bottom-center"});
            }
            else {

                let dateone = Utilities.formatDate($("#tr_from").val());
                let datetwo = Utilities.formatDate($("#tr_to").val());

                Utilities.showLoader();

                Transporter.searchhistory({
                    type: "payment",
                    startdate: dateone,
                    enddate: datetwo,
                    email: user.data.email,
                    token: user.data.token
                }).then(response => {
                    $log.log("Response searchhistory: ", response);
                    Utilities.hideLoader();

                    if(response.data.length > 0) {
                        $scope.payments_history = response.data;
                        $(".payment_one").hide();

                        Utilities.alternateColors();

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 1000);
                    }
                    else {
                        $scope.payments_history = response.data;
                        $(".payment_one").show();
                        console.log("no payment history found.");
                    }
                })
                $log.log("arrived successfully: ", $("#tr_from").val(), $("#tr_to").val());
            }
        }
    }

    function LandingController($scope, $log, $state, Transporter, Utilities) {
        $(".ui.active.dimmer").css("display", "none");

        let user = store.get("user");

        let currency = {name: "Naira", symbol: "₦"};

        if(user) {            
            let firstname = user.data.fullname.split(" ")[0];
            let lastname = user.data.fullname.split(" ")[1];

            $scope.user_fullname = Utilities.formatText(firstname) + " " + Utilities.formatText(lastname);
            $scope.user_username = "@"+user.data.username;
            $scope.user_balance = Utilities.numberWithCommas(user.data.balance);
            $scope.user_cardnumber = user.data.cardnumber;
            $scope.user_home = " " + user.data.home;
            $scope.user_work = user.data.work;
            $scope.user_trips_booked = user.data.numtrips;
            $scope.user_trips_taken = user.data.numtaken;
            $scope.user_total_dep = "N"+Utilities.numberWithCommas(user.data.totaldeposited);
            if(user.data.latestbooking) {
                $scope.user_next_trip_time = Utilities.formatDateDisplay(user.data.latestbooking)
            }
            else {
                $(".none_pending").show();
            }

            $(".ui.active.dimmer").css("display", "none");
        }
        else {
            $state.go("login");
        }

        $scope.logOut = () => {
            store.remove("user");
            $state.go("login");
        }

        $scope.showContactUs = () => {
            return Utilities.callShowContactUs();
        };

        $scope.closecontactus = () => {
            return Utilities.callCloseContactUs();
        };

        $scope.closePendingTrip = () => {
            return Utilities.closePendingTrip();
        };

        $scope.showBookTrip = () => {
            return Utilities.showBookTrip();
        };

        $scope.cancelTrip = () => {
            let id = $("#id").val();

            $log.log("Id: ", id);

            if(id) {
                Transporter.cancelbooking({
                    bookingid: id,
                    token: user.data.token
                }).then(response => {
                    Utilities.showGeneralLoader();

                    if(response.status) {
                        $(".trip_note").notify("Booking Successfully cancelled.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            Utilities.closePendingTrip();
                        }, 10000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        $(".trip_note").notify("Sorry. Access time expired. Redirecting to login now", { position: "bottom-center" });

                        setTimeout(() => {
                            $state.go("login");
                        }, 5000)
                    }else {
                        $(".trip_note").notify("Sorry. There has been a problem. Please try again.", { position: "bottom-center" });
                    }
                })
            }
            else {
                $log.log("No id !");
            }
        }

        $scope.closeBookTrip = () => {
            return Utilities.callCloseBookTrip();
        };

        $scope.sendComplaint = () => {
            
            let email = $scope.supportemail;
            let subject = $scope.supportsubject;
            let text = $scope.supporttext;

            return Utilities.validateInput(email, subject, text);
        }

        $scope.showTripMode = () => {
            Utilities.showTripMode();
        }

        $scope.closeModePeriod = () => {
           Utilities.closeTripMode();
        }

        $scope.determineMode = (mode) => {
            if(mode === "oneride") {
                $scope.showTripMode();
            }
            else if(mode === "roundtrip") {
                $scope.closeModePeriod();
            }
        }

        let tripmode;
        $scope.modifyMode = (mode) => {
            tripmode = mode;
            $("#tripmode").val(mode);

            setTimeout(() => {
                $scope.closeModePeriod();
            }, 400);
        }

        let checkedvalue
        let BookTrip = (email, type1, type2, routefrom, routeto, from, to, ct_cardnumber, token) => {
            if(email) {
                if(!document.querySelector("input[value=roundtrip]").checked && !document.querySelector("input[value=oneride]").checked) {
                    $(".choicefields").notify("Please check one of the fields.", { position: "bottom-center" });
                }
                else if (!routefrom) {
                    $("#dep").notify("Point of departure is required.", { position: "bottom-center" });
                }
                else if (!routeto) {
                    $("#dest").notify("Destination is required.", { position: "bottom-center" });
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                }
                else if(!from) {
                    $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                }
                else if(!ct_cardnumber) {
                    $("#cardnumber").notify("Please enter your card number.", { position: "bottom-center" });
                }
                else {

                    if(document.querySelector("input[value=roundtrip]").checked) {
                        checkedvalue = "Round Trip"
                    }
                    else {
                        checkedvalue = "One Way Trip"
                    }

                    if(from) {
                        from = Utilities.formatDate(from);
                    }
                    if(to) {
                        to = Utilities.formatDate(to);
                    }

                    Utilities.showGeneralLoader();
                    Utilities.disableButton("bookaride-button");

                    Transporter.booktrip({
                        email: email,
                        bookingtype: checkedvalue,
                        routefrom: routefrom,
                        routeto: routeto,
                        from: from,
                        to: to,
                        ct_cardnumber: ct_cardnumber,
                        token: token,
                        tripmode: $("#tripmode").val()
                    }).then(response => {
                        console.log("response: ", response.pendingbooking);

                        Utilities.hideGeneralLoader();

                        if(response.status) {
                            $(".popup_title").notify("Your booking was successful. Check your mail for details.", "success", { position: "top-center" });

                            $("#dep").val("");
                            $("#dest").val("");
                            $("#cardnumber").val("");
                            $("#demo1").val("");
                            $("#demo2").val("");

                            setTimeout(() => {
                                Utilities.callCloseBookTrip();
                            }, 10000);
                        }
                        else if(response.data === "not_found") {
                            $(".booktrip").notify("Authentication problem. Login out in 5 seconds...", { position: "bottom-center" });

                            setTimeout(() => {
                                $scope.logOut();
                            }, 5000);
                        }
                        else if(response.data === "booking_from_required") {
                            $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                        }
                        else if(response.data === "booking_to_required") {
                            $("#demo2").notify("Please select trip date.", { position: "bottom-center" });
                        }
                        else if (response.data === "same_date") {
                            $("#demo2").notify("Please select a different date.", { position: "bottom-center" });
                        }
                        else if (response.data === "dateone_in_the_past") {
                            $("#demo1").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if (response.data === "datetwo_in_the_past") {
                            $("#demo2").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if (response.data === "dateone_greater") {
                            $("#demo1").notify("Date is invalid.", { position: "bottom-center" });
                        }
                        else if(response.data === "token_expired") {
                            $scope.logOut();
                        }
                        else if(response.data === "no_mode") {
                            $scope.showTripMode();
                        }
                        else if(response.data === "dateone_one_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.callCloseBookTrip();
                            Utilities.showPendingTrip();
                        }
                        else if(response.data === "dateone_two_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.callCloseBookTrip();
                            Utilities.showPendingTrip();
                        }
                        else {
                            $(".booktrip").notify("Sorry there has been a problem.", { position: "bottom-center" });
                        }
                    })
                }
            }
        }

        $scope.bookTrip = () => {
            let email = user.data.email;
            let type1 = document.querySelector("input[value=roundtrip]");
            let type2 = document.querySelector("input[value=oneride]");
            let routefrom = $scope.dep;
            let routeto = $scope.dest;
            let from = $("#demo1").val();
            let to = $("#demo2").val();
            let ct_cardnumber = $scope.cardnumber;
            let token = user.data.token;

            BookTrip(email, type1, type2, routefrom, routeto, from, to, ct_cardnumber, token);
        }
    }

    function HowItWorksController($scope, $log, $state) {  
    }

    function TransactionController($scope, Utilities, $log, Transporter, $state) {
        let user = store.get("user");

        if(user) {
            $scope.fullname = user.data.fullname;
            $scope.ct_cardnumber = user.data.cardnumber;
        }
        else {
            $state.go("login");
        }

        if(user && user.data.email) {
            Utilities.showLoader();

            Transporter.getbookinghistory({
                email: user.data.email,
                token: user.data.token
            }).then(response => {
                $log.log("response transaction: ", response);

                Utilities.hideLoader();

                if(response.status) {
                    if(response.data.length > 0) {
                       $scope.transaction_history = response.data;

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 1000);

                    }else{
                        $scope.transaction_history = response.data;
                        $(".transaction_one").css("display", "block");
                        console.log("no transaction history found.");
                    }
                }else {
                    if(response.data === "token_expired") {
                        store.remove("user");
                        $state.go("login");
                    }
                }
            })
        }else {
            $state.go("login");
        }

        $scope.showContactUs = () => {
            return Utilities.callShowContactUs();
        };

        $scope.closecontactus = () => {
            return Utilities.callCloseContactUs();
        };

        $scope.sendComplaint = () => {
            
            let email = $scope.supportemail;
            let subject = $scope.supportsubject;
            let text = $scope.supporttext;

            return Utilities.validateInput(email, subject, text);
        }

        $scope.loadHistory = (numofdays) => {
            Utilities.showLoader();

            Transporter.gethistory({
                type: "booking",
                numofdays: numofdays,
                email: user.data.email,
                token: user.data.token
            }).then(response => {
                Utilities.hideLoader();

                if(response.status) {
                    if(response.data.length > 0) {
                        $scope.transaction_history = response.data;
                        $(".transaction_one").css("display", "none");

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 3000);
                    }
                    else {
                        $scope.transaction_history = response.data;
                        $(".transaction_one").css("display", "block");
                    }
                }
                else if(response.data === "token_expired") {
                    store.remove("user");
                    $state.go("login");
                }
            })
        }

        $scope.searchHistory = () => {

            if(!$("#tr_from").val()) {
                $("#tr_from").notify("Please select a date.", {"position" : "bottom-center"});
            }
            else if(!$("#tr_to").val()) {
                $("#tr_to").notify("Please select a date.", {"position" : "bottom-center"});
            }
            else {

                let dateone = Utilities.formatDate($("#tr_from").val());
                let datetwo = Utilities.formatDate($("#tr_to").val());

                Utilities.showLoader();

                Transporter.searchhistory({
                    type: "booking",
                    startdate: dateone,
                    enddate: datetwo,
                    email: user.data.email,
                    token: user.data.token
                }).then(response => {
                    Utilities.hideLoader();

                    if(response.status) {
                        if(response.data.length > 0) {
                            $scope.transaction_history = response.data;
                            $(".transaction_one").css("display", "none");

                            setTimeout(() => {
                                Utilities.alternateColors();
                            }, 3000);
                        }
                        else {
                            $scope.transaction_history = response.data;
                            $(".transaction_one").css("display", "block");
                        }
                    }
                    else if(response.data === "token_expired") {
                        store.remove("user");
                        $state.go("login");
                    }
                })
            }
        }
    }