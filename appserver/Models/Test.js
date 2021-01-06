var mongoose = require( 'mongoose' );

//subdocument
var testSchema = new mongoose.Schema({
    course: {type: String, required: true},
    subCourse: {type: String, required: true},
    topic: {type: String, required: true},
    questionType: {type: String, required: true},
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
    category: {type: String, required: true},
    difficulty: {type: Number, required: true},
    contributor: {type: String, required: true},
    approved: {type: String, required: true},
    approvedby: {type: String, required: true},
    version: {type: Number, required: true},
    isDuplicate: {type: String, required: true}
});

module.exports.testdocs = mongoose.model('Tests', testSchema);