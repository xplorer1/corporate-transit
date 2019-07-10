let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let PlacesSchema = new Schema({
    home: {type: [String]},
    work: {type: [String]},
});

module.exports = mongoose.model('Places', PlacesSchema);