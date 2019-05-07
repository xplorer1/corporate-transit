angular.module('Transporter', [])

    .factory('Transporter', ['$http', '$q', TransporterFnc]);

function TransporterFnc($http, $q) {

    // create a new object
    let transporter = {};
    //let baseurl = "http://127.0.0.1:80";
    let baseurl = "https://corporatetransit.com.ng"

    transporter.signup = function(userData) {
        return $http.post(baseurl+"/api/signup", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.login = function(userData) {
        return $http.post(baseurl+"/api/login", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.booktrip = function(userData) {
        return $http.post(baseurl+"/api/booking", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resendcode = function(userData) {
        return $http.post(baseurl+"/api/resendvcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resendresetcode = function(userData) {
        return $http.post(baseurl+"/api/resendresetcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.contactus = function(userData) {
        return $http.post(baseurl+"/api/contactus", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.forgotpassword = function(userData) {
        return $http.post(baseurl+"/api/forgotpassword", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.fund_ct = function(userData) {
        return $http.post(baseurl+"/api/fund_ct", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.paytoravebank = function(userData) {
        return $http.post("https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/charge", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.confirm = function(userData) {
        return $http.post(baseurl+"/api/confirm", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.checkcode = function(userData) {
        return $http.post(baseurl+"/api/checkcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resetpassword = function(userData) {
        return $http.post(baseurl+"/api/resetpassword", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.getbookinghistory = function(userData) {
        return $http.post(baseurl+"/api/bookinghistory", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.getpaymenthistory = function(userData) {
        return $http.post(baseurl+"/api/paymenthistory", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.cancelbooking = function(userData) {
        return $http.post(baseurl+"/api/cancelbooking", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.gettransactionhistory = function(userData) {
        return $http.post(baseurl+"/api/transactionhistory", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.gethistory = function(userData) {
        return $http.post(baseurl+"/api/gethistory", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.searchhistory = function(userData) {
        return $http.post(baseurl+"/api/searchhistory", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.getbalance = function(userData) {
        return $http.post(baseurl+"/api/getbalance", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    // return our entire transporter object
    return transporter;
}
