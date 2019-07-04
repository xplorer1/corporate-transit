angular.module('CompanyService', [])

    .factory('CompanyService', ['$http', '$q', CompanyService]);

function CompanyService($http, $q) {

    // create a new object
    let companyservice = {};
    let baseurl = "http://127.0.0.1:8080";
    //let baseurl = "https://corporatetransit.com.ng"

    companyservice.login = function(userData) {
        return $http.post(baseurl+"/api/login", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.companysignup = function(userData) {
        return $http.post(baseurl+"/api/companysignup", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.adduser = function(userData) {
        return $http.post(baseurl+"/api/adduser", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.deleteuser = function(userData) {
        return $http.post(baseurl+"/api/deleteadmin", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.replymessage = function(userData) {
        return $http.post(baseurl+"/api/replymessage", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.enablecard = function(userData) {
        return $http.post(baseurl+"/api/enablecard", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.disablecard = function(userData) {
        return $http.post(baseurl+"/api/disablecard", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.addroute = function(userData) {
        return $http.post(baseurl+"/api/addroute", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    companyservice.changefare = function(userData) {
        return $http.post(baseurl+"/api/changefare", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    // return our entire companyservice object
    return companyservice;
}
