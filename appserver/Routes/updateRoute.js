var express = require('express');
var router = express.Router();
var mongo = require("../Controller/Mongo");
var multer  = require('multer')
const path = require('path');
const fs = require('fs');
var ctrlStatic = require('../Controller/question');
var regController = require('../Controller/Register');
var login = require('../Controller/login');
var jwt = require('../../jwt');
// handler for fie storage in /uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //Appending extension
    }
})

var upload = multer({ storage: storage }); 

router.get('/getsc', function(req, res){
    mongo.getSC(req.query.course, function(e){
      res.json({subCourse:e});
    })
});

router.get('/gettopics',async function(req, res){
    await mongo.getTopics(req.query.course, req.query.subCourse, function(e){
        res.json({topics:e});
    })
});
router.get('/getcourses', mongo.getAllCourses)

router.get('/getquestions', ctrlStatic.getAllQuestions)

router.get('/getpqs', ctrlStatic.getPQUpdates);

router.post('/jwtgetpqs', jwt.authenticateToken, ctrlStatic.getPQUpdates)

router.post('/app_dashboard', jwt.authenticateToken, jwt.getDash)

router.post('/app_register', regController.Appregister);

router.post('/getpq', jwt.authenticateToken, jwt.getPQ);

module.exports = router;