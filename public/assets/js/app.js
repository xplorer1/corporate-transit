angular.module('MainModule', [
    'ControllersModule',
    'ui.router',
    'Transporter',
    'ui.bootstrap'
])
    .config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'index.html',
                controller: 'MainPageController'
            })
            .state('booking', {
                url: '/booking',
                templateUrl: '../views/pages/booking.html',
                controller: 'BookingPageController'
            })
            .state('contact_us', {
                url: '/contact_us',
                templateUrl: '../views/pages/contact_us.html',
                controller: 'ContactPageController'
            })
            .state('faqs', {
                url: '/faqs',
                templateUrl: '../views/pages/faqs.html',
                controller: 'FaqsPageController'
            })
            .state('how_it_works', {
                url: '/how_it_works',
                templateUrl: '../views/pages/how_it_works.html',
                controller: 'How_It_WorksPageController'
            })
            .state('payment', {
                url: '/payment',
                templateUrl: '../views/pages/payment.html',
                controller: 'PaymentPageController'
            })
            .state('pricing', {
                url: '/pricing',
                templateUrl: '../views/pages/pricing.html',
                controller: 'PricingPageController'
            })
            .state('routes', {
                url: '/routes',
                templateUrl: '../views/pages/routes.html',
                controller: 'RoutesPageController'
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
            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '../views/pages/dashboard.html',
                controller: 'DashboardController'
            })
            .state('email_activation', {
                url: '/email_activation',
                templateUrl: '../views/pages/email_activation.html',
                controller: "EmailActivationController"
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    }]);