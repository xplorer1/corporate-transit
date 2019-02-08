let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let CardNumbersSchema = new Schema({
    ct_numbers: [{type: String}]
});

module.exports = mongoose.model('CardNumbers', CardNumbersSchema);
