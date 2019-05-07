let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PaymentJournalSchema = new Schema({
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
    paymentid: { type: String, required: true},
    paymenttype: { type: String},
    paymentstatus: { type: String },
    amount: { type: Number, required: true, default: 0 },
    created: { type: Date, default: Date.now },
    createdformatted: { type: String }
});

module.exports = mongoose.model('PaymentJournal', PaymentJournalSchema);