angular.module('MainModule', [
    'ControllersModule',
    'ui.router',
    'Transporter',
    'AdminService',
    'Utilities',
    'ui.bootstrap'
])
    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', function($stateProvider, $locationProvider, $urlRouterProvider) {

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
            .state('signup', {
                url: '/signup',
                templateUrl: '../views/pages/signup.html',
                controller: 'SignUpPageController'
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
                url: '/reset',
                templateUrl: '../views/pages/resetpassword.html',
                controller: "LoginPageController"
            })
            .state('notfound', {
                url: '/notfound',
                templateUrl: '../views/pages/notfound.html',
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
            .state('adminlogin', {
                url: '/adminlogin',
                templateUrl: '../views/admin/adminlogin.html',
                controller: "AdminController"
            });

        $urlRouterProvider.otherwise('/notfound');

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);