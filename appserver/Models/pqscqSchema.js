var mongoose = require( 'mongoose' );

//subdocument
var objsSchema = new mongoose.Schema({
    _id : {type : Number, required: true},
    question: {type: String, required: true},
    option1: {type: String, required: true},
    option2: {type: String, required: true},
    option3: {type: String, required: true},
    option4: {type: String, required: true},
    option5: {type: String, required: true},
    answer: {type: String, required: true},
    picture: {type: String},
    contributor: {type: String, required: true},
    approved: {type: String, required: true},
});

var pqscqSchema = new mongoose.Schema({
    _id : {type : Number, required: true},
    name : {type: String, required: true},
    year : {type: String, required: true},
    type : {type: String, required: true},
    owner : {type: String, required: true},
    version : {type : Number, required: true},
    qnum : {type : Number, required: true},
    questions : [objsSchema]
});

module.exports = mongoose.model('pqscqActivity', pqscqSchema);