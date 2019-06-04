let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let FaresSchema = new Schema({
    route: { type: String },
    fareoneway: { type: Number},
    farereturn: { type: Number}
});

module.exports = mongoose.model('Fares', FaresSchema);