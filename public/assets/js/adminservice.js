angular.module('AdminService', [])

    .factory('AdminService', ['$http', '$q', AdminService]);

function AdminService($http, $q) {

    // create a new object
    let adminservice = {};
    //let baseurl = "http://127.0.0.1:80";
    let baseurl = "https://corporatetransit.com.ng"

    adminservice.adminlogin = function(userData) {
        return $http.post(baseurl+"/admin/adminlogin", userData).then(
            function(response){
                return $q.when(response.data);
            },
            function(err){
                return $q.reject(err);
            });
    };

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

    adminservice.replymessage = function(userData) {
        return $http.post(baseurl+"/admin/replymessage", userData).then(
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