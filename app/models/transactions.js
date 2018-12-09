let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let TransactionJournalSchema = new Schema({
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
    transactionid: { type: String, required: true, index: { unique: true } },
    transaction: { type: String},
    amount: { type: Number, required: true },
    success: {type: Boolean, default: false},
    created: { type: Date, default: Date.now }
});

TransactionJournalSchema.index({'$**': 'text'});

module.exports = mongoose.model('TransactionJournal', TransactionJournalSchema);
