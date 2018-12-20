angular.module('Transporter', [])

    .factory('Transporter', ['$http', '$q', TransporterFnc]);

function TransporterFnc($http, $q) {

    // create a new object
    let transporter = {};
    let baseurl = function(){ return rootShared.seed.baseurl; };

    transporter.signup = function(userData) {
        return $http.post(baseurl()+"/api/signup", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.login = function(userData) {
        return $http.post(baseurl()+"/api/login", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.booktrip = function(userData) {
        return $http.post(baseurl()+"/api/booking", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resendcode = function(userData) {
        return $http.post(baseurl()+"/api/resendvcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.contactus = function(userData) {
        return $http.post(baseurl()+"/api/contactus", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.forgotpassword = function(userData) {
        return $http.post(baseurl()+"/api/forgotpassword", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.fund_ct = function(userData) {
        return $http.post(baseurl()+"/api/fund_ct", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.payviaussd = function(userData) {
        return $http.post(baseurl()+"/api/payviaussd", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.confirm = function(userData) {
        return $http.post(baseurl()+"/api/confirm", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.checkcode = function(userData) {
        return $http.post(baseurl()+"/api/checkcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resetpassword = function(userData) {
        return $http.post(baseurl()+"/api/resetpassword", userData).then(
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
