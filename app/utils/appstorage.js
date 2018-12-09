var storage = require('node-persist');

module.exports = function(app) {
    var dbSettings = {
        set: function(settingname, settingvalue){
            storage.initSync();

            try{
                // storage.removeItemSync(settingname);
                storage.setItemSync(settingname, JSON.stringify(settingvalue));
            }catch(err){
                console.log('storage error:', err.message, 'settingvalue', settingvalue);
            }
        },
        get: function(settingname){
            storage.initSync();

            var result = storage.getItemSync(settingname);
            if(result) result = JSON.parse(result);

            return result
        },
        remove: function(settingname){
            storage.initSync();

            storage.removeItemSync(settingname);
        }
    };

    return dbSettings;
};