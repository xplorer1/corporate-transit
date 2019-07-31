angular.module('AdminService', [])

    .factory('AdminService', ['$http', '$q', AdminService]);

function AdminService($http, $q) {

    // create a new object
    let adminservice = {};
    //let baseurl = "http://127.0.0.1:8080";
    let baseurl = "https://corporatetransit.com.ng";

    adminservice.verifysuper = function(userData) {
        return $http.post(baseurl+"/admin/verifysuper", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.adduser = function(userData) {
        return $http.post(baseurl+"/admin/adduser", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.deleteuser = function(userData) {
        return $http.post(baseurl+"/admin/deleteadmin", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.replymessage = function(userData) {
        return $http.post(baseurl+"/admin/replymessage", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.enablecard = function(userData) {
        return $http.post(baseurl+"/admin/enablecard", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.disablecard = function(userData) {
        return $http.post(baseurl+"/admin/disablecard", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.addroute = function(userData) {
        return $http.post(baseurl+"/admin/addroute", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    adminservice.changefare = function(userData) {
        return $http.post(baseurl+"/admin/changefare", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

    // return our entire adminservice object
    return adminservice;
}
