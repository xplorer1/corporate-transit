var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SlotSchema = new Schema({
    slotid: {type: String},
    users: [{
        email: {
            type: String,
                lowercase: true,
                required: true,
                index: { unique: true },
            validate: {
                validator: function(v) {
                    return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
                },
                message: '{VALUE} is not a valid email!'
            }
        },
        added: {type: Date}
    }],
    added: { type: Date, default: Date.now },
    slotcount: {type: Number, default: 0},
    availableseats: {type: Number, default: 30}
});

module.exports = mongoose.model('Slot', SlotSchema);
