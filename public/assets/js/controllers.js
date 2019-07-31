angular.module('ControllersModule', [])
    .controller('MainPageController', ['$scope', '$state', '$log', '$window', '$location', 'Transporter', 'Utilities', 'Notification', MainPageController])
    .controller('PaymentHistoryController', ['$scope', '$log', 'Transporter', '$state', 'Utilities', 'Notification', PaymentHistoryController])
    .controller('SignUpPageController', ['$scope',  '$log', 'Transporter', '$stateParams', '$state', 'Utilities', 'Notification', SignUpPageController])
    .controller('LoginPageController', ['$scope', '$log', 'Transporter', '$state', '$stateParams', 'Utilities', 'Notification', LoginPageController])
    .controller('LandingController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', 'Notification', LandingController])
    .controller('GeneralController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', 'Notification', GeneralController])
    .controller('AdminController', ['$scope', '$log', '$state', '$stateParams', 'Utilities', 'AdminService', '$window', 'Notification', AdminController])
    .controller('BookingHistoryController', ['$scope', '$log', '$state', 'Transporter', 'Utilities', 'Notification', BookingHistoryController])
    .controller('TransactionController', ['$scope', 'Utilities', '$log', 'Transporter', '$state', 'Notification', TransactionController])
    .controller('CompanyController', ['$scope', 'Utilities', '$log', '$state', '$stateParams', 'CompanyService', '$window', 'Notification', 'Transporter', CompanyController])
    .controller('CompanySignUpController', ['$scope', '$log', '$stateParams', '$state', 'Utilities', 'CompanyService', 'Notification', 'Transporter', CompanySignUpController])

    function MainPageController($scope, $state, $log, $window, $location, Transporter, Utilities, Notification) {

        Utilities.fetchPlaces();

        $scope.test = () => {
            Transporter.test({
                email: "zamuh@getnada.com",
                cardnumber: "4c82b64a6209"
            })
            .then(response => {
                $log.log("res: ", response);
            })
        };
        
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
        };


        $scope.determineSignUpType = () => {

            Utilities.showSignUpType();
        }

        $scope.closeType = () => {
            Utilities.closeSignUpType();
        }
    }

    function SignUpPageController($scope, $log, Transporter, $stateParams, $state, Utilities, Notification) {
        Utilities.toTop();

        let token = $stateParams.vcode;

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

        if(token) {
            Transporter.confirm({
                token: token
            }).then(response => {

                $(".ui.active.dimmer").css("display", "none");

                if(response.status) {
                    $("#notverified").css("display", "none");
                    $("#verified").css("display", "block");
                }
                else {
                    if(response.data === "account_activated") {
                        $("#confirmed").css("display", "block");

                        //$("#verified").css("display", "none");
                        //$("#notverified").css("display", "block");
                    }else if(response.data === "token_notfound") {
                        $state.go("notfound");
                    }
                }
            }).catch(error => {
                Notification.warning("There has been an error. Please refresh your page and try again.");
                $log.log("error: ", error);
            });
        }

        $(".ui.active.dimmer").css("display", "none");

        let beginSignup = (phone) => {
            Utilities.disableButton("indsignup", "Signing up...");

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
                Utilities.enableButton("indsignup", "Sign Up");

                switch (response.data){
                    case "username_exists":
                        $("#username").notify("Username is not available. Please choose another.", { position: "bottom-center" });
                        $("#username").focus();
                        break;
                    case "email_exists":
                        $("#email").notify("Email is registered. Please login if you have an account.", { position: "bottom-center" });
                        $("#email").focus();
                        break;
                    case "phone_exists":
                        $("#phone").notify("Phone is registered. Please login if you have an account.", { position: "bottom-center" });
                        $("#phone").focus();
                        break;
                    case "db_error":
                        $("#signupform").notify("Error. Please try again later.", { position: "bottom-center" });
                        $("#signupform").focus();
                        break;
                    case "signup_successful":
                        store.set("user", {email: $scope.email});

                        Utilities.user["email"] = $scope.email;

                        $("#signup").hide("slow");
                        $("#email_confirmation").show("slow");

                        Utilities.toTop();
                        break;
                    default:
                        Notification.error('There has been a problem. Please try again later.');
                        break;
                }
            }).catch(error => {
                Notification.error("Error: ", error);
                $log.log("error: ", error);
            });
        };

        let phone;

        $scope.signUp = () => {

            if(!$scope.fullname) {
                $("#fullname").notify("Full name is required.", { position: "bottom-center" });
                $("#fullname").focus();
            }
            else if($scope.fullname && $scope.fullname.split(" ").length < 2) {
                $("#fullname").notify("Please enter your two names.", { position: "bottom-center" });
                $("#fullname").focus();
            }
            else if(!$scope.org) {
                $("#org").notify("Organization name is required.", { position: "bottom-center" });
                $("#org").focus();
            }
            else if(!$scope.work_location) {
                $("#work_location").notify("Work location is required.", { position: "bottom-center" });
                $("#work_location").focus();
            }
            else if(!$scope.home_location) {
                $("#home_location").notify("Home location is required.", { position: "bottom-center" });
                $("#home_location").focus();
            }
            else if(!$scope.email) {
                $("#email").notify("Email address is required.", { position: "bottom-center" });
                $("#email").focus();
            }
            else if(!Utilities.validmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
                $("#email").focus();
            }
            else if(!$scope.phone) {
                $("#phone").notify("Phone number is required.", { position: "bottom-center" });
                $("#phone").focus();
            }
            else if(!$scope.username) {
                $("#username").notify("Username is required.", { position: "bottom-center" });
                $("#username").focus();
            }
            else if(!$scope.gender) {
                $("#gender").notify("Gender is required.", { position: "bottom-center" });
                $("#gender").focus();
            }
            else if(!$scope.password) {
                $("#password").notify("Password is required.", { position: "bottom-center" });
                $("#password").focus();
            }
            else if($scope.password && $scope.password.trim().length < 8) {
                $("#password").notify("Password must have at least 8 characters.", { position: "bottom-center" });
                $("#password").focus();
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

            Utilities.disableButton("resetbtn", "Resending link...");

            Transporter.resendcode({
                email: email
            }).then(response => {

                Utilities.enableButton("resetbtn", "Resend Link");

                switch (response.data){
                    case "user_notfound":
                        Notification.warning("Your email address was not found. Please register if you have no account.");
                        break;
                    case "account_activated":
                        Notification.info("Your account has already been activated. Login instead.");
                        $("#email_confirmation").hide("slow");
                        break;
                    case "db_error":
                        Notification.warning("Error. Please refresh your page and try again.");
                        break;
                    case "vcode_sent":
                        Notification.success("Activation email has been sent to your email address.");
                        break;
                    default:
                        Notification.warning("There has been a problem. Please try again later.");
                        break;
                }
            }).catch(error => {
                Notification.error("Error: ", error);
                $log.log("error: ", error);
            });
        }
    }

    function LoginPageController($scope, $log, Transporter, $state, $stateParams, Utilities, Notification) {
        Utilities.toTop();

        if($stateParams.resetcode) {
            Transporter.checkcode({
                token: $stateParams.resetcode
            }).then(response => {
                $log.log("response: ", response);

                $(".ui.active.dimmer").css("display", "none");

                if(response.status) {
                    $("#resetform").show();
                    //$("#loginbutton").hide();
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
                $("#email").focus();
            }
            else if(!Utilities.validmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
                $("#email").focus();
            }
            else if(!$scope.password) {
                $("#password").notify("Please enter your password.", { position: "bottom-center" });
                $("#password").focus();
            }
            else {

                Utilities.disableButton("login_button", "Signing in...");

                Transporter.login({
                    email: $scope.email,
                    password: $scope.password
                }).then(response => {
                    Utilities.loginCleanUp();

                   Utilities.enableButton("login_button", "Sign In");

                    switch (response.data){
                        case "not_activated":
                            Notification.info("Your account has not been verified. Activation link has been sent to your email address.");
                            break;
                        case "login_successful":
                            Utilities.loginCleanUp();

                            if(response.user.role === "individual") {
                                store.set("user", {data: response.user});
                                $state.go("landing");
                            }
                            else if(response.user.role === "company") {
                                store.set("company", {data: response.user});
                                $state.go("company");
                            }
                            else if (response.user.role === "admin") {
                                store.set("admindata", {data: response.user});
                                $state.go("admin");
                            }

                            break;
                        case "account_notfound":
                            Notification.warning("Invalid username or password.");
                            break;
                        case "carddisabled":
                            Notification.info("Your card has been disabled. Please contact support.");
                            break;
                        case "ErrorMongoError: Topology was destroyed":
                            Notification.warning("There was an error. Please refresh your page and try again.");
                        default:
                            Notification.warning("There was an error. Please refresh your page and try again.");
                            break;
                    }
                }).catch(error => {
                    Utilities.enableButton("login_button", "Sign In");

                    Notification.warning("Unable to sign in. Please try again later.");
                    $log.log("error: ", error);
                });
            }
        };

        $scope.verifyEmail = () => {
            if(!$scope.resetemail) {
                $("#resetemail").notify("Email address is required.", { position: "bottom-center" });
            }
            else {
                Utilities.disableButton("forgotbtn", "Submit");

                Transporter.forgotpassword({
                    email: $scope.resetemail
                }).then(response => {
                    $log.log("Response: ", response);

                    Utilities.enableButton("forgotbtn", "Submit");

                    switch (response.data){
                        case "user_notfound":
                            Notification.warning("Email is not registered.");
                            break;
                        case "password_resetlink_sent":
                            Notification.success("Link to reset password has been sent to your email.");
                            break;
                        default:
                            Notification.warning("There has been a problem. Please try again later.");
                            break;
                    }
                }).catch(error => {
                    Notification.error("Unable to verify email.");
                    $log.log("error: ", error);
                });
            }
        };

        $scope.resetPassword = () => {
            if(!$scope.new_password) {
                $("#new_password").notify("Please provide a new password.", {position: "bottom-center"});
                $("#new_password").focus();
            }
            else if($scope.new_password && $scope.new_password.trim().length < 8) {
                $("#new_password").notify("Password must have at least 8 characters.", { position: "bottom-center" });
                $("#new_password").focus();
            }
            else if(!$scope.confirm_password) {
                $("#confirm_password").notify("Please confirm your password.", { position: "bottom-center" });
                $("confirm_password").focus();
            }
            else if($scope.new_password.toString() !== $scope.confirm_password.toString()) {
                $("#confirm_password").notify("Passwords don't match.", { position: "bottom-center" });
                $("#confirm_password").focus();
            }
            else {
                Utilities.disableButton("resetbtn", "Changing...");

                Transporter.resetpassword({
                    password: $scope.new_password,
                    token: $stateParams.resetcode
                }).then(response => {

                    Utilities.enableButton("resetbtn", "Change Password");

                    if(response.status) {
                        Notification.success("Your password has been successfully changed.");

                        setTimeout(() => {
                            $state.go("login");
                        }, 3000);
                    }else {
                        Notification.warning("Password change unsuccessful. Please try again later.");
                    }
                }).catch(error => {
                    Notification.error("Unable to reset password. Please try again later.");
                    $log.log("error: ", error);
                });
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
                        Notification.warning("Your email address was not found. Please register if you have no account.");
                        break;
                    case "password_resetlink_sent":
                        Notification.warning("Password reset link has been sent to your email address.");
                        break;
                    default:
                        Notification.warning("There has been a problem. Please try again later.");
                        break;
                }
            }).catch(error => {
                Notification.error("Error: ", error);
                $log.log("error: ", error);
            });
        };

        $scope.determineSignUpType = () => {
            Utilities.showSignUpType();
        };

        $scope.closeType = () => {
            Utilities.closeSignUpType();
        }
    }

    function BookingHistoryController($scope, $log, $state, Transporter, Utilities, Notification) {
        Utilities.toTop();

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

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
                        }, 700);
                    }else{
                        $(".booking_one").css("display", "block");

                    }
                }else {
                    console.log("there has been an unknown problem.")
                }
            }).catch(error => {
                Notification.warning("There has been a problem.");
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
                        Notification.success("Booking Successfully cancelled.");

                        setTimeout(() => {
                            $scope.closeOptions();
                            $scope.closeChoice();
                        }, 6000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        Notification.info("Sorry. Access time expired. Redirecting to login now.");

                        setTimeout(() => {
                            $state.go("login");
                        }, 1500)
                    }else {
                        Notification.warning("Sorry. There has been a problem. Please try again.");
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
                    $("#dep").focus();
                }
                else if (!routeto) {
                    $("#dest").notify("Destination is required.", { position: "bottom-center" });
                    $("#dest").focus();
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                    $("#dest").focus();
                }
                else if(!from) {
                    $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                    $("#demo1").focus();
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                    $("#dest").focus();
                }
                else if(!ct_cardnumber) {
                    $("#cardnumber").notify("Please enter your card number.", { position: "bottom-center" });
                    $("#cardnumber").focus();
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
                            Notification.success("Your booking was successful. Check your mail for details.");

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
                            Notification.warning("Authentication problem. Login out...");

                            setTimeout(() => {
                                $scope.logOut();
                            }, 3000);
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
                        Notification.success("Booking Successfully cancelled.");

                        setTimeout(() => {
                            $scope.closePendingTrip();
                        }, 10000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        Notification.info("Sorry. Access time expired.");

                        setTimeout(() => {
                            store.remove("user");
                            $state.go("login");
                        }, 3000)
                    }else {
                        Notification.warning("Sorry. There has been a problem. Please try again.");
                    }
                })
            }
            else {
                $log.log("No id !");
            }
        }
    }

    function PaymentHistoryController($scope, $log, Transporter, $state, Utilities, Notification) {

        let user = store.get("user");
        Utilities.toTop();

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

    function LandingController($scope, $log, $state, Transporter, Utilities, Notification) {
        $(".ui.active.dimmer").css("display", "none");

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

        let user = store.get("user");

        let currency = {name: "Naira", symbol: "₦"};

        if(user && user.data) {            
            let firstname = user.data.fullname.split(" ")[0];
            let lastname = user.data.fullname.split(" ")[1];

            $scope.user_fullname = Utilities.formatText(firstname) + " " + Utilities.formatText(lastname);
            $scope.user_username = "@"+user.data.username;
            $scope.user_balance = Utilities.numberWithCommas(user.data.balance);
            
            setTimeout(() => {
                $("#cardnumber").val(user.data.cardnumber);
            }, 500);

            let routeinfo = user.data.routeinfo;

            if(routeinfo) {
                $(".route-pmorn-time").text(routeinfo.pickup_morning.time);
                $(".route-pmorn-place").text(routeinfo.pickup_morning.point);

                $(".route-dmorn-time").text(routeinfo.drop_morning.time);
                $(".route-dmorn-place").text(routeinfo.drop_morning.point);

                $(".route-peven-time").text(routeinfo.pickup_evening.time);
                $(".route-peven-place").text(routeinfo.pickup_evening.point);

                $(".route-deven-time").text(routeinfo.drop_evening.time);
                $(".route-deven-place").text(routeinfo.drop_evening.point);
            }

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
            //$state.go("login");
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

            if(id) {
                Utilities.showLandingLoader();

                Transporter.cancelbooking({
                    bookingid: id,
                    token: user.data.token
                }).then(response => {

                    Utilities.hideLandingLoader();

                    if(response.status) {
                        Notification.success("Booking Successfully cancelled.");

                        setTimeout(() => {
                            Utilities.closeForm("pendingtrip");
                        }, 10000);
                    }
                    else if(response.data === "token_expired" || response.data === "user_notfound") {
                        Notification.info("Sorry. Access time expired.");

                        setTimeout(() => {
                            $state.go("login");
                        }, 5000)
                    }else {
                        Notification.info("Sorry. There has been a problem. Please try again.");
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

                setTimeout(() => {
                    Transporter.getbalance({
                        email: email,
                        token: user.data.token
                    })
                    .then(response => {

                        $scope.user_balance = Utilities.numberWithCommas(response.data);

                        $scope.user_total_dep = Utilities.numberWithCommas(response.totaldeposited);
                        let obj = store.get("user");

                        obj.data.balance = response.data;
                        obj.data.totaldeposited = response.totaldeposited;

                        store.set("user", obj);

                        $(".payment_end").css("display", "none");
                    });
                }, 2000);
            }
        }

        let payWithRavePay = (email, phone, txref, amount) => {
            var x = getpaidSetup({
                PBFPubKey: Utilities.ravepublic,
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
            if(!$scope.onlineemail) {
                $("#onlineemail").notify("Please enter your email address.", { position: "bottom-center" });
                $("#onlineemail").focus();
            }
            
            else if(!Utilities.validmail($scope.onlineemail)) {
                $("#onlineemail").notify("Please enter a valid email address.", { position: "bottom-center" });
                $("#onlineemail").focus();
            }
            
            else if(!$scope.onlineamount) {
                $("#onlineamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
                $("#onlineamount").focus();
            }
            
            else {

                Utilities.disableButton("payinst", "Pay");

                Transporter.fund_ct({
                    email: $scope.onlineemail,
                    amount: $scope.onlineamount,
                    token: user.data.token
                }).then(response => {
                    $log.log("res: ", response);
                    Utilities.enableButton("payinst", "Pay");

                    if(response.status) {

                        Utilities.closeForm("fundcardform");
                        payWithRavePay(response.email, response.phone, response.ref, $scope.onlineamount);
                    }
                    else if(response.data === "token_expired") {
                            $scope.logOut();
                    }
                    else {
                        Notification.warning("There has been an error. Please refresh your page and try again.");
                    }
                }).catch(error => {
                    Utilities.enableButton("payinst", "Pay");

                    Notification.warning("There was a problem initiating payment.");
                    $log.log("error: ", error);
                })
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
                    $("#dep").focus();
                }
                else if (!routeto) {
                    $("#dest").notify("Destination is required.", { position: "bottom-center" });
                    $("#dest").focus();
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                    $("#dest").focus();
                }
                else if(!from) {
                    $("#demo1").notify("Please select trip date.", { position: "bottom-center" });
                    $("#demo1").focus();
                }
                else if((routefrom && routeto) && (routefrom.toString() === routeto.toString())) {
                    $("#dest").notify("Please select a different destination.", { position: "bottom-center" });
                    $("#dest").focus();
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

                    Utilities.disableButton("cardnumber", "Booking...");

                    Transporter.booktrip({
                        email: email,
                        bookingtype: checkedvalue,
                        routefrom: routefrom,
                        routeto: routeto,
                        from: from,
                        to: to,
                        ct_cardnumber: user.data.cardnumber,
                        token: token,
                        tripmode: $("#tripmode").val()
                    }).then(response => {

                        Utilities.enableButton("cardnumber", "Booking A Ride");

                        if(response.status) {
                            Notification.success("Your booking was successful. Check your mail for details.");

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
                            Notification.warning("Authentication problem.");

                            setTimeout(() => {
                                $scope.logOut();
                            }, 3000);
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

    function TransactionController($scope, Utilities, $log, Transporter, $state, Notification) {
        let user = store.get("user");
        Utilities.toTop();

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
                        Utilities.doSignOut();
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
        };

        $("#sort").on('change', function() {
            var filter = $('#sort').find(":selected").val();

            if(filter) {
                return $scope.loadHistory(filter);
            }
        });

        $scope.searchHistory = () => {

            if(!$("#tr_from").val()) {
                $("#tr_from").notify("Please select a date.", {"position" : "bottom-center"});
                $("#tr_from").focus();
            }
            else if(!$("#tr_to").val()) {
                $("#tr_to").notify("Please select a date.", {"position" : "bottom-center"});
                $("#tr_to").focus();
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
        };
    }

    function AdminController($scope, $log, $state, $stateParams, Utilities, AdminService, $window, Notification) { 
        $(".ui.active.dimmer").css("display", "none");

        $('.timepicker').pickatime({
            interval: 5
        })

        let admindata = store.get("admindata");

        $scope.adminLogOut = () => {
            store.remove(admindata);
            $state.go("login");
        }

        if(admindata) {
            $log.log("admindata: ", admindata);

            $scope.name = admindata.data.name;
            $scope.role = admindata.data.role;
            $scope.numusers = admindata.data.numusers;
            $scope.numbookings = admindata.data.numbookings;
            $scope.numearned = Utilities.numberWithCommas(admindata.data.totaldeposited);
            $scope.numtrips = admindata.data.numtaken;

            $scope.messages = admindata.data.messages;
            $scope.admins = admindata.data.admins;
            $scope.regionscount = admindata.data.userregioncountarray;
            $scope.routescount = admindata.data.userroutecountarray;
        }
        else {
            $scope.adminLogOut();
        }

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
                $("#c_dep").focus();
            }

            else if(!$scope.c_dest) {
                $("#c_dest").notify("Required.", { position: "bottom-center" });
                $("#c_dest").focus();
            }

            else if(!$scope.c_fareoneway) {
                $("#c_fareoneway").notify("Required.", { position: "bottom-center" });
                $("#c_fareoneway").focus();
            }

            else if(!$scope.c_farereturn) {
                $("#c_farereturn").notify("Required.", { position: "bottom-center" });
                $("#c_farereturn").focus();
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
                        Notification.success("Fare successfully updated.");

                        $("#c_dep").val("");
                        $("#c_dest").val("");
                        $("#c_fareoneway").val("");
                        $("#c_farereturn").val("");

                        setTimeout(() => {
                            Utilities.closeForm("changefareform");
                        }, 5000)
                    }
                    else if(response.data === "unknown_error") {
                        Notification.warning("Error. Please refresh your page and try again.");
                    }
                    else if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                    else if(response.data === "route_notfound") {
                        Notification.warning("This route was not found.");
                    }
                })
            }
        }

        $scope.addRoute = () => {
            if(!$scope.dep) {
                $("#dep").notify("Required.", { position: "bottom-center" });
                $("#dep").focus();
            }

            else if(!$scope.dest) {
                $("#dest").notify("Required.", { position: "bottom-center" });
                $("#dest").focus();
            }

            else if(!$("#morningpickup").val()) {
                $("#morningpickup").notify("Required.", { position: "bottom-center" });
                $("#morningpickup").focus();
            }

            else if(!$("#morningdrop").val()) {
                $("#morningdrop").notify("Required.", { position: "bottom-center" });
                $("#morningdrop").focus();
            }

            else if(!$("#eveningpickup").val()) {
                $("#eveningpickup").notify("Required.", { position: "bottom-center" });
                $("#eveningpickup").focus();
            }

            else if(!$("#eveningdrop").val()) {
                $("#eveningdrop").notify("Required.", { position: "bottom-center" });
                $("#eveningdrop").focus();
            }

            else if(!$scope.morningpickuppoint) {
                $("#morningpickuppoint").notify("Required.", { position: "bottom-center" });
                $("#morningpickuppoint").focus();
            }

            else if(!$scope.morningdroppoint) {
                $("#morningdroppoint").notify("Required.", { position: "bottom-center" });
                $("#morningdroppoint").focus();
            }

            else if(!$scope.eveningpickuppoint) {
                $("#eveningpickuppoint").notify("Required.", { position: "bottom-center" });
                $("#eveningpickuppoint").focus();
            }

            else if(!$scope.eveningdroppoint) {
                $("#eveningdroppoint").notify("Required.", { position: "bottom-center" });
                $("#eveningdroppoint").focus();
            }

            else if(!$scope.fareoneway) {
                $("#fareoneway").notify("Required.", { position: "bottom-center" });
                $("#fareoneway").focus();
            }

            else if(!$scope.farereturn) {
                $("#farereturn").notify("Required.", { position: "bottom-center" });
                $("#farereturn").focus();
            }

            else {
                Utilities.disableButton("login_button", "Adding route...");

                let shortdep = $scope.dep.toString().slice(0, 3);
                let shortdest = $scope.dest.toString().slice(0, 3);

                AdminService.addroute({
                    token: admindata.token,
                    dep: $scope.dep.toUpperCase(),
                    dest: $scope.dest.toUpperCase(),
                    route: shortdep.toUpperCase() + " - " + shortdest.toUpperCase(),
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
                    Utilities.disableButton("login_button", "Adding Route");

                    $log.log("response addroute: ", response);

                    if(response.data === "token_expired") {
                        $scope.adminLogOut();
                    }
                    else if(response.data === "route_exists") {
                        Notification.warning("This route exists!");
                    }
                    else if(response.data === "unknown_error1" || response.data === "unknown_error2") {
                        Notification.warning("Error. Please refresh your page and try again later.");
                    }
                    else if(response.data === "stuffsaved") {
                        Notification.success("Route saved successfully.");

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
                $("#superpassword").focus();
            }
            else {

                Utilities.disableButton("login_button", "Please wait...");

                AdminService.verifysuper({
                    email: admindata.data.email,
                    password: $scope.superpassword,
                    token: admindata.data.token
                }).then(response => {
                    Utilities.enableButton("login_button", "Submit");

                    console.log("res: ", response);

                    if(response.data === "account_notfound") {
                        Notification.warning("Invalid password.");
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
                $("#newadminemail").focus();
            }
            else if(!Utilities.validmail($scope.newadminemail)) {
                $("#newadminemail").notify("Please enter valid email.", { position: "bottom-center" });
                $("#newadminemail").focus();
            }
            else if(!$scope.newadminname) {
                $("#newadminname").notify("Please fill this form.", { position: "bottom-center" });
                $("#newadminname").focus();
            }
            else {

                if($scope.newadminname.length === 2) {
                    $scope.newadminname = $scope.newadminname.split(" ")[0]+$scope.newadminname.split(" ")[1]
                }

                Utilities.disableButton("login_button", "Please wait...");

                AdminService.adduser({
                    email: $scope.newadminemail,
                    name: $scope.newadminname,
                    token: admindata.token
                })
                .then(response => {
                    Utilities.enableButton("login_button", "Add User");

                    if(response.data === "username_exists") {
                        Notification.info("Name exists. Choose another.");
                    }
                    else if(response.data === "user_exists") {
                        Notification.info("Email address exists.");
                    }
                    else if(response.data === "admin_saved") {
                        Notification.success("Admin added successfully.");

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
                $("#deletehoice").focus();
            }
            else if($scope.deletehoice.toUpperCase().trim() !== "YES" && $scope.deletehoice.toUpperCase().trim() !== "NO") {
                $("#deletehoice").notify("Please enter YES or NO.", { position: "bottom-center" });
                $("#deletehoice").focus();
            }
            else if($scope.deletehoice.toUpperCase().trim() === "NO") {
                Utilities.closeForm("verifydelete");
            }
            else {

                Utilities.disableButton("login_button", "Please wait...");

                AdminService.deleteuser({
                    id: adminid,
                    token: admindata.token
                })
                .then(response => {
                    Utilities.enableButton("login_button", "Delete User");

                    if(response.data === "account_notfound") {
                        Notification.info("User does not exist.");
                    }
                    else if(response.data === "found_superuser") {
                        Notification.info("You can not delete a super user.");
                    }
                    else if(response.message === "admin_deleted") {
                        Notification.success("Admin removed.");

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
                $("#replytext").focus();
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

    function CompanySignUpController($scope, $log, $stateParams, $state, Utilities, CompanyService, Notification) {

        let token = $stateParams.vcode;

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

        if(token) {
            Transporter.confirm({
                token: token
            }).then(response => {
                $log.log("response com: ", response);

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

            Utilities.disableButton("companysignup", "Signing up...");

            CompanyService.companysignup({
                companyname: $scope.companyname,
                companyphone: phone,
                companyemail: $scope.companyemail,
                employeesno: $scope.employeesno,
                password: $scope.companypassword,
                routefrom: $scope.co_dep,
                routeto: $scope.co_dest,
                officelocation: $scope.co_dest
            }).then(response => {

                Utilities.enableButton("companysignup", "Sign Up");

                switch (response.data){
                    case "email_exists":
                        $("#companyemail").notify("Email is registered. Please login if you have an account.", { position: "bottom-center" });
                        $("#companyemail").focus();
                        break;
                    case "phone_exists":
                        $("#companyphone").notify("Phone is registered. Please login if you have an account.", { position: "bottom-center" });
                        $("#companyphone").focus();
                        break;
                    case "db_error":
                        Notification.warning("There has been a problem. Please try again later.");
                        break;
                    case "signup_successful":
                        store.set("user", {email: $scope.email});
                        Utilities.user["email"] = $scope.email;

                        $("#signup").hide("slow");
                        $("#email_confirmation").show("slow");

                        Utilities.toTop();
                        break;
                    default:
                        Notification.warning("There has been a problem. Please try again later.");
                        break;
                }
            }).catch(response => {
                Utilities.enableButton("companysignup", "Sign Up");
                if(response.xhrStatus === "error") {
                    Notification.warning("There has been a problem. Please try again later.", "error");
                }
                $log.log("error response: ", response);
            })
        };

        let phone;
        $scope.companySignUp = () => {           
            if(!$scope.co_dep) {
                $("#co_dep").notify("Required.", { position: "bottom-center" });
            }
            else if(!$scope.co_dest) {
                $("#co_dest").notify("Required.", { position: "bottom-center" });
            }
            else if(!$scope.companyname) {
                $("#companyname").notify("Company name is required.", { position: "bottom-center" });
            }
            else if(!$scope.companyemail) {
                $("#companyemail").notify("Organization email is required.", { position: "bottom-center" });
            }
            else if (!Utilities.validmail($scope.companyemail)) {
                $("#companyemail").notify("Email is not valid.", { position: "bottom-center" });
            }
            else if(!$scope.employeesno) {
                $("#employeesno").notify("Number of employees is required.", { position: "bottom-center" });
            }
            else if(!$scope.companyphone) {
                $("#companyphone").notify("Phone number is required.", { position: "bottom-center" });
            }
            else if(!$scope.companypassword) {
                $("#companypassword").notify("Password is required.", { position: "bottom-center" });
            }
            else if($scope.companypassword && $scope.companypassword.trim().length < 8) {
                $("#companypassword").notify("Password must have at least 8 characters.", { position: "bottom-center" });
            }
            else if($scope.companyphone.startsWith("0") && $scope.companyphone.length === 11) {
                beginSignup($scope.companyphone);
            }
            else if($scope.companyphone.startsWith("+234") && $scope.companyphone.length === 14) {
                phone = "0" + $scope.companyphone.slice(4);
                beginSignup(phone);
            }
            else if(($scope.companyphone.startsWith("8") || $scope.companyphone.startsWith("9")) && $scope.companyphone.length === 10) {
                phone = "0" + $scope.companyphone;
                beginSignup(phone);
            }
            else if($scope.companyphone.startsWith("234") && $scope.companyphone.length === 13) {
                phone = "0" + $scope.companyphone.slice(3);
                beginSignup(phone);
            }
            else if($scope.companyphone.trim().length < 10 || (!$scope.companyphone.startsWith("+234") && $scope.companyphone.trim().length > 14)) {
                $("#companyphone").notify("Please enter a valid phone number.", { position: "bottom-center" });
            }
            else {
                $("#companyphone").notify("Please enter a valid input.", { position: "bottom-center" });
            }
        };

        $scope.resendCode = () => {
            let user = store.get("user");

            let email = Utilities.user["email"] || user.email;

            Utilities.showGeneralLoader();

            Transporter.resendcode({
                email: email
            }).then(response => {

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
            }).catch(response => {
                $log.log("error response: ", response);
            })
        }
    }

    function CompanyController($scope, Utilities, $log, $state, $stateParams, CompanyService, $windo, Notification, Transporter) { 
        $(".ui.active.dimmer").css("display", "none");

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

        $('.timepicker').pickatime({
            interval: 5
        })

        let companydata = store.get("company");

        $scope.companyLogOut = () => {
            store.remove("company");
            $state.go("login");
        }

        if(companydata) {            
            $scope.companyname = companydata.data.companyname;

            $scope.company_balance = Utilities.numberWithCommas(companydata.data.balance);
            
            setTimeout(() => {
                $("#cardnumber").val(companydata.data.cardnumber);
            }, 500);

            let routeinfo = companydata.data.routeinfo;

            if(routeinfo) {
                $(".route-pmorn-time").text(routeinfo.pickup_morning.time);
                $(".route-pmorn-place").text(routeinfo.pickup_morning.point);

                $(".route-dmorn-time").text(routeinfo.drop_morning.time);
                $(".route-dmorn-place").text(routeinfo.drop_morning.point);

                $(".route-peven-time").text(routeinfo.pickup_evening.time);
                $(".route-peven-place").text(routeinfo.pickup_evening.point);

                $(".route-deven-time").text(routeinfo.drop_evening.time);
                $("route-deven-place").text(routeinfo.drop_evening.point);
            }

            $scope.company_cardnumber = companydata.data.cardnumber;
            
            $scope.user_home = " " + companydata.data.route.split("To")[0];
            $scope.user_work = companydata.data.route.split("To")[1];
            $scope.user_trips_booked = companydata.data.numtrips;
            $scope.user_trips_taken = companydata.data.numtaken;
            $scope.user_total_dep = Utilities.numberWithCommas(companydata.data.totaldeposited);
            if(companydata.data.latestbooking) {
                $scope.user_next_trip_time = Utilities.formatDateDisplay(companydata.data.latestbooking)
            }
            else {
                $(".none_pending").show();
            }

            $(".ui.active.dimmer").css("display", "none");
        }
        else {
            $scope.companyLogOut();
        }

        $scope.showFundCard = () => {
            Utilities.toTop();
            return Utilities.showForm("fundcardform", "250px");
        };

        $scope.closeFundCard = () => {
            return Utilities.closeForm("fundcardform");
        };

        $scope.showContactUs = () => {
            return Utilities.showForm("contactus", "400px");
        };

        $scope.closecontactus = () => {
            return Utilities.closeForm("contactus", "400px");
        };

        let getBalance = (email) => {
            if(email) {

                setTimeout(() => {
                    Transporter.getbalance({
                        email: email,
                        token: companydata.data.token
                    })
                    .then(response => {

                        $scope.company_balance = Utilities.numberWithCommas(response.data);

                        $scope.user_total_dep = Utilities.numberWithCommas(response.totaldeposited);
                        let obj = store.get("company");

                        obj.data.balance = response.data;
                        obj.data.totaldeposited = response.totaldeposited;

                        store.set("company", obj);

                        $(".payment_end").css("display", "none");
                    });
                }, 2000);
            }
        };

        let payWithRavePay = (email, phone, txref, amount) => {
            var x = getpaidSetup({
                PBFPubKey: Utilities.ravepublic,
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
        };

        $scope.payInstant = () => {
            if(!$scope.onlineemail) {
                $("#onlineemail").notify("Please enter your email address.", { position: "bottom-center" });
                $("#onlineemail").focus();
            }
            
            else if(!Utilities.validmail($scope.onlineemail)) {
                $("#onlineemail").notify("Please enter a valid email address.", { position: "bottom-center" });
                $("#onlineemail").focus();
            }
            
            else if(!$scope.onlineamount) {
                $("#onlineamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
                $("#onlineamount").focus();
            }
            
            else {

                Utilities.disableButton("payinst", "Pay");

                Transporter.fund_ct({
                    email: $scope.onlineemail,
                    amount: $scope.onlineamount,
                    token: companydata.data.token
                }).then(response => {
                    $log.log("res: ", response);
                    Utilities.enableButton("payinst", "Pay");

                    if(response.status) {

                        Utilities.closeForm("fundcardform");
                        payWithRavePay(response.email, response.phone, response.ref, $scope.onlineamount);
                    }
                    else if(response.data === "token_expired") {
                            $scope.logOut();
                    }
                    else {
                        Notification.warning("There has been an error. Please refresh your page and try again.");
                    }
                }).catch(error => {
                    Utilities.enableButton("payinst", "Pay");

                    Notification.warning("There was a problem initiating payment.");
                    $log.log("error: ", error);
                })
            }
        };

        $scope.showAddEmployees = () => {
            Utilities.showForm("addemployee", "450px");
        };

        $scope.closeAddEmployee = () => {
            Utilities.closeForm("addemployee");
        };

        $scope.showRemoveEmployee = () => {
            Utilities.showForm("removeemployee", "230px");
        };

        $scope.closeRemoveEmployee = () => {
            Utilities.closeForm("removeemployee");
        };

        $scope.addEmployee = () => {
            if(!$scope.employeefullname) {
                $("#employeefullname").notify("Please provide employee fullname.", { position: "bottom-center" });
                $("#employeefullname").focus();
            }
            else if($scope.employeefullname && $scope.employeefullname.split(" ").length < 2) {
                $("#employeefullname").notify("Please provide both names.", { position: "bottom-center" });
                $("#employeefullname").focus();
            }
            else if(!$scope.employeegender) {
                $("#employeegender").notify("Please select employee gender.", { position: "bottom-center" });
                $("#employeegender").focus();
            }
            else if(!$scope.employeehome_location) {
                $("#employeehome_location").notify("Please select employee home location.", { position: "bottom-center" });
                $("#employeehome_location").focus();
            }
            else if(!$scope.employeeemail) {
                $("#employeeemail").notify("Please provide employee email address.", { position: "bottom-center" });
                $("#employeeemail").focus();
            }
            else if(!Utilities.validmail($scope.employeeemail)) {
                $("#employeeemail").notify("Please provide a valid email address.", { position: "bottom-center" });
                $("#employeeemail").focus();
            }
            else if(!$scope.employeephone) {
                $("#employeephone").notify("Please provide employee phone number.", { position: "bottom-center" });
                $("#employeephone").focus();
            }
            else {
                Utilities.disableButton("empsignup", "Adding employee...");

                Transporter.addemployee({
                    fullname: $scope.employeefullname,
                    gender: $scope.employeegender,
                    home: $scope.employeehome_location,
                    email: $scope.employeeemail,
                    phone: $scope.employeephone,
                    owner: companydata.data.email
                }).then(response => {
                    Utilities.enableButton("empsignup", "Add Employee");

                    switch (response.data){
                        case "email_exists":
                            Notification.info("The email address you entered is registered.");
                            $("#employeeemail").focus();
                            break;
                        case "employeeadded":
                            Notification.success("Employee has been successfully added.");

                            setTimeout(() => {
                                Utilities.closeForm("addemployee");
                            }, 2000)
                            
                            break;
                        case "phone_exists":
                            Notification.warning("The phone number your entered is registered.");
                            $("#employeephone").focus();
                            break;
                        case "company_notfound":
                            Notification.warning("Company account was not found. Logging out now ...");

                            setTimeout(() => {
                                $scope.companyLogOut();
                            }, 2000);
                    }
                }).catch(error => {
                    Notification.warning("There has been an error. Please try again later.");
                    $log.log(error);
                })
            }
        }

        $scope.removeEmployee = () => {
            if(!$scope.e_email) {
                $("#e_email").notify("Please enter employee email address.", { position: "bottom-center" });
                $("#e_email").focus();
            }
            else if(!Utilities.validmail($scope.e_email)) {
                $("#e_email").notify("Please enter a valid email address.", { position: "bottom-center" });
                $("#e_email").focus();
            }
            else {

                Utilities.disableButton("subcom", "Please wait ...");

                Transporter.removeemployee({
                    email: $scope.e_email,
                    token: companydata.data.token
                }).then(response => {
                    Utilities.enableButton("subcom", "Submit");

                    switch (response.data){
                        case "account_notfound":
                            Notification.info("The email address you entered was not found.");
                            $("#e_email").focus();
                            break;
                        case "emp_notfound":
                            Notification.info("The email address you entered was not found.");
                            $("#e_email").focus();
                            break;
                        case "com_notfound":
                            Notification.info("There is a problem with your account. Please log in again.");

                            setTimeout(() => {
                                $scope.companyLogOut();
                            }, 2000);

                            break;
                        case "employeeremoved":
                            Notification.success("Employee has been successfully removed.");
                            $("#e_email").val("");

                            setTimeout(() => {
                                Utilities.closeForm("removeemployee");
                            }, 2000);
                            
                            break;
                        case "token_expired":
                            Notification.warning("Access time expired. Logging out now ...");

                            setTimeout(() => {
                                $scope.companyLogOut();
                            }, 2000);
                    }
                })
                .catch(error => {
                    Utilities.enableButton("subcom", "Submit");
                    Notification.info("There has been an error. Please try again later.");
                })
            }
        }
    }

    function GeneralController($scope, $log, $state, Transporter, Utilities, Notification) {
        $(".ui.active.dimmer").css("display", "none");
        Utilities.toTop();

        let places = store.get("places");

        if(places) {
            $scope.home = places.home;
            $scope.work = places.work;
        }

        let user = store.get("user");
        let comdata = store.get("company");

        let handleIndividualEdit = () => {
            if(user) {
                $state.go("edit");
                setTimeout(() => {
                    $("#edit_fullname").val(user.data.fullname);
                    $("#edit_work_location").val(user.data.work);
                    $("#edit_home_location").val(user.data.home);
                    $("#edit_org").val(user.data.org);
                    $("#edit_phone").val(user.data.phone);
                    $("#edit_username").val(user.data.username);
                    $("#edit_email").val(user.data.email);
                }, 300);
            }
            else {
                $state.go("login");
            }
        }

        let handleCompanyEdit = () => {
            if(comdata) {
                $state.go("comedit");

                setTimeout(() => {
                    $("#companyname").val(comdata.data.companyname);
                    $("#companyemail").val(comdata.data.email);
                    $("#companyphone").val(comdata.data.phone);
                    $("#employeesno").val(comdata.data.employeescount);
                }, 300);
            }
            else {
                $state.go("login");
            }
        }

        if(user) {
            handleIndividualEdit();
        }
        else {
            handleCompanyEdit();
        }

        $scope.updateDetails = () => {
            Utilities.disableButton("indup", "Updating...");

            Transporter.updatedetails({
                token: user.data.token,
                fullname: $("#edit_fullname").val(),
                org: $("#edit_org").val(),
                work: $("#edit_work_location").val(),
                home: $("#edit_home_location").val(),
                email: $("#edit_email").val(),
                old: user.data.email,
                phone: $("#edit_phone").val(),
                username: $("#edit_username").val()
            })
            .then(response => {
                Utilities.disableButton("indup", "Save Changes");

                if(response.data === "token_expired") {
                    Notification.info("Access time expired.");

                    setTimeout(() => {
                        store.remove("user");
                        $state.go("login");
                    }, 1500);
                }
                else if(response.data === "updated") {
                    Notification.success("Account successfully updated.");

                    $("#edit_fullname").val("");
                    $("#edit_work_location").val("");
                    $("#edit_home_location").val("");
                    $("#edit_org").val("");
                    $("#edit_phone").val("");
                    $("#edit_username").val("");
                    $("#edit_email").val("");
                }
                else if(response.data === "unknown_error") {
                    Notification.warning("Sorry. There has been a problem. Please try again later.", error); 
                }
            })
        }

        $scope.updateAcct = () => {
            Utilities.disableButton("companysignup", "Updating...");

            Transporter.updatedetails({
                token: comdata.data.token,
                companyname: $("#companyname").val(),
                email: $("#companyemail").val(),
                old: comdata.data.email,
                phone: $("#companyphone").val(),
                employeescount: $("#employeesno").val(),
            })
            .then(response => {
                $log.log("res: ", response);

                Utilities.enableButton("companysignup", "Update Account");

                if(response.data === "token_expired") {
                    Notification.info("Access time expired.");

                    setTimeout(() => {
                        store.remove("company");
                        $state.go("login");
                    }, 1500);
                }
                else if(response.data === "updated") {
                    Notification.success("Account successfully updated.");

                    $("#companyname").val("");
                    $("#companyemail").val("");
                    $("#companyphone").val("");
                    $("#employeesno").val("");
                }
                else if(response.data === "unknown_error") {
                    Notification.warning("Sorry. There has been a problem. Please try again later.", error);              
                }
            })
            .catch(error => {
                Utilities.enableButton("companysignup", "Update Account");
                Notification.warning("Sorry. There has been a problem. Please try again later.", error);
            })
        }
    }