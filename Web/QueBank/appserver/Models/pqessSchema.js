var mongoose = require( 'mongoose' );

//subdocument
var essSchema = new mongoose.Schema({
    question: {type: String, required: true},
    contributor: {type: String, required: true},
    approved: {type: String, required: true},
});

var pqessSchema = new mongoose.Schema({
    course: {type: String, required: true},
    year : {type: String, required: true},
    type : {type: String, required: true},
    owner : {type: String, required: true},
    version : {type : Number, required: true},
    questions : [essSchema]
});

module.exports = mongoose.model('pqessActivity', pqessSchema);