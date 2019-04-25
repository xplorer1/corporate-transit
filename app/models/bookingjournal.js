let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let BookingJournalSchema = new Schema({
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
    booking: {
        bookingid: {type: String, required: true},
        bookingtype: {type: String},
        bookingcost: { type: Number, required: true, default: 0 },
        bookedon: { type: Date, default: Date.now},
        bookedonformatted: { type: String},
        bookingtime: {type: String },
        bookingstatus: { type: String},
        routefrom: { type: String },
        routeto: { type: String },
        from: { type: String },
        to: { type: String },
        mode: { type: String },
        tripmode: { type: String },
        ct_cardnumber: {type: String}
    }
});

BookingJournalSchema.index({'$**': 'text'});

module.exports = mongoose.model('BookingJournal', BookingJournalSchema);