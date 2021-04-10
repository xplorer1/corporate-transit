angular.module('Transporter', [])

    .factory('Transporter', ['$http', '$q', TransporterFnc]);

function TransporterFnc($http, $q) {

    // create a new object
    let transporter = {};
    let baseurl = "http://127.0.0.1:8080";
    //let baseurl = "https://039053aa.ngrok.io";
    //let baseurl = "https://corporatetransit.com.ng";
    //let baseurl = "https://a66e4d2c.ngrok.io";

    transporter.test = function(userData) {
        return $http.post(baseurl+"/api/assigncard", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.fetchplaces = function(userData) {
        return $http.get(baseurl+"/api/getplaces", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

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

    transporter.updatedetails = function(userData) {
        return $http.post(baseurl+"/api/updatedetails", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.addemployee = function(userData) {
        return $http.post(baseurl+"/api/addemployee", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.removeemployee = function(userData) {
        return $http.post(baseurl+"/api/removeemployee", userData).then(
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
