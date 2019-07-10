var storage = require('node-persist');
let Places = require("../models/places");

module.exports = function(app, appstorage) {
    (function loadAppUtils() {
        Places.find({}, (err, places) => {
        	
        	if(err) console.log("err: ", err.message);

        	if(places) {
        		app.set("places", places);
        	}
        })
    })();
};