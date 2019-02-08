let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SlotSchema = new Schema({
    slotid: {type: String},
    users: [{
        email: {
            type: String,
            lowercase: true,
            required: true,
            validate: {
                validator: function(v) {
                    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
                },
                message: '{VALUE} is not a valid email!'
            }
        },
        added: { type: Date, default: new Date()},
    }],
    validity: [{
        email: {
            type: String,
            lowercase: true,
            required: true,
            validate: {
                validator: function(v) {
                    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
                },
                message: '{VALUE} is not a valid email!'
            }
        },
        count: { type: Number, default: 0}
    }],
    slotcount: {type: Number, default: 0}
});

module.exports = mongoose.model('Slot', SlotSchema);
