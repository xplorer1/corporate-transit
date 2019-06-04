angular.module('ControllersModule', [])
    .controller('MainPageController', ['$scope', '$state', '$log', '$window', '$location', MainPageController])
    .controller('PaymentHistoryController', ['$scope', '$log', 'Transporter', '$state', 'Utilities', PaymentHistoryController])
    .controller('SignUpPageController', ['$scope',  '$log', 'Transporter', '$stateParams', '$state', 'Utilities', SignUpPageController])
    .controller('LoginPageController', ['$scope', '$log', 'Transporter', '$state', '$stateParams', 'Utilities', LoginPageController])
    .controller('LandingController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', LandingController])
    .controller('GeneralController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', GeneralController])
    .controller('AdminController', ['$scope', '$log', '$state', '$stateParams', 'Utilities', 'AdminService', '$window', AdminController])
    .controller('BookingHistoryController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', BookingHistoryController])
    .controller('TransactionController', ['$scope', 'Utilities', '$log', 'Transporter', '$state', TransactionController]);

    function MainPageController($scope, $state, $log, $window, $location) {
        let url = $location.url();

        if(url === "/" || url === "#" || url === "/#how_it_works" || url === "/#why_sec" || url === "/#about_sec") {
            $(".ui.active.dimmer").css("display", "none");
        }

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
                }
                else {
                    if(response.data === "acct_verified") {
                        $("#verified").css("display", "none");
                        $("#notverified").css("display", "block");
                    }else if(response.data === "token_notfound") {
                        $state.go("notfound");
                    }
                }
            })
        }

        $(".ui.active.dimmer").css("display", "none");

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

                        $(".resendcodebutton").notify("Activation email sent to your email address.", "success", { position: "bottom-center" });
                        break;
                    default:
                        $("#signupform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        }
    }

    function LoginPageController($scope, $log, Transporter, $state, $stateParams, Utilities) {

        if($stateParams.resetcode) {
            Transporter.checkcode({
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
                    }
                    else if(response.data === "notfound") {
                        $state.go("notfound");
                    }
                }
            });
        }

        $(".ui.active.dimmer").css("display", "none");

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
                        case "carddisabled":
                            $("#loginform").notify("Your card has been disabled. Please contact support.", { position: "bottom-center" });
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
            else if($scope.new_password.toString() !== $scope.confirm_password.toString()) {
                $("#confirm_password").notify("Passwords don't match.", { position: "bottom-center" });
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
                        $(".resetbutton").notify("Your password has been successfully changed.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            $state.go("login");
                        }, 3000)
                    }else {
                        $(".resetbutton").notify("Password change unsuccessful. Please try again later.", { position: "bottom-center" });
                    }
                })
            }
        };

        $scope.resendResetCode = () => {
            let user = store.get("user");

            let email = Utilities.user["email"] || user.data.email;

            Utilities.showGeneralLoader();

            Transporter.resendresetcode({
                email: email
            }).then(response => {
                $log.log("Response: ", response);

                Utilities.hideGeneralLoader();

                switch (response.data){
                    case "user_notfound":
                        $(".resetbutton").notify("Your email address was not found. Please register if you have no account.", { position: "bottom-center" });
                        break;
                    case "password_resetlink_sent":
                        $(".resetbutton").notify("Password reset link has been sent to your email address.", { position: "bottom-center" });
                        break;
                    default:
                        $(".resetbutton").notify("There has been a problem. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        };
    }

    function BookingHistoryController($scope, $log, $state, Transporter, Utilities) {

        $scope.showContactUs = () => {
            Utilities.showForm("contactus", "400px");
        };

        $scope.closecontactus = () => {
            Utilities.closeForm("contactus");
        };

        $scope.showBookTrip = () => {
            return Utilities.showForm("booktrip", "520px");
        };

        $scope.closeBookTrip = () => {
            return Utilities.closeForm("booktrip");
        };

        let showOptions = () => {
            return Utilities.showForm("edit_options", "55px");
        }

        $scope.closeOptions = () => {
            return Utilities.closeForm("edit_options");
        }

        let showChoice = () => {
            $scope.closeOptions();

            return Utilities.showForm("edit_choice", "87px");
        }

        $scope.closeChoice = () => {
            return Utilities.closeForm("edit_choice");
        }

        let user = store.get("user");

        if(user) {
            Utilities.showLoader();

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
                    Utilities.hideGeneralLoader();

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

                        Utilities.hideGeneralLoader();

                        if(response.status) {
                            $(".popup_title").notify("Your booking was successful. Check your mail for details.", "success", { position: "top-center" });

                            $("#dep").val("");
                            $("#dest").val("");
                            $("#cardnumber").val("");
                            $("#demo1").val("");
                            $("#demo2").val("");

                            setTimeout(() => {
                                Utilities.closeForm("booktrip");
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
                            Utilities.showForm("mode_period", "130px");
                        }
                        else if(response.data === "dateone_one_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.closeForm("booktrip");
                            Utilities.showForm("pendingtrip", "430px");
                        }
                        else if(response.data === "dateone_two_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.closeForm("booktrip");
                            Utilities.showForm("pendingtrip", "430px");
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
                        $scope.booking_history = response.data;
                        $(".booking_one").css("display", "none");

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 3000);
                    }
                    else {
                        $scope.booking_history = response.data;
                        $(".booking_one").css("display", "block");
                    }
                }
                else if(response.data === "token_expired") {
                    store.remove("user");
                    $state.go("login");
                }
            })
        }

        $("#sort").on('change', function() {
            var filter = $('#sort').find(":selected").val();

            if(filter) {
                return $scope.loadHistory(filter);
            }
        })

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
                            $scope.booking_history = response.data;
                            $(".booking_one").css("display", "none");

                            setTimeout(() => {
                                Utilities.alternateColors();
                            }, 3000);
                        }
                        else {
                            $scope.booking_history = response.data;
                            $(".booking_one").css("display", "block");
                        }
                    }
                    else if(response.data === "token_expired") {
                        store.remove("user");
                        $state.go("login");
                    }
                })
            }
        }

        $scope.showTripMode = () => {

            return Utilities.ShowForm("mode_period", "130px")
        }

        $scope.closeModePeriod = () => {

            return Utilities.closeForm("mode_period");
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
            return Utilities.closeForm("pendingtrip");
        };

        $scope.cancelTrip = () => {
            let id = $("#id").val();

            $log.log("Id: ", id);

            if(id) {
                Utilities.showGeneralLoader();

                Transporter.cancelbooking({
                    bookingid: id,
                    token: user.data.token
                }).then(response => {
                    Utilities.hideGeneralLoader();

                    if(response.status) {
                        $(".trip_note").notify("Booking Successfully cancelled.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            $scope.closePendingTrip();
                        }, 10000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        $(".trip_note").notify("Sorry. Access time expired. Redirecting to login now", { position: "bottom-center" });

                        setTimeout(() => {
                            store.remove("user");
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
            Utilities.showLoader();

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

            return Utilities.showForm("contactus", "400px");
        };

        $scope.closecontactus = () => {

            return Utilities.closeForm("contactus");
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

        $("#sort").on('change', function() {
            var filter = $('#sort').find(":selected").val();

            if(filter) {
                return $scope.loadHistory(filter);
            }
        })
    }

    function LandingController($scope, $log, $state, Transporter, Utilities) {
        $(".ui.active.dimmer").css("display", "none");

        let user = store.get("user");

        let currency = {name: "Naira", symbol: "₦"};

        let ravepublic = "FLWPUBK_TEST-8f1ee05b1e4c692149cccd3afd56b1bd-X";

        let ravesecret = "FLWSECK_TEST-381f15e4245f9053fdd1bc29ce32a69a-X";
        let raveenckey = "FLWSECK_TEST31dbdcbb6286";

        if(user && user.data) {            
            let firstname = user.data.fullname.split(" ")[0];
            let lastname = user.data.fullname.split(" ")[1];

            $scope.user_fullname = Utilities.formatText(firstname) + " " + Utilities.formatText(lastname);
            $scope.user_username = "@"+user.data.username;
            $scope.user_balance = Utilities.numberWithCommas(user.data.balance);
            
            setTimeout(() => {
                $("#cardnumber").val(user.data.cardnumber);
            }, 500);

            $scope.user_cardnumber = user.data.cardnumber;
            
            $scope.user_home = " " + user.data.home;
            $scope.user_work = user.data.work;
            $scope.user_trips_booked = user.data.numtrips;
            $scope.user_trips_taken = user.data.numtaken;
            $scope.user_total_dep = Utilities.numberWithCommas(user.data.totaldeposited);
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

        $scope.showSideBar = () => {
            $(".staticsidebar").removeClass("visible inverted vertical menu staticsidebar for_desk").addClass("sid_barr");

            $('.ui.sidebar')
                .sidebar('toggle')
            ;
        }

        $scope.hide_bar = () => {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                $('.ui.sidebar')
                    .sidebar('toggle')
                ;
            }
        }

        $scope.showContactUs = () => {
            return Utilities.showForm("contactus", "400px");
        };

        $scope.showFundCard = () => {
            return Utilities.showForm("fundcardform", "250px");
        };

        $scope.closeFundCard = () => {
            return Utilities.closeForm("fundcardform");
        };

        $scope.closecontactus = () => {
            return Utilities.closeForm("contactus", "400px");
        };

        $scope.closePendingTrip = () => {
            return Utilities.showForm("pendingtrip", "430px");
        };

        $scope.showBookTrip = () => {
            return Utilities.showForm("booktrip", "520px");
        };

        $scope.closeBookTrip = () => {
            return Utilities.closeForm("booktrip");
        };

        $scope.cancelTrip = () => {
            let id = $("#id").val();

            $log.log("Id: ", id);

            if(id) {
                Utilities.showLandingLoader();

                Transporter.cancelbooking({
                    bookingid: id,
                    token: user.data.token
                }).then(response => {

                    Utilities.hideLandingLoader();

                    if(response.status) {
                        $(".trip_note").notify("Booking Successfully cancelled.", "success", { position: "bottom-center" });

                        setTimeout(() => {
                            Utilities.closeForm("pendingtrip");
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

        $scope.sendComplaint = () => {
            
            let email = $scope.supportemail;
            let subject = $scope.supportsubject;
            let text = $scope.supporttext;

            return Utilities.validateInput(email, subject, text);
        }

        $scope.showTripMode = () => {
            Utilities.showForm("mode_period", "130px");
        }

        $scope.closeModePeriod = () => {
           Utilities.closeForm("mode_period");
        }

        let getBalance = (email) => {
            if(email) {
                Utilities.showLandingLoader();

                Transporter.getbalance({
                    email: email,
                    token: user.data.token
                })
                .then(response => {
                    Utilities.hideLandingLoader();

                    $scope.user_balance = Utilities.numberWithCommas(response.data);

                    $scope.user_total_dep = Utilities.numberWithCommas(response.totaldeposited);
                    let obj = store.get("user");

                    obj.data.balance = response.data;
                    obj.data.totaldeposited = response.totaldeposited;

                    store.set("user", obj);

                    $(".payment_end").css("display", "none");
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

                        $(".payment_end").css("display", "block");
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
            
            else if(!Utilities.validmail($scope.onlineemail)) $("#onlineemail").notify("Please enter a valid email address.", { position: "bottom-center" });
            
            else if(!$scope.onlineamount) $("#onlineamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
            
            else {

                Utilities.showLandingLoader();

                Transporter.fund_ct({
                    email: $scope.onlineemail,
                    amount: $scope.onlineamount,
                    token: user.data.token
                }).then(response => {
                    if(response.status) {
                        Utilities.hideLandingLoader();

                        Utilities.closeForm("fundcardform");
                        payWithRavePay(response.email, response.phone, response.ref, $scope.onlineamount);
                    }
                    else {
                        if(response.data === "token_expired") {
                            $scope.logOut();
                        }
                    }
                });
            }
        }

        $scope.determineMode = (mode) => {
            if(mode === "oneride") {
                Utilities.showForm("mode_period", "130px");
            }
            else if(mode === "roundtrip") {
                Utilities.closeForm("mode_period");
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

                    Utilities.showLandingLoader();
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

                        Utilities.hideLandingLoader();

                        if(response.status) {
                            $(".popup_title").notify("Your booking was successful. Check your mail for details.", "success", { position: "top-center" });

                            $("#dep").val("");
                            $("#dest").val("");
                            $("#cardnumber").val("");
                            $("#demo1").val("");
                            $("#demo2").val("");

                            setTimeout(() => {
                                Utilities.closeForm("booktrip");
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
                            Utilities.showForm("mode_period", "130px");
                        }
                        else if(response.data === "dateone_one_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.closeForm("booktrip");
                            Utilities.showForm("pendingtrip", "430px");
                        }
                        else if(response.data === "dateone_two_less_than_pending") {
                            $scope.pendingtrip = response.pendingbooking;
                            Utilities.closeForm("booktrip");
                            Utilities.showForm("pendingtrip", "430px");
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

                Utilities.hideLoader();

                if(response.status) {
                    if(response.data.length > 0) {
                       $scope.transaction_history = response.data;

                        setTimeout(() => {
                            Utilities.alternateColors();
                        }, 1000);

                    }
                    else{
                        $scope.transaction_history = response.data;
                        $(".transaction_one").css("display", "block");
                        console.log("no transaction history found.");
                    }
                }
                else {
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
            return Utilities.showForm("contactus", "400px");
        };

        $scope.closecontactus = () => {
            return Utilities.closeForm("contactus");
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

        $("#sort").on('change', function() {
            var filter = $('#sort').find(":selected").val();

            if(filter) {
                return $scope.loadHistory(filter);
            }
        })

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

    function AdminController($scope, $log, $state, $stateParams, Utilities, AdminService, $window) { 
        $(".ui.active.dimmer").css("display", "none");

        $('.timepicker').pickatime({
            interval: 5
        })

        let admindata = store.get("admindata");

        $scope.adminLogOut = () => {
            store.remove(admindata);
            $state.go("adminlogin");
        }

        if(admindata) {
            $scope.name = admindata.name;
            $scope.role = admindata.role;
            $scope.numusers = admindata.numusers;
            $scope.numbookings = admindata.numbookings;
            $scope.numearned = Utilities.numberWithCommas(admindata.totaldeposited);
            $scope.numtrips = admindata.numtaken;

            $scope.messages = admindata.messages;
            $scope.admins = admindata.admins;
            $scope.regionscount = admindata.userregioncountarray;
            $scope.routescount = admindata.userroutecountarray;
        }
        else {
            $scope.adminLogOut();
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

                AdminService.adminlogin({
                    email: $scope.email,
                    password: $scope.password
                }).then(response => {
                    $log.log("Response adminlogin: ", response);
                    $scope.loginclicked = false;

                    Utilities.hideGeneralLoader();

                    switch (response.data){
                        case "not_activated":
                            $("#loginform").notify("Your account has not been verified. Activation link has been sent to your email address. Also check your spam/junk folders.", { position: "bottom-center" });
                            break;
                        case "login_successful":
                            let admindata = store.get("admindata");

                            store.set("admindata", response.userdata);

                            $state.go("admin");
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

        $scope.checkSuper = (mode, id) => {
            $scope.adminmode = mode;

            if(id) {
                $scope.admin_id = id;
            }

            Utilities.showForm("verifysuper", "220px");
        }

        $scope.enableUserCard = () => {
            Utilities.showForm("enablecardform", "210px");
        }

        $scope.disableUserCard = () => {
            Utilities.showForm("disablecardform", "210px");
        }

        $scope.closeVerifySuper = () => {
            Utilities.closeForm("verifysuper");
        }

        $scope.showAddRouteForm = () => {
            Utilities.showForm("addrouteform", "520px");
        }

        $scope.closeAddRouteForm = () => {
            Utilities.closeForm("addrouteform");
        }

        $scope.showChangeFareForm = () => {
            Utilities.showForm("changefareform", "300px");
        }

        $scope.closeChangeFareForm = () => {
            Utilities.closeForm("changefareform");
        }

        $scope.closeEnableCardForm = () => {
            Utilities.closeForm("enablecardform");
        }

        $scope.closeDisableCardForm = () => {
            Utilities.closeForm("disablecardform");
        }

        $scope.changeFare = () => {
            if(!$scope.c_dep) {
                $("#c_dep").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.c_dest) {
                $("#c_dest").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.c_fareoneway) {
                $("#c_fareoneway").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.c_farereturn) {
                $("#c_farereturn").notify("Required.", { position: "bottom-center" });
            }

            else {
                Utilities.showGeneralLoader();

                AdminService.changefare({
                    token: admindata.token,
                    route: $scope.c_dep.split(" - ")[1] + " - " + $scope.c_dest.split(" - ")[1],
                    fareoneway: $scope.c_fareoneway,
                    farereturn: $scope.c_farereturn
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    $log.log("response changeFare: ", response);

                    if(response.data === "fareupdated") {
                        $(".fareheader").notify("Fare successfully updated.", "success", { position: "bottom-center" });
                        $("#c_dep").val("");
                        $("#c_dest").val("");
                        $("#c_fareoneway").val("");
                        $("#c_farereturn").val("");

                        setTimeout(() => {
                            Utilities.closeForm("changefareform");
                        }, 5000)
                    }
                    else if(response.data === "unknown_error") {
                        $(".fareheader").notify("Error. Please try again.", { position: "bottom-center" });
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                    else if(response.data === "route_notfound") {
                        $(".fareheader").notify("This route was not found.", { position: "bottom-center" });
                    }
                })
            }
        }

        $scope.addRoute = () => {
            if(!$scope.dep) {
                $("#dep").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.dest) {
                $("#dest").notify("Required.", { position: "bottom-center" });
            }

            else if(!$("#morningpickup").val()) {
                $("#morningpickup").notify("Required.", { position: "bottom-center" });
            }

            else if(!$("#morningdrop").val()) {
                $("#morningdrop").notify("Required.", { position: "bottom-center" });
            }

            else if(!$("#eveningpickup").val()) {
                $("#eveningpickup").notify("Required.", { position: "bottom-center" });
            }

            else if(!$("#eveningdrop").val()) {
                $("#eveningdrop").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.morningpickuppoint) {
                $("#morningpickuppoint").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.morningdroppoint) {
                $("#morningdroppoint").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.eveningpickuppoint) {
                $("#eveningpickuppoint").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.eveningdroppoint) {
                $("#eveningdroppoint").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.fareoneway) {
                $("#fareoneway").notify("Required.", { position: "bottom-center" });
            }

            else if(!$scope.farereturn) {
                $("#farereturn").notify("Required.", { position: "bottom-center" });
            }

            else {
                Utilities.showGeneralLoader();

                AdminService.addroute({
                    token: admindata.token,
                    route: $scope.dep.split(" - ")[1] + " - " + $scope.dest.split(" - ")[1],
                    morningpickuptime: $("#morningpickup").val(),
                    eveningpickuptime: $("#eveningpickup").val(),
                    morningdroptime: $("#morningdrop").val(),
                    eveningdroptime: $("#eveningdrop").val(),
                    morningpickupplace: $scope.morningpickuppoint,
                    morningdropplace: $scope.morningdroppoint,
                    eveningpickupplace: $scope.eveningpickuppoint,
                    eveningdropplace: $scope.eveningdroppoint,
                    fareoneway: $scope.fareoneway,
                    farereturn: $scope.farereturn
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    $log.log("response addroute: ", response);

                    if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                    else if(response.data === "route_exists") {
                        $(".routeheader").notify("This route exists!", { position: "bottom-center" });
                    }
                    else if(response.data === "unknown_error1" || response.data === "unknown_error2") {
                        $(".routeheader").notify("Error. Please try again later.", { position: "bottom-center" });
                    }
                    else if(response.data === "stuffsaved") {
                        $(".routeheader").notify("Route saved successfully.", { position: "bottom-center" });
                        $("#dep").val("");
                        $("#dest").val("");
                        $("#morningpickup").val("");
                        $("#eveningpickup").val("");
                        $("#morningdrop").val("");
                        $("#eveningdrop").val("");
                        $("#morningpickuppoint").val("");
                        $("#morningdroppoint").val("");
                        $("#eveningpickuppoint").val("");
                        $("#eveningdroppoint").val("");
                        $("#fareoneway").val("");
                        $("#farereturn").val("");

                        setTimeout(() => {
                            Utilities.closeForm("addrouteform");
                        }, 5000)
                    }
                })
            }
        }

        $scope.verifySuper = () => {
            if(!$scope.superpassword) {
                $("#superpassword").notify("Please enter your password.", { position: "bottom-center" });
            }
            else {

                Utilities.showGeneralLoader();

                AdminService.verifysuper({
                    email: admindata.email,
                    password: $scope.superpassword,
                    token: admindata.token
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    if(response.data === "account_notfound") {
                        $("#superpassword").notify("Invalid password.", { position: "bottom-center" });
                    }
                    else if (response.data === "user_exists") {
                        $("#superpassword").val("");
                        $scope.closeVerifySuper();

                        if($scope.adminmode === "delete" && $scope.admin_id) {
                            $scope.targetadmin = admindata.admins.find(function(value) {

                                return value.id === $scope.admin_id;
                            });

                            Utilities.showForm("verifydelete", "200px");
                        }
                        else if($scope.adminmode === "add") {
                            Utilities.showForm("adduserform", "250px");
                        }
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                })
            }
        }

        $scope.addUser = () => {
            if(!$scope.newadminemail) {
                $("#newadminemail").notify("Please fill this form.", { position: "bottom-center" });
            }
            else if(!Utilities.validmail($scope.newadminemail)) {
                $("#newadminemail").notify("Please enter valid email.", { position: "bottom-center" });
            }
            else if(!$scope.newadminname) {
                $("#newadminname").notify("Please fill this form.", { position: "bottom-center" });
            }
            else {

                if($scope.newadminname.length === 2) {
                    $scope.newadminname = $scope.newadminname.split(" ")[0]+$scope.newadminname.split(" ")[1]
                }

                Utilities.showGeneralLoader();

                AdminService.adduser({
                    email: $scope.newadminemail,
                    name: $scope.newadminname,
                    token: admindata.token
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    if(response.data === "username_exists") {
                        $("#newadminname").notify("Name exists. Choose another.", { position: "bottom-center" });
                    }
                    else if(response.data === "user_exists") {
                        $("#newadminname").notify("Email address exists.", { position: "bottom-center" });
                    }
                    else if(response.data === "admin_saved") {
                        $("#newadminemail").notify("Admin added.", "success", { position: "bottom-center" });

                        $scope.admins = response.admins;

                        let obj = store.get("admindata");

                        obj.admins = response.admins;

                        store.set("admindata", obj);

                        setTimeout(() => {
                            Utilities.closeForm("adduserform");
                        }, 10000);
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                })
            }
        }

        $scope.deleteUser = (adminid) => {
            if(!$scope.deletehoice) {
                $("#deletehoice").notify("Required.", { position: "bottom-center" });
            }
            else if($scope.deletehoice.toUpperCase().trim() !== "YES" && $scope.deletehoice.toUpperCase().trim() !== "NO") {
                $("#deletehoice").notify("Please enter YES or NO.", { position: "bottom-center" });
            }
            else if($scope.deletehoice.toUpperCase().trim() === "NO") {
                Utilities.closeForm("verifydelete");
            }
            else {

                Utilities.showGeneralLoader();

                AdminService.deleteuser({
                    id: adminid,
                    token: admindata.token
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    if(response.data === "account_notfound") {
                        $("#deletehoice").notify("Please refresh your page and try again.", { position: "bottom-center" });
                    }
                    else if(response.data === "found_superuser") {
                        $("#deletehoice").notify("You can not delete a super user.", { position: "bottom-center" });
                    }
                    else if(response.message === "admin_deleted") {
                        $("#deletehoice").notify("Admin removed.", "success", { position: "bottom-center" });

                        $scope.admins = response.data;

                        let obj = store.get("admindata");

                        obj.admins = response.data;

                        store.set("admindata", obj);

                        //location.replace("main.html");

                        setTimeout(() => {
                            Utilities.closeForm("verifydelete");
                        }, 5000);
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                })
            }
        }

        let targetmessage;

        $scope.replyMessage = (id, status) => {
            if(status === "Pending") {
                targetmessage = admindata.messages.find(function(value) {

                    return value._id === id;
                });

                $scope.targetcomplaint = targetmessage;

                Utilities.showForm("message", "370px");
            }
            else {

                targetmessage = admindata.messages.find(function(value) {

                    return value._id === id;
                });

                $scope.targetcomplaint = targetmessage;

                Utilities.showForm("viewrepliedmessage", "370px");
            }
        }

        $scope.transferRole = () => {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                $('.ui.sidebar')
                    .sidebar('toggle')
                ;
            }

            $window.alert("Feature coming soon.");
        }

        $scope.viewReply = (id) => {
            if(id) {
                $scope.closeViewRepliedMessage();
                Utilities.showForm("repliedmessage", "300px");
            }
        }

        $scope.closeViewRepliedMessage = () => {
            Utilities.closeForm("viewrepliedmessage");
        }

        $scope.closeRepliedMessage = () => {
            Utilities.closeForm("repliedmessage");
        }

        $scope.closeMessage = () => {
            Utilities.closeForm("message");
        }

        $scope.closeReplyComplaint = () => {
            Utilities.closeForm("replycomplaint");
        }

        $scope.reply = (messageid) => {
            if(messageid) {
                $scope.closeMessage();
                Utilities.showForm("replycomplaint", "300px");
            }
        }

        $scope.replyComplaint = () => {
            if(!$scope.replytext) {
                $("#replytext").notify("Please enter some text.", { position: "bottom-center" });
            }
            else {
                Utilities.showGeneralLoader();

                AdminService.replymessage({
                    id: targetmessage._id,
                    subject: targetmessage.subject,
                    token: admindata.token,
                    replytext: $scope.replytext,
                    replyfrom: admindata.fullname
                })
                .then(response => {
                    Utilities.hideGeneralLoader();

                    $log.log("replytext: ", response);
                    if(response.data === "already_replied") {
                        $("#replytext").notify("This message has already been replied.", { position: "bottom-center" });
                    }
                    else if(response.data === "no_complaint") {
                        $("#replytext").notify("Error! ID not found.", { position: "bottom-center" });
                    }
                    else if(response.data === "replied") {
                        $("#replytext").notify("Replied.", "success", { position: "bottom-center" });

                        $scope.messages = response.complaints;

                        let obj = store.get("admindata");

                        obj.messages = response.complaints;

                        store.set("admindata", obj);

                        setTimeout(() => {
                            Utilities.closeForm("replycomplaint");
                        }, 5000);
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                })
            }
        }

        $scope.showSideBar = () => {
            $(".staticsidebar").removeClass("visible inverted vertical menu staticsidebar for_desk").addClass("sid_barr");

            $('.ui.sidebar')
                .sidebar('toggle')
            ;
        }

        $scope.hide_bar = () => {
            if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
                $('.ui.sidebar')
                    .sidebar('toggle')
                ;
            }
        }

        $scope.enableCard = () => {
            if(!$scope.e_cardnumber) {
                $("#e_cardnumber").notify("Please enter card number.", { position: "bottom-center" });
            }
            else {
                Utilities.showGeneralLoader();

                AdminService.enablecard({
                    cardnumber: $scope.e_cardnumber,
                    token: admindata.token
                })
                .then (response => {
                    Utilities.hideGeneralLoader();

                    if(response.status) {
                        $("#e_cardnumber").notify("Card successfully enabled.", "success", { position: "bottom-center" });
                        $("#e_cardnumber").val("");

                        setTimeout(() => {
                            Utilities.closeForm("ensablecardform");
                        }, 5000)
                    }
                    else if(response.data === "card_notfound") {
                        $("#e_cardnumber").notify("Card number does not exist!", { position: "bottom-center" });
                    }
                    else if(response.data === "card_alreadyenabled") {
                        $("#e_cardnumber").notify("Card number already enabled!", { position: "bottom-center" });
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }

                })
            }
        }

        $scope.disableCard = () => {
            if(!$scope.d_cardnumber) {
                $("#d_cardnumber").notify("Please enter card number.", { position: "bottom-center" });
            }
            else {
                Utilities.showGeneralLoader();

                AdminService.disablecard({
                    cardnumber: $scope.d_cardnumber,
                    token: admindata.token
                })
                .then (response => {
                    Utilities.hideGeneralLoader();

                    if(response.status) {
                        $("#d_cardnumber").notify("Card successfully disabled.", "success", { position: "bottom-center" });
                        $("#d_cardnumber").val("");

                        setTimeout(() => {
                            Utilities.closeForm("disablecardform");
                        }, 5000)
                    }
                    else if(response.data === "card_notfound") {
                        $("#d_cardnumber").notify("Card number does not exist!", { position: "bottom-center" });
                    }
                    else if(response.data === "card_alreadydisabled") {
                        $("#d_cardnumber").notify("Card number already disabled!", { position: "bottom-center" });
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                })
            }
        }
    }

    function GeneralController($scope, $log, $state, Transporter, Utilities) {
        $(".ui.active.dimmer").css("display", "none");

        let user = store.get("user");

        setTimeout(() => {
            $("#edit_fullname").val(user.data.fullname);
            $("#edit_work_location").val(user.data.work);
            $("#edit_home_location").val(user.data.home);
            $("#edit_org").val(user.data.org);
            $("#edit_phone").val(user.data.phone);
            $("#edit_username").val(user.data.username);
            $("#edit_email").val(user.data.email);
        }, 300);

        $scope.updateDetails = () => {
            Utilities.showGeneralLoader();

            Transporter.updatedetails({
                token: user.data.token,
                fullname: $("#edit_fullname").val(),
                org: $("#edit_org").val(),
                work: $("#edit_work_location").val(),
                home: $("#edit_home_location").val(),
                email: $("#edit_email").val(),
                phone: $("#edit_phone").val(),
                username: $("#edit_username").val()
            })
            .then(response => {
                Utilities.hideGeneralLoader();

                if(response.data === "token_expired") {
                    store.remove("user");
                    $state.go("login");
                }
                else if(response.data === "updated") {
                    $(".not_img").notify("Update Successful!", "success", { position: "bottom-center" });
                    $("#edit_fullname").val("");
                    $("#edit_work_location").val("");
                    $("#edit_home_location").val("");
                    $("#edit_org").val("");
                    $("#edit_phone").val("");
                    $("#edit_username").val("");
                    $("#edit_email").val("");
                }
                else if(response.data === "unknown_error") {
                    $(".not_img").notify("There has been a problem.", "success", { position: "bottom-center" });
                }
            })
        }
    }