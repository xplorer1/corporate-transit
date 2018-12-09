angular.module('ControllersModule', [])
    .controller('MainPageController', ['$scope', '$state', '$log', MainPageController])
    .controller('BookingPageController', ['$scope', '$log', 'Transporter', BookingPageController])
    .controller('ContactPageController', ['$scope', '$log', 'Transporter', ContactPageController])
    .controller('FaqsPageController', ['$scope', FaqsPageController])
    .controller('How_It_WorksPageController', ['$scope', How_It_WorksPageController])
    .controller('PaymentPageController', ['$scope', 'Transporter', PaymentPageController])
    .controller('PricingPageController', ['$scope', PricingPageController])
    .controller('SignUpPageController', ['$scope',  '$log', 'Transporter', SignUpPageController])
    .controller('LoginPageController', ['$scope', '$log', 'Transporter', '$state', LoginPageController])
    .controller('EmailActivationController', ['$scope', EmailActivationController])
    .controller('RoutesPageController', ['$scope', RoutesPageController]);

    function MainPageController($scope, $state, $log) {
        $scope.determineUser = (destination) => {
            store.set("user", {destination: destination});

            rootShared.user["destination"] = destination;
            $state.go("login");
        }
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
                if(!$scope.trip_route) {
                    $("#trip_route").notify("Please select your route.", { position: "bottom-center" });
                }
                else if(!$scope.trip_frequency) {
                    $("#trip_frequency").notify("Please select your preferred trip frequency.", { position: "bottom-center" });
                }
                else if(!$("#demo1").val()) {
                    $("#demo1").notify("Please select trip date range.", { position: "bottom-center" });
                }
                else if(!$("#demo2").val()) {
                    $("#demo2").notify("Please select trip date range.", { position: "bottom-center" });
                }
                else if(!$scope.ct_cardnumber) {
                    $("#ct_cardnumber").notify("Please enter your ct card number. Find this in your signup confirmation email.", { position: "bottom-center" });
                }
                else {
                    showLoader();

                    Transporter.booktrip({
                        email: email,
                        route: $scope.trip_route,
                        frequency: $scope.trip_frequency,
                        from: $("#demo1").val(),
                        to: $("#demo2").val()
                    }).then(response => {
                        hideLoader();

                        $log.log("Response: ", response);
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

    function FaqsPageController() {

    }

    function How_It_WorksPageController() {

    }

    function PricingPageController() {

    }

    function EmailActivationController() {

        store.set("user", {email: $("#user").val()});
        //rootShared.user["email"] = $("#user").val();
    }

    function SignUpPageController($scope, $log, Transporter) {
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

        $scope.signUp = () => {

            //let phone = $scope.phone;

            if(!$scope.fullname) {
                $("#fullname").notify("Please enter your full name.", { position: "bottom-center" });
            }
            else if($scope.fullname && $scope.fullname.split(" ").length < 2) {
                $("#fullname").notify("Please enter your two names.", { position: "bottom-center" });
            }
            else if(!$scope.org) {
                $("#org").notify("Please enter the name of your organization.", { position: "bottom-center" });
            }
            else if(!$scope.work_location) {
                $("#work_location").notify("Please choose your home location.", { position: "bottom-center" });
            }
            else if(!$scope.home_location) {
                $("#home_location").notify("Please choose your home location.", { position: "bottom-center" });
            }
            else if(!$scope.email) {
                $("#email").notify("Please enter your email address.", { position: "bottom-center" });
            }
            else if(!validateEmail($scope.email)){
                $("#email").notify("Please enter a valid email.", { position: "bottom-center" });
            }
            else if(!$scope.phone) {
                $("#phone").notify("Please enter your phone number.", { position: "bottom-center" });
            }
            else if($scope.phone.startsWith("0") && $scope.phone.trim().length === 11) {
                $scope.phone.slice(1);
            }
            else if($scope.phone.startsWith("+234")) {
                $scope.phone.slice(4);
            }
            else if($scope.phone.startsWith("234")) {
                $scope.phone.slice(3)
            }
            else if($scope.phone.trim().length < 10 || $scope.phone.trim().length > 14) {
                $("#phone").notify("Please enter a valid phone number.", { position: "bottom-center" });
            }
            else if(!$scope.username) {
                $("#username").notify("Please choose a username.", { position: "bottom-center" });
            }
            else if(!$scope.password) {
                $("#password").notify("Please enter your password.", { position: "bottom-center" });
            }
            else if($scope.password && $scope.password.trim().length < 8) {
                $("#password").notify("You password must have at least 8 characters.", { position: "bottom-center" });
            }
            else {
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
                            $("#signupform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                            break;
                    }
                })
            }
        };

        $scope.resendCode = () => {
            let user = store.get("user");

            let email = rootShared.user["email"] || user.email;

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
                    case "signup_successful":
                        rootShared.user["email"] = $scope.email;

                        $("#signup").hide();
                        $("#email_confirmation").show();
                        break;
                    default:
                        $("#signupform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                        break;
                }
            })
        }
    }

    function LoginPageController($scope, $log, Transporter, $state) {
        function showLoader() {
            $(".loginloader").css("display", "block");
        }

        function hideLoader() {
            $(".loginloader").css("display", "none");
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
                            $("#loginform").notify("Your account has not been verified. Activation code has been sent to your email address. Also check your spam/junk folders.", { position: "bottom-center" });

                            setTimeout(function() {
                                $state.go("email_activation");
                            }, 3000);

                            break;
                        case "login_successful":
                            rootShared.user["email"] = $scope.email;
                            rootShared.user["token"] = response.token;

                            if(rootShared.user["destination"]) {
                                $state.go(rootShared.user["destination"]);
                            } else $state.go("home");

                            break;
                        case "account_notfound":
                            $("#loginform").notify("Account not found. Please check your email and password. Register if you have no account.", { position: "bottom-center" });
                            break;
                        default:
                            $("#loginform").notify("There has been a problem and we don't know the reason. Please try again later.", { position: "bottom-center" });
                            break;
                    }
                })
            }
        }
    }

    function PaymentPageController($scope, Transporter) {

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
                    console.log("Resposne: ", response);
                    if(response.status) {
                        hideLoader();

                        payWithPaystack(response.email, $scope.onlineamount, response.ref, function(response) {
                            console.log("Response from paystack: ", response);

                            if (response.reference) {

                                $(".paymentsuccess").css("display", "block");

                                //rootShared.showNotification("Payment concluded. Pulling up chat time balance.");


                                /*$timeout(function() {
                                    rootShared.startCallRequest();
                                }, 2000);*/
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

        }
    }

    function RoutesPageController() {

    }
