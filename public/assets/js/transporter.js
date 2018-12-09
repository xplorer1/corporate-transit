angular.module('Transporter', [])

    .factory('Transporter', ['$http', '$q', TransporterFnc]);

function TransporterFnc($http, $q) {

    // create a new object
    let transporter = {};
    let baseurl = function(){ return rootShared.seed.baseurl; };

    transporter.signup = function(userData) {
        return $http.post(baseurl()+"/api/ct/signup", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.login = function(userData) {
        return $http.post(baseurl()+"/api/ct/login", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.booktrip = function(userData) {
        return $http.post(baseurl()+"/api/ct/booking", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.resendcode = function(userData) {
        return $http.post(baseurl()+"/api/ct/resendvcode", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.contactus = function(userData) {
        return $http.post(baseurl()+"/api/ct/contactus", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    transporter.fund_ct = function(userData) {
        return $http.post(baseurl()+"/api/ct/fund_ct", userData).then(
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
