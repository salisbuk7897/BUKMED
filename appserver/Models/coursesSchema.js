var mongoose = require( 'mongoose' );

//subdocument
var tpSchema = new mongoose.Schema({
    topic: {type: String, required: true}
});

//subdocument
var scSchema = new mongoose.Schema({
    subCourse: {type: String, required: true},
    topics: [tpSchema]
});

var coursesSchema = new mongoose.Schema({
    title: {type: String, required: true},
    name: {type: String, required: true},
    selected: {type: String, required: true},
    type: {type: String, required: true},
    subCourses: [scSchema]
    
});

module.exports = mongoose.model('coursesActivity', coursesSchema);