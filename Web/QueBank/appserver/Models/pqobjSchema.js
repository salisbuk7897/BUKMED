var mongoose = require( 'mongoose' );

//subdocument
var objSchema = new mongoose.Schema({
    question: {type: String, required: true},
    option1: {type: String, required: true},
    option2: {type: String, required: true},
    option3: {type: String, required: true},
    option4: {type: String, required: true},
    option5: {type: String, required: true},
    answer1: {type: String, required: true},
    answer2: {type: String, required: true},
    answer3: {type: String, required: true},
    answer4: {type: String, required: true},
    answer5: {type: String, required: true},
    picture: {type: String},
    contributor: {type: String, required: true},
    approved: {type: String, required: true},
});

var pqobjSchema = new mongoose.Schema({
    name : {type: String, required: true},
    year : {type: String, required: true},
    type : {type: String, required: true},
    owner : {type: String, required: true},
    version : {type : Number, required: true},
    questions : [objSchema]
});

module.exports = mongoose.model('pqobjActivity', pqobjSchema);