let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let RoutesSchema = new Schema({
    route: { type: String },
    pickup_morning: {
        time: {type: String},
        point: {type: String},
    },
    drop_morning: {
        time: {type: String},
        point: {type: String},
    },

    pickup_evening: {
        time: {type: String},
        point: {type: String},
    },
    drop_evening: {
        time: {type: String},
        point: {type: String},
    },
});

module.exports = mongoose.model('Routes', RoutesSchema);