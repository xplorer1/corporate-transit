angular.module('ControllersModule', [])
    .controller('MainPageController', ['$scope', '$state', '$log', '$window', MainPageController])
    .controller('BookingPageController', ['$scope', '$log', 'Transporter', BookingPageController])
    .controller('ContactPageController', ['$scope', '$log', 'Transporter', ContactPageController])
    .controller('PaymentPageController', ['$scope', '$log', 'Transporter', PaymentPageController])
    .controller('SignUpPageController', ['$scope',  '$log', 'Transporter', '$stateParams', '$state', SignUpPageController])
    .controller('LoginPageController', ['$scope', '$log', 'Transporter', '$state', '$stateParams', LoginPageController])
    .controller('EmailActivationController', ['$scope', EmailActivationController]);

    function MainPageController($scope, $state, $log, $window) {

        $scope.determineDest = (destination) => {
            store.set("user", {destination: destination});

            $log.log("destination; ", destination);

            rootShared.user["destination"] = destination;
            $state.go("login");
        };

        angular.element($window).bind("scroll", () => {

            $("#navbar").css("background", "#333");
            $(".navother").css("background", "white");
            $(".nav-item.active.border").css("background", "none");
            $("#navbar a").css("color", "white");
            $(".navother a").css("color", "white");

            if ($window.pageYOffset < 2) {
                $("#navbar").css("background", "none");
                $(".navother").css("background", "white");
                $(".nav-item.active.border").css("background", "#37A000");
                $("#navbar a").css("color", "white");
                $(".navother a").css("color", "black");
            }
        });
    }

    function BookingPageController($scope, $log, Transporter) {
        function showLoader() {
            $(".bookingloader").css("display", "block");
        }

        function hideLoader() {
            $(".bookingloader").css("display", "none");
        }

        let user = store.get("user");

        let email = rootShared.user["email"] || user.email;

        if(email) {
            $scope.bookTrip = () => {
                console.log("ct_cardnumber", $scope.ct_cardnumber);
                if(!$scope.trip_route) {
                    $("#trip_route").notify("Please select your route.", { position: "bottom-center" });
                }
                else if(!$scope.trip_frequency) {
                    $("#trip_frequency").notify("Please select your trip frequency.", { position: "bottom-center" });
                }
                else if(!$scope.booking_type) {
                    $("#booking_type").notify("Please select your booking type.", { position: "bottom-center" });
                }
                else if(!$("#demo1").val()) {
                    $("#demo1").notify("Please select trip date range.", { position: "bottom-center" });
                }
                else if(!$("#demo2").val()) {
                    $("#demo2").notify("Please select trip date range.", { position: "bottom-center" });
                }
                else if(!$scope.ct_cardnumber) {
                    $("#ct_cardnumber").notify("Please enter your card number. Find this in your signup confirmation email.", { position: "bottom-center" });
                }
                else {
                    showLoader();

                    Transporter.booktrip({
                        email: email,
                        route: $scope.trip_route,
                        frequency: $scope.trip_frequency,
                        bookingtype: $scope.booking_type,
                        from: $("#demo1").val(),
                        to: $("#demo2").val(),
                        ct_cardnumber: $scope.ct_cardnumber,
                        token: user.token
                    }).then(response => {
                        hideLoader();

                        if(response.status) {
                            $(".booktrip").notify("Your booking was successful.", "success", { position: "bottom-center" });
                        }
                        else if(response.data === "slot_email") {
                            $(".booktrip").notify("You have already booked this trip.", "error", { position: "bottom-center" });
                        }
                    })
                }
            }
        }
    }

    function ContactPageController($scope, $log, Transporter) {
        function showLoader() {
            $(".contact_us_loader").css("display", "block");
        }

        function hideLoader() {
            $(".contact_us_loader").css("display", "none");
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        $scope.sendComplaint = () => {
            if(!$scope.name) {
                $("#name").notify("Please enter your name.", { position: "bottom-center" });
            }
            else if(!$scope.email) {
                $("#email").notify("Please enter your email address.", { position: "bottom-center" });
            }
            else if(!validateEmail($scope.email)) {
                $("#email").notify("Please enter a valid email address.", { position: "bottom-center" });
            }
            else if(!$scope.message) {
                $("#message").notify("Please enter your complaint.", { position: "bottom-center" });
            }
            else {
                showLoader();

                Transporter.contactus({
                    name: $scope.name,
                    email: $scope.email,
                    complaint: $scope.message
                }).then(response => {
                    $log.log("Response: ", response);
                    hideLoader();


                })
            }
        }
    }
    
    function EmailActivationController() {

        store.set("user", {email: $("#user").val()});
        //rootShared.user["email"] = $("#user").val();
    }

    function SignUpPageController($scope, $log, Transporter, $stateParams, $state) {

        let token = $stateParams.vcode;

        $log.log("Token: ", token);

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
                    if(response.data === "expired") {
                        $("#verified").css("display", "none");
                        $("#notverified").css("display", "block");
                    }else if(response.data === "token_notfound") {
                        $state.go("notfound");
                    }
                }
                $log.log("response: ", response);
            })
        }

        function showLoader() {
            $(".lds-dual-ring").css("display", "block");
        }

        function hideLoader() {
            $(".lds-dual-ring").css("display", "none");
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        let beginSignup = (phone) => {
            console.log("phone: ", phone);
            showLoader();

            Transporter.signup({
                fullname: $scope.fullname,
                org: $scope.org,
                work: $scope.work_location,
                home: $scope.home_location,
                email: $scope.email,
                phone: phone,
                username: $scope.username,
                password: $scope.password
            }).then(response => {
                $log.log("Response: ", response);

                hideLoader();

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
                        rootShared.user["email"] = $scope.email;

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
            else if(!validateEmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
            }
            else if(!$scope.phone) {
                $("#phone").notify("Phone number is required.", { position: "bottom-center" });
            }
            else if(!$scope.username) {
                $("#username").notify("Username is required.", { position: "bottom-center" });
            }
            else if(!$scope.password) {
                $("#password").notify("Password is required.", { position: "bottom-center" });
            }
            else if($scope.password && $scope.password.trim().length < 8) {
                $("#password").notify("Password must have at least 8 characters.", { position: "bottom-center" });
            }
            else if($scope.phone.startsWith("0") && $scope.phone.length === 11) {
                phone = $scope.phone.slice(1);
                beginSignup(phone);
            }
            else if($scope.phone.startsWith("+234") && $scope.phone.length === 14) {
                phone = $scope.phone.slice(4);
                beginSignup(phone);
            }
            else if(($scope.phone.startsWith("8")|| $scope.phone.startsWith("9")) && $scope.phone.length === 10) {
                beginSignup($scope.phone);
            }
            else if($scope.phone.startsWith("234") && $scope.phone.length === 13) {
                phone = $scope.phone.slice(3);
                beginSignup(phone);
            }
            else if($scope.phone.trim().length < 10 || $scope.phone.trim().length > 14) {
                $("#phone").notify("Please enter a valid phone number.", { position: "bottom-center" });
            }
        };

        $scope.resendCode = () => {
            let user = store.get("user");

            let email = rootShared.user["email"] || user.email;

            console.log("email: ", email);

            Transporter.resendcode({
                email: email
            }).then(response => {
                $log.log("Response: ", response);

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

                        $("#email_confirmation").notify("Activation email sent to your email address.", { position: "bottom-center" });
                        break;
                    default:
                        $("#signupform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        }
    }

    function LoginPageController($scope, $log, Transporter, $state, $stateParams) {

        $log.log("resetcode: ", $stateParams.resetcode);

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
                    }else if(response.data === "notfound") {
                        $state.go("notfound");
                    }else {

                    }
                }

                $(".ui.active.dimmer").css("display", "none");

            });
        }

        function showLoader() {
            $(".loginloader").css("display", "block");
        }

        function showForgotLoader() {
            $(".forgotloader").css("display", "block");
        }

        function hideLoader() {
            $(".loginloader").css("display", "none");
        }

        function hideForgotLoader() {
            $(".forgotloader").css("display", "none");
        }

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        $scope.login = () => {
            if(!$scope.email) {
                $("#email").notify("Please enter your email address.", { position: "bottom-center" });
            }
            else if(!validateEmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
            }
            else if(!$scope.password) {
                $("#password").notify("Please enter your password.", { position: "bottom-center" });
            }
            else {
                showLoader();

                Transporter.login({
                    email: $scope.email,
                    password: $scope.password
                }).then(response => {
                    $log.log("Response: ", response);

                    hideLoader();

                    switch (response.data){
                        case "not_activated":
                            $("#loginform").notify("Your account has not been verified. Activation link has been sent to your email address. Also check your spam/junk folders.", { position: "bottom-center" });
                            break;
                        case "login_successful":
                            rootShared.user["email"] = $scope.email;
                            rootShared.user["token"] = response.token;

                            store.set("user", {email: $scope.email, token: response.token});

                            if(rootShared.user["destination"]) {
                                $state.go(rootShared.user["destination"]);
                            } else $state.go("home");
                            break;
                        case "account_notfound":
                            $("#loginform").notify("Invalid username or password.", { position: "bottom-center" });
                            break;
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
                showForgotLoader();

                Transporter.forgotpassword({
                    email: $scope.resetemail
                }).then(response => {
                    $log.log("Response: ", response);

                    hideForgotLoader();

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
            }else {
                Transporter.resetpassword({
                    password: $scope.new_password,
                    token: $stateParams.resetcode
                }).then(response => {
                    $log.log("response: ", response);

                    if(response.status) {
                        $(".resetbutton").notify("Your password has been successfully changed.", { position: "bottom-center" });
                        $("#loginbutton").css("display", "block");
                    }else {
                        $(".resetbutton").notify("Password change unsuccessful. Please try again later.", { position: "bottom-center" });
                        $("#loginbutton").css("display", "none");
                    }
                })
            }
        }
    }

    function PaymentPageController($scope, $log, Transporter) {

        function validateEmail(email) {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        function showLoader() {
            $(".paymentloader").css("display", "block");
        }

        function hideLoader() {
            $(".paymentloader").css("display", "none");
        }

        $(".payonline").click(() => {
            $('.onlineinstant')
                .modal('show')
            ;
        });

        $(".payussd").click(() => {
            $('.ussd')
                .modal('show')
            ;
        });

        $(".paybanktransfer").click(() => {
            $('.banktransfer')
                .modal('show')
            ;
        });

        let payWithPaystack = (email, amounttopay, theref, callback, closeCallback) => {
            let handler = PaystackPop.setup({
                key: 'pk_test_c1535466b6782ee14df6744b47ca3249fa1a3e69',
                email: email,
                amount: amounttopay,
                ref: theref,
                callback: callback,
                onClose: closeCallback
            });
            handler.openIframe();
        };

        $scope.pay = () => {
            if(!$scope.onlineemail) $("#onlineemail").notify("Please enter your email address.", { position: "bottom-center" });
            else if(!validateEmail($scope.onlineemail)) $("#onlineemail").notify("Please enter a valid email address.", { position: "bottom-center" });
            else if(!$scope.onlineamount) $("#onlineamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
            else {
                showLoader();

                Transporter.fund_ct({
                    email: $scope.onlineemail,
                    amount: $scope.onlineamount,
                }).then(response => {
                    if(response.status) {
                        hideLoader();

                        payWithPaystack(response.email, $scope.onlineamount*100, response.ref, function(response) {
                            console.log("Response from paystack: ", response);

                            if (response.reference) {

                                $(".paymentsuccess").css("display", "block");

                            }
                        },
                        function() {
                            //window closed
                        }
                        );
                    }
                });
            }
        };

        $scope.payWithPaystackUssd = function payWithPaystack() {
            if(!$scope.ussdemail) $("#ussdemail").notify("Please enter your email address.", { position: "bottom-center" });
            else if(!validateEmail($scope.ussdemail)) $("#ussdemail").notify("Please enter a valid email address.", { position: "bottom-center" });
            else if(!$scope.ussdamount) $("#ussdamount").notify("Please enter amount you'd like to pay.", { position: "bottom-center" });
            else {
                showLoader();

                Transporter.payviaussd({
                    email: $scope.ussdemail,
                    amount: $scope.ussdamount
                }).then(response => {
                    hideLoader();

                    $log.log("Response: ", response);
                })
            }
        }
    }
