var Zconfig = require("../../qconfig.json");
var mongoose = require( 'mongoose' );
var appbaseurl = Zconfig.appurl;
var appbaseport = Zconfig.appport;
let httptype = Zconfig.httptype;
var mongourl = Zconfig['mongourl'];
var mongoport = Zconfig['mongoport'];
var axios = require('axios');
var path = require('path');
const fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var authSource = Zconfig['authSource'];
var conn;
let coursesdoc = require("../Models/coursesSchema");
const { collection } = require("../Models/coursesSchema");
var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 
var helper = require("./helpers");
let objdoc = require("../Models/pqobjSchema");
let essdoc = require("../Models/pqessSchema");
let scqdoc = require('../Models/pqscqSchema');
let userdoc = require('../Models/Users');
var helper = require("./helpers");

module.exports.managePQ = function(req, res){
    //console.log(req.query);
    var cdata = [];
    try{
        if(req.query.type === 'scq'){
            mangeSCQPQ(req.query.user, req.query.pqname, function(e){
                res.render("appscqpq", {data: e.data, pqid: e.pqid});
            });
        }else if(req.query.type === 'mcq'){
            mangeMCQPQ(req.query.user, req.query.pqname, function(e){
                res.render("appmcqpq", {data: e.data, pqid: e.pqid});
            });
        }else if(req.query.type === 'essay'){
            mangeEssayPQ(req.query.user, req.query.pqname, function(e){
                res.render("appessaypq", {data: e.data, pqid: e.pqid});
            });
        }
    }catch(e){
        console.log(e);
    }
    
}

function mangeSCQPQ(user, pastq, fn){
    if (dbauth === 'true'){
        var cdata = [];
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqscqactivities').find({owner: user , name: pastq}).toArray(function(err, result){
                if (err) throw err;
                if(result.length === 0){
                    console.log(`${pastq} not found`)
                }else{
                    var qs = result[0]['questions'];
                    //console.log(qs);
                    for(i in qs){
                        if(qs[i]['approved'] === "false"){
                            cdata.push(qs[i]);
                        }
                    }
                }
                fn({pqid: result[0]['_id'], data: cdata});
                //res.render('admin_apr2', {data:cdata});
                db.close();
            });
        });
    }else{
        //db auth not in use
    }
}

function mangeMCQPQ(user, pastq, fn){
    if (dbauth === 'true'){
        var cdata = [];
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find({owner: user , name: pastq}).toArray(function(err, result){
                if (err) throw err;
                if(result.length === 0){
                    console.log(`${pastq} not found`)
                }else{
                    var qs = result[0]['questions'];
                    //console.log(qs);
                    for(i in qs){
                        if(qs[i]['approved'] === "false"){
                            cdata.push(qs[i]);
                        }
                    }
                }
                fn({pqid: result[0]['_id'], data: cdata});
                //res.render('admin_apr2', {data:cdata});
                db.close();
            });
        });
    }else{
        //db auth not in use
    }
}

function mangeEssayPQ(user, pastq, fn){
    if (dbauth === 'true'){
        var cdata = [];
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqessactivities').find({owner: user , name: pastq}).toArray(function(err, result){
                if (err) throw err;
                if(result.length === 0){
                    console.log(`${pastq} not found`)
                }else{
                    var qs = result[0]['questions'];
                    //console.log(qs);
                    for(i in qs){
                        if(qs[i]['approved'] === "false"){
                            cdata.push(qs[i]);
                        }
                    }
                }
                fn({pqid: result[0]['_id'], data: cdata});
                //res.render('admin_apr2', {data:cdata});
                db.close();
            });
        });
    }else{
        //db auth not in use
    }
}

//For Approving Essay Past Question
module.exports.DeleteEssayPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqessactivities').updateMany({_id: parseInt(req.body.pqid)} ,{$pull: {questions: {_id: parseInt(req.body.id)}},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Deleted`);
                }
            })
        });
    }else{

    }
}

module.exports.ModifyEssayPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqessactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true", 'questions.$.question': req.body.que, 'questions.$.label': req.body.label},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Modified and Approved`);
                }
            })
        });
    }else{
    }
}

module.exports.ApproveEssayPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqessactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true"}, $inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqessactivities').updateMany({_id:parseInt(req.body.id)} ,{$set: {approved: "true"},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }
}

//For Approving MCQ Past Question
module.exports.DeleteMCQPQ = function(req, res){
    //console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqobjactivities').updateMany({_id: parseInt(req.body.pqid)} ,{$pull: {questions: {_id: parseInt(req.body.id)}},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Deleted`);
                }
            })
        });
    }else{

    }
}

module.exports.ModifyMCQPQ = function(req, res){
    //console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqobjactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true", 'questions.$.question': req.body.que, 'questions.$.option1': req.body.opt1, 'questions.$.option2': req.body.opt2, 'questions.$.option3': req.body.opt3, 'questions.$.option4': req.body.opt4, 'questions.$.option5': req.body.opt5, 'questions.$.answer1': req.body.ans1, 'questions.$.answer2': req.body.ans2, 'questions.$.answer3': req.body.ans3, 'questions.$.answer4': req.body.ans4, 'questions.$.answer5': req.body.ans5},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Modified and Approved`);
                }
            })
        });
    }else{
    }
}

module.exports.ApproveMCQPQ = function(req, res){
    //console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqobjactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true"}, $inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqobjactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true"}, $inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }
}

// For Approving SCQ Past Questions
module.exports.DeleteSCQPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqscqactivities').updateOne({_id: parseInt(req.body.pqid)} ,{$pull: {questions: {_id: parseInt(req.body.id)}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Deleted`);
                }
            })
        });
    }else{

    }
}

module.exports.ModifySCQPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqscqactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true", 'questions.$.question': req.body.que, 'questions.$.option1': req.body.opt1, 'questions.$.option2': req.body.opt2, 'questions.$.option3': req.body.opt3, 'questions.$.option4': req.body.opt4, 'questions.$.option5': req.body.opt5, 'questions.$.answer': req.body.ans},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Modified and Approved`);
                }
            })
        });
    }else{
    }
}

module.exports.ApproveSCQPQ = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqscqactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true"}, $inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('pqscqactivities').updateMany({_id:parseInt(req.body.pqid), 'questions._id': parseInt(req.body.id)} ,{$set: {'questions.$.approved': "true"}, $inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`Question ${req.body.id} Approved Successfully`);
                }
            })
        });
    }
}

module.exports.getPQUpdates = function(req, res){
    var mcq;
    var scq;
    var ess;
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqessactivities').find().toArray(function(err, result){
                ess= result;
                dbo.collection('pqobjactivities').find().toArray(function(err, result){
                    mcq = result;
                    dbo.collection('pqscqactivities').find().toArray(function(err, result){
                        scq = result;
                        db.close();
                        var data = {essay: ess, MCQ: mcq, SCQ: scq };
                        res.json(data)
                    });
                });
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqessactivities').find().toArray(function(err, result){
                ess = result;
                dbo.collection('pqobjactivities').find().toArray(function(err, result){
                    mcq = result;
                    dbo.collection('pqscqactivities').find().toArray(function(err, result){
                        scq = result;
                        db.close();
                        var data = {essay: ess, MCQ: mcq, SCQ: scq };
                        res.json(data)
                    });
                });
            });
        });
    }
}
module.exports.rEssay = function(req, res){
    getEssayPQTitle(function(e){
        res.render("registeress", {data: e});
    });
}

module.exports.addEssay = function(req, res){
    //console.log(req.body);
    essdoc.exists({name: req.body.pastq}, async function(err, result){
        if(result === false){
            console.log(`${req.body.pastq} Document not found`)
        }else{
            var c;
            const existingDoc = await essdoc.findOne({ name: req.body.pastq });
            if(existingDoc.owner === req.session.name){
                c = "true"
            }else{
                c = "false"
            }
            helper.nextPQID(req.body.pastq, 'essay', function(e){
                existingDoc.questions.push({
                    _id: e,
                    label: req.body.qlabel,
                    question: req.body.Question,
                    contributor: req.session.name,
                    approved: c,
                });
                existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                    if(err){
                        getEssayPQTitle(function(e){
                            res.render("registeress", {data: e, msg:`error Adding Essay Question ${req.body.qlabel} to ${req.body.pastq}`});
                        });
                    } else{
                      helper.nextPQVersion(req.body.pastq, 'essay');
                      getEssayPQTitle(function(e){
                        res.render("registeress", {data: e, msg:`${req.body.pastq} Updated with ${req.body.qlabel}`});
                      });
                    }
                })
            });
        };
    });
}
function getEssayPQTitle(fn){
    var b = [];
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqessactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqessactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }
}

async function addReqPQtoUser(owner, name, year, type){
    userdoc.exists({username: owner}, async function(err, result){
        if(result === false){
            console.log(`${name} Document not found`)
        }else{
            const existingDoc = await userdoc.findOne({ username: owner });
            existingDoc.pastq.push({
                name: name,
                type: type,
                year: year,
            });
            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                if(err){
                  console.log(`error saving subcourse ${name} to user account`);
                } else{
                  console.log(`${owner} Updated with ${name} Past question`);
                }
            })
        };
    });
    
}


module.exports.registerpq = async function(req, res){
    //console.log(req.body);
    var c;
    if(req.body.qtype == 'essay'){
        essdoc.exists({name : req.body.name, year : req.body.year}, async function(err, result){
            if(result === false){
                helper.nextID('essaypq', function(e){
                    var essDoc = new essdoc({
                        _id: e,
                        name : req.body.name,
                        year : req.body.year,
                        type : req.body.qtype,
                        owner : req.session.name,
                        qnum : 0,
                        version : 1, 
                    });
                    essDoc.save(async (err, essDoc) => {
                        if(err){
                            res.render('registerpq', {msg: `error saving ${req.body.name} ${req.body.year} ${req.body.qtype} past Question`});
                        } else{
                            await addReqPQtoUser(req.session.name, req.body.name, req.body.year, req.body.qtype);
                            res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                        }
                    });
                });
            }else{
                res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} past Question Already Exist`});
            }
        })
    }else if(req.body.qtype == 'mcq'){
        objdoc.exists({name : req.body.name, year : req.body.year}, async function(err, result){
            if(result === false){
                helper.nextID('mcqpq', function(e){
                    var objDoc = new objdoc({
                        _id: e,
                        name : req.body.name,
                        year : req.body.year,
                        type : req.body.qtype,
                        owner : req.session.name,
                        version : 1, 
                        qnum: 0,
                    });
                    objDoc.save(async (err, objDoc) => {  
                        if(err){
                            res.render('registerpq', {msg: `error saving ${req.body.name} ${req.body.year} ${req.body.qtype} past Question`});
                        } else{
                            await addReqPQtoUser(req.session.name, req.body.name, req.body.year, req.body.qtype);
                            res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                        }
                    });
                });
            }else{
                res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} past Question Already Exist`});
            }
        })
    }else if(req.body.qtype == 'scq'){
        scqdoc.exists({name : req.body.name, year : req.body.year}, async function(err, result){
            if(result === false){
                helper.nextID('scqpq', function(e){
                    var objDoc = new scqdoc({
                        _id: e,
                        name : req.body.name, 
                        year : req.body.year,
                        type : req.body.qtype,
                        owner : req.session.name,
                        version : 1,
                        qnum: 0,
                    });
                    objDoc.save(async (err, objDoc) => {  
                        if(err){
                            res.render('registerpq', {msg: `error saving ${req.body.name} ${req.body.year} ${req.body.qtype} past Question`});
                        } else{
                            await addReqPQtoUser(req.session.name, req.body.name, req.body.year, req.body.qtype);
                            res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                        }
                    });
                });
            }else{
                res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} past Question Already Exist`});
            }
        })
    }
}

module.exports.getSCQPQ = function(req, res, fn){
    var b = [];
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqscqactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                res.render('scqpq', {data: b})
                db.close();
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                res.render('scqpq', {data: b, notice:'get'})
                db.close();
            });
        });
    }
}

module.exports.getPQ = function(req, res, fn){
    var b = [];
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                res.render('objpq', {data: b})
                db.close();
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                res.render('objpq', {data: b})
                db.close();
            });
        });
    }
}

module.exports.addSCQPQ = function(req, res){
    if(req.body.pastq === 'Select Past Question'){
        getSCQPQTitle(function(b){
            res.render('scqpq', {data: b, notice:'post', msg: `PQ not selected`});
        })
    }else if(req.body.pastq === ''){
        getSCQPQTitle(function(b){
            res.render('scqpq', {data: b, notice:'post', msg: `PQ not selected`});
        })
    }else{
        try{
            let file = req.file;
            if (!req.file){
                //no picture
                scqdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        var c;
                        const existingDoc = await scqdoc.findOne({ name: req.body.pastq});
                        if(existingDoc.owner === req.session.name){
                            c = "true"
                        }else{
                            c = "false"
                        }
                        //get nextID
                        helper.nextPQID(req.body.pastq, 'scq', function(e){
                            existingDoc.questions.push({
                                _id: e,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer: req.body.ans,
                                picture: "No Picture",
                                contributor: req.session.name,
                                approved: c,
                            });
                            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                                if(err){
                                    getSCQPQTitle(function(b){
                                        res.render('scqpq', {data: b, notice:'post', msg: `Error Updating ${req.body.pastq} with Question ${e}`});
                                    })
                                } else{
                                  helper.nextPQVersion(req.body.pastq, 'scq');
                                  getSCQPQTitle(function(b){
                                        res.render('scqpq', {data: b, notice:'post', msg: `${req.body.pastq} Updated with Question ${e}`});
                                  })
                                }
                            })
                        });
                    };
                });
            }else{
                //file available
                scqdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        var c;
                        const existingDoc = await scqdoc.findOne({ name: req.body.pastq});
                        //get nextID
                        if(existingDoc.owner === req.session.name){
                            c = "true"
                        }else{
                            c = "false"
                        }
                        helper.getBase64Data(file.originalname, function(data){
                            helper.nextPQID(req.body.pastq, 'scq', function(e){
                                existingDoc.questions.push({
                                    _id: e,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer: req.body.ans,
                                    picture: data,
                                    contributor: req.session.name,
                                    approved: c,
                                });
                                existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                                    if(err){
                                        getSCQPQTitle(function(b){
                                            res.render('scqpq', {data: b, notice:'post', msg: `Error Updating ${req.body.pastq} with Question ${e}`});
                                        })
                                    } else{
                                      helper.nextPQVersion(req.body.pastq, 'scq');
                                      getSCQPQTitle(function(b){
                                            res.render('scqpq', {data: b, notice:'post', msg: `${req.body.pastq} Updated with Question ${e}`});
                                      })
                                    }
                                })
                            });
                        });
                    };
                });
            }
        }catch(e){
            getSCQPQTitle(function(b){
                res.render('scqpq', {data: b, notice:'post', msg: `Caught Error Updating ${req.body.pastq}`});
            })
        }
    }
    
}

function getSCQPQTitle(fn){
    var b = [];
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqscqactivities').find({$or :[{type : "mcq"}, {type : "scq"}]}).toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqscqactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }
}

module.exports.addPQ = function(req, res){
    if(req.body.pastq === 'Select Past Question'){
        getPQTitle(function(b){
            res.render('objpq', {data: b, msg:`PQ not selected`});
        })
    }else if(req.body.pastq === ''){
        getPQTitle(function(b){
            res.render('objpq', {data: b, msg:`PQ not selected`});
        })
    }else{
        try{
            let file = req.file;
            if (!req.file){
                //no picture
                objdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        var c;
                        const existingDoc = await objdoc.findOne({ name: req.body.pastq});
                        if(existingDoc.owner === req.session.name){
                            c = "true"
                        }else{
                            c = "false"
                        }
                        //get nextID
                        helper.nextPQID(req.body.pastq, 'mcq', function(e){
                            existingDoc.questions.push({
                                _id: e,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer1: req.body.ans1,
                                answer2: req.body.ans2,
                                answer3: req.body.ans3,
                                answer4: req.body.ans4,
                                answer5: req.body.ans5,
                                picture: "No Picture",
                                contributor: req.session.name,
                                approved: c,
                            });
                            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                                if(err){
                                    getPQTitle(function(b){
                                        res.render('objpq', {data: b, msg:`Error Updating ${req.body.pastq} with Question ${e}`});
                                    })
                                } else{
                                    helper.nextPQVersion(req.body.pastq, 'mcq');
                                    getPQTitle(function(b){
                                        res.render('objpq', {data: b, msg:`${req.body.pastq} Updated with Question ${e}`});
                                    })
                                }
                            })
                        });
                    };
                });
            }else{
                //file available
                objdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        var c;
                        const existingDoc = await objdoc.findOne({ name: req.body.pastq});
                        //get nextID
                        if(existingDoc.owner === req.session.name){
                            c = "true"
                        }else{
                            c = "false"
                        }
                        helper.getBase64Data(file.originalname, function(data){
                            helper.nextPQID(req.body.pastq, 'mcq', function(e){
                                existingDoc.questions.push({
                                    _id: e,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer1: req.body.ans1,
                                    answer2: req.body.ans2,
                                    answer3: req.body.ans3,
                                    answer4: req.body.ans4,
                                    answer5: req.body.ans5,
                                    picture: data,
                                    contributor: req.session.name,
                                    approved: c,
                                });
                                existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                                    if(err){
                                        getPQTitle(function(b){
                                            res.render('objpq', {data: b, msg:`Error Updating ${req.body.pastq} with Question ${e}`});
                                        })
                                    } else{
                                        helper.nextPQVersion(req.body.pastq, 'mcq');
                                        getPQTitle(function(b){
                                            res.render('objpq', {data: b, msg:`${req.body.pastq} Updated with Question ${e}`});
                                        })
                                    }
                                })
                            });
                            
                        });
                    };
                });
            }
        }catch(e){
            getSCQPQTitle(function(b){
                res.render('objpq', {data: b, msg: `Caught Error Updating ${req.body.pastq}`});
            })
        }
    }
}

function getPQTitle(fn){
    var b = [];
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find({$or :[{type : "mcq"}, {type : "scq"}]}).toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }else{
        //no authentication
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('pqobjactivities').find().toArray(function(err, result){
                if (err) throw err;
                if(result.length > 0){
                    for(i in result){
                        b.push(result[i]['name']);
                    }
                }
                fn(b);
                db.close();
            });
        });
    }
}


module.exports.saveQuestion = async function(req, res){
    //console.log(req.body);
    try{
        if (dbauth === 'true'){
            let file = req.file;
            //console.log(file.originalname);
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection(req.body.course);
                if(!req.file) { //if file parameter is not in request
                    var cx;
                    helper.nextID(req.body.course, function(e){
                        if(req.session.role === 'Admin' || req.session.role === 'SuperAdmin'){
                            cx = e;
                            collection.insertOne({
                                _id: cx,
                                course: req.body.course,
                                subCourse: req.body.subCourse,
                                topic: req.body.topic,
                                questionType: req.body.qType,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer1: req.body.ans1,
                                answer2: req.body.ans2,
                                answer3: req.body.ans3,
                                answer4: req.body.ans4,
                                answer5: req.body.ans5,
                                picture: "No Picture",
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'true',
                                approvedBy: req.session.name,
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err){
                                    db.close();
                                    res.render('Questions', {data:'Error saving Question'});
                                }
                                if(result.result.n = 1){
                                    dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1, qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                        helper.level(req.session.name);
                                        db.close(); //close database connection
                                        res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                    })
                                }
            
                            })
                        }else{ // if not admin
                            cx = e;
                            collection.insertOne({
                                _id: cx,
                                course: req.body.course,
                                subCourse: req.body.subCourse,
                                topic: req.body.topic,
                                questionType: req.body.qType,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer1: req.body.ans1,
                                answer2: req.body.ans2,
                                answer3: req.body.ans3,
                                answer4: req.body.ans4,
                                answer5: req.body.ans5,
                                picture: "No Picture",
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'false',
                                approvedBy: 'None',
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err){
                                    db.close();
                                    res.render('Questions', {data:'Error saving Question'});
                                }
                                if(result.result.n = 1){
                                    dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                    
                                        db.close(); //close database connection
                                        res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                    })
                                }
            
                            })
                        }
                        
                    });
                } else {
                    helper.getBase64Data(file.originalname, function(data){
                        //data is base64 string of image uploaded
                        //var dt = data;
                        var cx;
                        helper.nextID(req.body.course, function(e){
                            cx = e;
                            if(req.session.role === 'Admin' || req.session.role === 'SuperAdmin'){
                                collection.insertOne({
                                    _id: cx,
                                    course: req.body.course,
                                    subCourse: req.body.subCourse,
                                    topic: req.body.topic,
                                    questionType: req.body.qType,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer1: req.body.ans1,
                                    answer2: req.body.ans2,
                                    answer3: req.body.ans3,
                                    answer4: req.body.ans4,
                                    answer5: req.body.ans5,
                                    picture: data,
                                    category: 'General',
                                    difficulty: 0,
                                    contributor: req.session.name,
                                    approved: 'true',
                                    approvedBy: req.session.name,
                                    version: 1,
                                    isDuplicate: 'No'
                                },function(err, result){
                                    if (err){
                                        db.close();
                                        helper.deleteFile(file.originalname);
                                        res.render('Questions', {data:'Error saving Question'});
                                    }
                                    if(result.result.n = 1){
                                        dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1, qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                            helper.level(req.session.name);
                                            helper.deleteFile(file.originalname);
                                            db.close(); //close database connection
                                            res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                        })
                                    }
                                })
                            }else{ //if not admin
                                collection.insertOne({
                                    _id: cx,
                                    course: req.body.course,
                                    subCourse: req.body.subCourse,
                                    topic: req.body.topic,
                                    questionType: req.body.qType,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer1: req.body.ans1,
                                    answer2: req.body.ans2,
                                    answer3: req.body.ans3,
                                    answer4: req.body.ans4,
                                    answer5: req.body.ans5,
                                    picture: data,
                                    category: 'General',
                                    difficulty: 0,
                                    contributor: req.session.name,
                                    approved: 'false',
                                    approvedBy: 'None',
                                    version: 1,
                                    isDuplicate: 'No'
                                },function(err, result){
                                    if (err){
                                        db.close();
                                        helper.deleteFile(file.originalname);
                                        res.render('Questions', {data:'Error saving Question'});
                                    }
                                    if(result.result.n = 1){
                                        dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                            helper.deleteFile(file.originalname);
                                            db.close(); //close database connection
                                            res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                        })
                                    }
                                })
                            }
                            
                        });
                    })
                }
            });
        }else{ // no authentication
            let file = req.file;
            //console.log(file.originalname);
            MongoClient.connect(dbURI, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection(req.body.course);
                if(!req.file) { //if file parameter is not in request
                    var cx;
                    helper.nextID(req.body.course, function(e){
                        if(req.session.role === 'Admin' || req.session.role === 'SuperAdmin'){
                            cx = e;
                            collection.insertOne({
                                _id: cx,
                                course: req.body.course,
                                subCourse: req.body.subCourse,
                                topic: req.body.topic,
                                questionType: req.body.qType,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer1: req.body.ans1,
                                answer2: req.body.ans2,
                                answer3: req.body.ans3,
                                answer4: req.body.ans4,
                                answer5: req.body.ans5,
                                picture: "No Picture",
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'true',
                                approvedBy: req.session.name,
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err){
                                    db.close();
                                    res.render('Questions', {data:'Error saving Question'});
                                }
                                if(result.result.n = 1){
                                    dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1, qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                        helper.level(req.session.name);
                                        db.close(); //close database connection
                                        res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                    })
                                }
            
                            })
                        }else{ // if not admin
                            cx = e;
                            collection.insertOne({
                                _id: cx,
                                course: req.body.course,
                                subCourse: req.body.subCourse,
                                topic: req.body.topic,
                                questionType: req.body.qType,
                                question: req.body.Question,
                                option1: req.body.opt1,
                                option2: req.body.opt2,
                                option3: req.body.opt3,
                                option4: req.body.opt4,
                                option5: req.body.opt5,
                                answer1: req.body.ans1,
                                answer2: req.body.ans2,
                                answer3: req.body.ans3,
                                answer4: req.body.ans4,
                                answer5: req.body.ans5,
                                picture: "No Picture",
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'false',
                                approvedBy: 'None',
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err){
                                    db.close();
                                    res.render('Questions', {data:'Error saving Question'});
                                }
                                if(result.result.n = 1){
                                    dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                        
                                        db.close(); //close database connection
                                        res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                    })
                                }
            
                            })
                        }
                        
                    });
                } else {
                    helper.getBase64Data(file.originalname, function(data){
                        //data is base64 string of image uploaded
                        //var dt = data;
                        var cx;
                        helper.nextID(req.body.course, function(e){
                            cx = e;
                            if(req.session.role === 'Admin' || req.session.role === 'SuperAdmin'){
                                collection.insertOne({
                                    _id: cx,
                                    course: req.body.course,
                                    subCourse: req.body.subCourse,
                                    topic: req.body.topic,
                                    questionType: req.body.qType,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer1: req.body.ans1,
                                    answer2: req.body.ans2,
                                    answer3: req.body.ans3,
                                    answer4: req.body.ans4,
                                    answer5: req.body.ans5,
                                    picture: data,
                                    category: 'General',
                                    difficulty: 0,
                                    contributor: req.session.name,
                                    approved: 'true',
                                    approvedBy: req.session.name,
                                    version: 1,
                                    isDuplicate: 'No'
                                },function(err, result){
                                    if (err){
                                        db.close();
                                        helper.deleteFile(file.originalname);
                                        res.render('Questions', {data:'Error saving Question'});
                                    }
                                    if(result.result.n = 1){
                                        dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1, qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                            helper.level(req.session.name);
                                            helper.deleteFile(file.originalname);
                                            db.close(); //close database connection
                                            res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                        })
                                    }
                                })
                            }else{ //if not admin
                                collection.insertOne({
                                    _id: cx,
                                    course: req.body.course,
                                    subCourse: req.body.subCourse,
                                    topic: req.body.topic,
                                    questionType: req.body.qType,
                                    question: req.body.Question,
                                    option1: req.body.opt1,
                                    option2: req.body.opt2,
                                    option3: req.body.opt3,
                                    option4: req.body.opt4,
                                    option5: req.body.opt5,
                                    answer1: req.body.ans1,
                                    answer2: req.body.ans2,
                                    answer3: req.body.ans3,
                                    answer4: req.body.ans4,
                                    answer5: req.body.ans5,
                                    picture: data,
                                    category: 'General',
                                    difficulty: 0,
                                    contributor: req.session.name,
                                    approved: 'false',
                                    approvedBy: 'None',
                                    version: 1,
                                    isDuplicate: 'No'
                                },function(err, result){
                                    if (err){
                                        db.close();
                                        helper.deleteFile(file.originalname);
                                        res.render('Questions', {data:'Error saving Question'});
                                    }
                                    if(result.result.n = 1){
                                        dbo.collection('users').updateOne({username:(req.session.name).toUpperCase()} ,{$inc: {noOfQ:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                            helper.deleteFile(file.originalname);
                                            db.close(); //close database connection
                                            res.render('Questions', {data:`Question ${cx} saved Successfully`});
                                        })
                                    }
                                })
                            }
                            
                        });
                    })
                }
            });
        }
    }catch(e){

    }
}

module.exports.Delete = function(req, res){
    //console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(req.body.course).find({_id:parseInt(req.body.id)}).toArray(function(err, result){
                if(result.length == 0){
                    db.close();
                    res.send(`Question ${req.body.id} Deleted already`);
                }else{
                    dbo.collection(req.body.course).deleteOne({_id:parseInt(req.body.id)}, function(err, result){ //make an array of all data in cpcactivities 
                        if (err) throw err; //if there is an error, throw it
                        if(result.result.n === 1){
                            db.close();
                            res.send(`Question ${req.body.id} Deleted`);
                        }
                    })
                }
            })
        });
    }else{
    }
}

module.exports.Modify = function(req, res){
    //console.log(req.body);
    var c;
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(req.body.course).find({_id:parseInt(req.body.id)}).toArray(function(err, result){
                c = result[0]['contributor'];
                if(result[0]['approved'] === 'true'){
                    dbo.collection(req.body.course).updateMany({_id:parseInt(req.body.id)} ,{$set: {question: req.body.que, option1: req.body.opt1, option2: req.body.opt2, option3: req.body.opt3, option4: req.body.opt4, option5: req.body.opt5, answer1: req.body.ans1, answer2: req.body.ans2, answer3: req.body.ans3, answer4: req.body.ans4, answer5: req.body.ans5},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                        if (err) throw err; //if there is an error, throw it
                        if(result.result.n === 1){
                            db.close();
                            res.send(`Question ${req.body.id} Modified`);
                        }
                    })
                }else{
                    dbo.collection(req.body.course).updateMany({_id:parseInt(req.body.id)} ,{$set: {approved: "true", approvedBy: req.session.name, question: req.body.que, option1: req.body.opt1, option2: req.body.opt2, option3: req.body.opt3, option4: req.body.opt4, option5: req.body.opt5, answer1: req.body.ans1, answer2: req.body.ans2, answer3: req.body.ans3, answer4: req.body.ans4, answer5: req.body.ans5},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                        if (err) throw err; //if there is an error, throw it
                        if(result.result.n === 1){
                            dbo.collection('users').updateOne({username: c.toUpperCase()} ,{$inc: {qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                db.close(); //close database connection
                                helper.level(c);
                                res.send(`Question ${req.body.id} Modified and Approved`);
                            })
                        }
                    })
                }
            });
        });
    }else{
    }
}

module.exports.Approve = function(req, res){
    //console.log(req.body);
    var c;
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(req.body.course).find({_id:parseInt(req.body.id)}).toArray(function(err, result){
                //console.log(result);
                c = result[0]['contributor'];
                if(result[0]['approved'] === 'true'){
                    db.close();
                    console.log(`Question ${req.body.id} has been Approved already`);
                    res.send(`Question ${req.body.id} has been Approved already`);
                }else{
                    dbo.collection(req.body.course).updateMany({_id:parseInt(req.body.id)} ,{$set: {approved: "true", approvedBy: req.session.name},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                        if (err) throw err; //if there is an error, throw it
                        if(result.result.n === 1){
                            dbo.collection('users').updateOne({username: c.toUpperCase()} ,{$inc: {qApproved:1}}, function(err, result){ //make an array of all data in cpcactivities 
                                db.close(); //close database connection
                                helper.level(c);
                                res.send(`Question ${req.body.id} Approved Successfully`);
                            })
                            
                        }
                    })
                }
            });
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(req.body.course).updateMany({_id:parseInt(req.body.id)} ,{$set: {approved: "true"},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    console.log(`${req.body.id} Approved`);
                }
                res.send('')
                db.close(); //close database connection
            })
        });
    }
}

module.exports.qforApproval = function(req, res){
    //console.log(req.body);
    var cdata = [];
    try{
        if(req.body.noOfQ === ''){
            console.log("no question number")
        }else{
            if (dbauth === 'true'){
                MongoClient.connect(dbURIAuth, function(err, db) {
                    var dbo = db.db(dbname); // use dbname from Zconfig file 
                    dbo.collection(req.body.course).find({approved: 'false', subCourse:req.body.subcourse, topic:req.body.topic}).toArray(function(err, result){
                        if (err) throw err;
                        if(result.length === 0){
                            console.log("not found")
                        }else{
                            if(parseInt(req.body.noOfQ) > result.length){
                                for(i=0; i < result.length; i++){
                                    cdata.push(result[i]);
                                }
                            }else{
                                for(i=0; i < parseInt(req.body.noOfQ); i++){
                                    cdata.push(result[i]);
                                }
                            }
                        }
                        res.render('admin_apr2', {data:cdata});
                        db.close();
                    });
                    
                });
            }else{
                //db auth not in use
                MongoClient.connect(dbURI, function(err, db) {
                    var dbo = db.db(dbname); // use dbname from Zconfig file 
                    dbo.collection(req.body.course).find({approved: 'false', subCourse:req.body.subcourse, topic:req.body.topic}).toArray(function(err, result){
                        if (err) throw err;
                        if(result.length === 0){
                            console.log("not found")
                        }else{
                            if(parseInt(req.body.noOfQ) > result.length){
                                for(i=0; i < result.length; i++){
                                    cdata.push(result[i]);
                                }
                            }else{
                                for(i=0; i < parseInt(req.body.noOfQ); i++){
                                    cdata.push(result[i]);
                                }
                            }
                        }
                        res.render('admin_apr2', {data:cdata});
                        db.close();
                    });
                    
                });
            }
        }
    }catch(e){
        console.log(e);
    }
}

module.exports.getAllQuestions = function(req, res){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection(req.query.course).find({approved:"true"}).toArray(function(err, result){
                if (err) throw err;
                res.json({data:result});
                db.close();
            });
            
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection(req.query.course).find({approved:"true"}).toArray(function(err, result){
                if (err) throw err;
                res.json({data:result});
                db.close();
            });
            
        });
    }
}