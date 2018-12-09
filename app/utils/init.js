let storage = require('node-persist');

module.exports = function(app, appstorage) {

    (function loadAppUtils() {
        //storage.clear();
        storage.keys().forEach(function(key) {
            app.set(key, appstorage.get(key));
            console.log("KEYS: ", key, "VALUE: ", app.get(key))
        });
    })();
};