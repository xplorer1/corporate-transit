let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let AdminSchema = new Schema({
    superuser: {type: Boolean, select: false, default: false},
    fullname: {type: String },
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
    role: { type: String },
    id: { type: String },
    createdon: { type: Date, select: false, default: Date.now },
    verified: { type: Boolean, select: false, default: false },
    verifiedon: { type: Date, select: false },
    vcode: { type: String },
    resetpasswordcode: {type: String},
    resetpasswordexpires: {type: Date},
});

AdminSchema.index({'$**': 'text'});

module.exports = mongoose.model('Admin', AdminSchema);
