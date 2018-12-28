let storage = require('node-persist');

module.exports = function(app, appstorage) {

    (function loadAppUtils() {
        //storage.clear();
        //console.log("storage: ", storage);
        storage.keys().forEach(function(key) {
            app.set(key, appstorage.get(key));
            console.log("KEYS: ", key, "VALUE: ", app.get(key))
        });
    })();
};