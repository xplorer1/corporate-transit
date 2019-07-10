let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let bcrypt = require('bcrypt-nodejs');

let CompanySchema = new Schema({
    companyname: { type: String, trim: true, uppercase: true},
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
    payments: {type: [String]},
    createdon: { type: Date, select: false, default: Date.now },
    verified: { type: Boolean, select: false, default: false },
    verifiedon: { type: Date, select: false },
    vcode: { type: String },
    ct_cardnumber: {type: String},
    updatestatus: { type: String},
    office_location: { type: String },
    employeescount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    route: { type: String },
    role: { type: String }
});

CompanySchema.index({'$**': 'text'});

//"/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/"

/*
UserSchema.pre('save', function(next) {
    let user = this;
    let SALT_FACTOR = 15;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});
*/

/*UserSchema.methods.comparePassword = function(userpassword, cb) {
    bcrypt.compare(userpassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};*/

module.exports = mongoose.model('Company', CompanySchema);
