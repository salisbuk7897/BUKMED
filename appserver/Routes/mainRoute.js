var express = require('express');
var router = express.Router();
var mongo = require("../Controller/Mongo");
var multer  = require('multer')
const path = require('path');
const fs = require('fs');
var ctrlStatic = require('../Controller/question');
var regController = require('../Controller/Register');
var login = require('../Controller/login');
// handler for fie storage in /uploads
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //Appending extension
    }
})

var upload = multer({ storage: storage }); // make use of storage above

var sessionChecker = (req, res, next) => {
  if (req.session.name && req.cookies.user_sid) { //If user login session is available
      next()
  } else { 
      res.redirect("/log_in") //redirect to login page if user is not logged in
  }    
};

//Rnder Admin
/*router.get('/admin', sessionChecker, function(req, res, next) {
  if(req.session.role === 'Admin'){
    res.render('Admin');
  }else{
    res.render('noaccess');
  }
  
});*/

router.get('/admin', function(req, res, next) {
  res.render('Admin');
});

//For Adding Subcourse
router.post('/addsc', function(req, res){
  mongo.addSubCourse(req.body.course, req.body.subCourse);
  console.log(req.body);
});

router.post('/getsc', function(req, res){
  mongo.getSC(req.body.course, function(e){
    res.send({c:req.body.course, sc:e});
  })
});

//For Adding topics
router.post('/getsct', function(req, res){
  mongo.getSCt(req.body.course, function(e){
    res.send({c:req.body.course, sc:e});
  })
});

router.post('/gettopics',async function(req, res){
  await mongo.getTopics(req.body.course, req.body.SubCourse, function(e){
    res.json({c:req.body.course, sc:req.body.SubCourse, topics:e});
  })
});

router.post('/gettopicst',async function(req, res){
  await mongo.getTopicst(req.body.course, req.body.SubCourse, function(e){
    res.json({c:req.body.course, sc:req.body.SubCourse, topics:e});
  })
});


router.get('/add_esspq', sessionChecker, ctrlStatic.rEssay);

router.post('/registeress', ctrlStatic.addEssay);

router.post("/registerpq", ctrlStatic.registerpq);

router.post("/addpq", upload.single('question_pic'), ctrlStatic.addPQ);

router.post("/approve", ctrlStatic.qforApproval);

router.post("/appr", ctrlStatic.Approve); ///approve through ajav in slider.js

router.post("/modify", ctrlStatic.Modify); ///modify and approve through ajav in slider.js

router.post("/deletead", ctrlStatic.Delete); ///modify and approve through ajav in slider.js

router.get('/dashboard', sessionChecker, login.getDash)

router.post('/saveque', upload.single('question_pic'),  ctrlStatic.saveQuestion)

router.post('/register', upload.single('pic'),  regController.register);

router.get('/log_in', function(req, res, next) {
  res.render('login');
});

router.post("/log_in", login.userLogin);

router.use("/log_out", (req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) { // if cookie is available
      res.clearCookie('user_sid'); // delete cookie
  }
  res.redirect("/") //redirect to homepage
});

/* GET home page. */
router.get('/', function(req, res, next) {
  try{
    if(req.session.name){ //Check if User login session is available
      res.render("index",{msg:"logged in", name:req.session.name, title: 'Express'}); // render the homepage wih Admin previledge
    }else{ // if login session not available
      res.render('index', { title: 'Express' }); //render the homepage with user previledge
    }
  }catch(e){
    res.render('index', { title: 'Express' });
  }
  
});

router.get('/i', function(req, res, next) {
  res.send('index');
});

/*router.get('/register', function(req, res, next) {
    res.render('Register');
});*/

router.get('/add_question', sessionChecker, function(req, res, next) {
    res.render('Questions', {msg:"li", name:req.session.name});
});



router.get('/add_objpq', sessionChecker, ctrlStatic.getPQ);

router.get('/reg_pq', sessionChecker, function(req, res, next) {
  res.render('registerpq');
});

router.get('/adminque', function(req, res, next) {
  res.render('admin_que');
});

router.get('/adminapr', function(req, res, next) {
  res.render('admin_apr');
});

router.get('/ajax', function(req, res){
  //console.log("ajas visited");
  res.render('ajax', {title: 'An Ajax Example', quote: "AJAX is great!"});
});


router.post('/delsc', function(req, res){
  mongo.delSC(req.body.course, req.body.SubCourse, function(e){
    //console.log(e);
    res.send(e);
    //res.send(e);
  })
  //res.render('admin_que');
});

router.post('/deltopic', function(req, res){
  mongo.delTopic(req.body.course, req.body.topic, function(e){
    //console.log(e);
    res.send(e);
    //res.send(e);
  })
  //res.render('admin_que');
});

router.post('/addtopic', function(req, res){
  //console.log(req.body);
  mongo.addTopic(req.body.course, req.body.subCourse, req.body.topic)
  //res.render('ajax', {title: 'Ajax Example', quote: req.body.quote});
});

router.post('/ajax', function(req, res){
  console.log(req.body);
  res.render('ajax', {title: 'Ajax Example', quote: req.body.quote});
});

module.exports = router;