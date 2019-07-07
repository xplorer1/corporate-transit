var storage = require('node-persist');
let Individual = require("../models/places");

module.exports = function(app, appstorage) {
    (function loadAppUtils() {


        //console.log("storage: ", storage);
        //storage.clear();
        /*storage.keys().forEach(function(key) {
            app.set(key, appstorage.get(key));
            console.log("KEYS: ", key, "VALUE: ", app.get(key))
        });*/
    })();
};