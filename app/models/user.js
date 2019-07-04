var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var UserSchema = new Schema({
    'email' : String,
    'password' : String,
    'role' : String,
    'cardstatus': { type: String, default: "enabled"},
    'createdon' : Date,
    'verified': { type: Boolean },
    'verifiedon': { type: Date, default: new Date() },
    'vcode': { type: String },
    'resetpasswordtoken': {type: String},
    'resetpasswordexpires': {type: Date},
});

module.exports = mongoose.model('User', UserSchema);