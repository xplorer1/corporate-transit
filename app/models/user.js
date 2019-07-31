let mongoose = require('mongoose');
let Schema   = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let UserSchema = new Schema({
    'email' : String,
    'password' : String,
    'role' : String,
    'cardstatus': { type: String, default: "enabled"},
    'ct_cardnumber' : { type: String },
    'ct_cardstatus' : { type: String },
    'createdon' : Date,
    'verified': { type: Boolean },
    'verifiedon': { type: Date, default: new Date() },
    'vcode': { type: String },
    'resetpasswordtoken': {type: String},
    'resetpasswordexpires': {type: Date},
});

// hash the password before the user is saved
UserSchema.pre('save', function (next) {
    let user = this;

    // hash the password only if the password has been changed or user is new
    if (!user.isModified('password')) return next();

    // generate the hash
    bcrypt.hash(user.password, null, null, function (err, hash) {
        if (err) return next(err);

        // change the password to the hashed version
        user.password = hash;
        next();
    });
});

// method to compare a given password with the database hash
UserSchema.methods.comparePassword = function (password) {
    try{
        let user = this;

        return bcrypt.compareSync(password, user.password);
    }catch(e){
        console.log("password compare exception:", e);
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);