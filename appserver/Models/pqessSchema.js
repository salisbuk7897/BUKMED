var mongoose = require( 'mongoose' );

var rtSchema = new mongoose.Schema({
    rating: {type: Number, required: true}
});

var ansSchema = new mongoose.Schema({
    ratings: [rtSchema],
    answer: {type: String, required: true}
});

//subdocument
var essSchema = new mongoose.Schema({
    _id : {type : Number, required: true},
    label: {type: String, required: true},
    question: {type: String, required: true},
    contributor: {type: String, required: true},
    approved: {type: String, required: true},
    answers: [ansSchema]
});

var pqessSchema = new mongoose.Schema({
    _id : {type : Number, required: true},
    name : {type: String, required: true},
    year : {type: String, required: true},
    type : {type: String, required: true},
    owner : {type: String, required: true},
    qnum : {type : Number, required: true},
    version : {type : Number, required: true},
    questions : [essSchema]
});

module.exports = mongoose.model('pqessActivity', pqessSchema);