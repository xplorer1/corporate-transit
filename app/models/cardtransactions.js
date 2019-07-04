
let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CardTransactionSchema = new Schema({
    cardnumber: { type: String },
    transid: { type: String, required: true, unique: true},
    transdate: { type: Date},
    amount: { type: Number, required: true, default: 0 },
    created: { type: Date, default: Date.now },
    createdformatted: { type: String }
});

module.exports = mongoose.model('CardTransaction', CardTransactionSchema);