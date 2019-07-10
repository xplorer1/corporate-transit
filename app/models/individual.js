let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let IndividualSchema = new Schema({
    fullname: { type: String, lowercase: true, trim: true, uppercase: true },
    username: { type: String, lowercase: true, index: { unique: true }, trim: true },
    password: { type: String, minlength: 8},
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
    phone: {
        type: String,
        trim: true,
        index: { unique: true },
        validate: {
            validator: function(v) {
                return /\d{3}\d{3}\d{4}/.test(v) && String(v).length === 11;
            },
            message: '{VALUE} is not a valid phone number!'
        }
    },
    createdon: { type: Date, select: false, default: Date.now },
    work: { type: String },
    org: { type: String },
    gender: { type: String },
    ct_cardnumber: {type: String},
    updatestatus: { type: String},
    ct_cardstatus: {type: String},
    home: { type: String },
    route: { type: String },
    balance: { type: Number, default: 0 },
    payments: {type: [String]},
    role: { type: String}
});

IndividualSchema.index({'$**': 'text'});

module.exports = mongoose.model('Individual', IndividualSchema);