let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let SeatCountSchema = new Schema({
    busid: {type: String},
    availableseats: {type: Number, default: 0}
});

module.exports = mongoose.model('SeatCount', SeatCountSchema);
