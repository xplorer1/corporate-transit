angular.module('MainModule', [
    'ControllersModule',
    'ui.router',
    'Transporter',
    'AdminService',
    'CompanyService',
    'Utilities',
    'ui.bootstrap',
    'ui-notification'
])
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'NotificationProvider', function($stateProvider, $locationProvider, $urlRouterProvider, NotificationProvider) {

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'index.html',
                controller: 'MainPageController'
            })
            .state('booking_history', {
                parent: 'landing',
                url: '/booking_history',
                templateUrl: '../views/pages/booking_history.html',
                controller: 'BookingHistoryController'
            })
            .state('verify', {
                url: '/verify/:vcode',
                templateUrl: '../views/pages/verify.html',
                controller: 'SignUpPageController'
            })
            .state('cverify', {
                url: '/cverify/:vccode',
                templateUrl: '../views/pages/companyverify.html',
                controller: 'CompanySignUpController'
            })
            .state('signup', {
                url: '/signup',
                templateUrl: '../views/pages/signup.html',
                controller: 'SignUpPageController'
            })
            .state('edit', {
                url: '/edit',
                templateUrl: '../views/pages/edit.html',
                controller: 'GeneralController'
            })
            .state('comedit', {
                url: '/edit',
                templateUrl: '../views/pages/comedit.html',
                controller: 'GeneralController'
            })
            .state('login', {
                url: '/login',
                templateUrl: '../views/pages/login.html',
                controller: 'LoginPageController'
            })
            .state('forgotpassword', {
                url: '/forgotpassword',
                templateUrl: '../views/pages/forgotpassword.html',
                controller: "LoginPageController"
            })
            .state('reset', {
                url: '/reset/:resetcode',
                templateUrl: '../views/pages/resetpassword.html',
                controller: "LoginPageController"
            })
            .state('notfound', {
                url: '/notfound',
                templateUrl: '../views/pages/notfound.html',
                controller: "GeneralController"
            })
            .state('terms', {
                url: '/terms',
                templateUrl: '../views/pages/terms.html',
                controller: "GeneralController"
            })
            .state('payment_history', {
                parent: 'landing',
                url: '/payment_history',
                templateUrl: '../views/pages/payment_history.html',
                controller: "PaymentHistoryController"
            })
            .state('transaction_history', {
                parent: 'landing',
                url: '/transactions',
                templateUrl: '../views/pages/transactions.html',
                controller: "PaymentHistoryController"
            })
            .state('landing', {
                url: '/landing',
                templateUrl: '../views/pages/landing.html',
                controller: "LandingController"
            })
            .state('admin', {
                url: '/admin',
                templateUrl: '../views/admin/admin.html',
                controller: "AdminController"
            })
            .state('company', {
                url: '/company',
                templateUrl: '../views/company/company.html',
                controller: "CompanyController"
            })
            .state('companysignup', {
                url: '/companysignup',
                templateUrl: '../views/company/companysignup.html',
                controller: "CompanySignUpController"
            })

        $urlRouterProvider.otherwise('/notfound');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

        NotificationProvider.setOptions({
            delay: 10000,
            startTop: 30,
            startRight: 10,
            verticalSpacing: 20,
            horizontalSpacing: 20,
            positionX: 'center',
            positionY: 'top'
        });
    }]);