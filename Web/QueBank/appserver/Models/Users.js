var mongoose = require( 'mongoose' );

//subdocument
var userSchema = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    school: {type: String, required: true},
    dept: {type: String, required: true},
    email: {type: String, required: true},
    level: {type: String, required: true},
    username: {type: String, required: true},
    role: {type: String, required: true},
    password: {type: String, required: true},
    clevel: {type: Number, required: true},
    noOfQ: {type: Number, required: true},
    qApproved: {type: Number, required: true},
});

module.exports.userdocs = mongoose.model('Users', userSchema);