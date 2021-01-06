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

module.exports.registerpq = function(req, res){
    //console.log(req.body);
    var objDoc = new objdoc({
        name : req.body.name,
        year : req.body.year,
        type : req.body.qtype,
        owner : 'Admin',
        version : 1, 
        });
        objDoc.save((err, objDoc) => {  
          if(err){
            console.log(`error saving ${req.body.name} past Question`);
          } else{
            console.log(`${req.body.name} saved Successfully`);
            }
        }
    );
    res.end();
}

module.exports.getPQ = function(req, res, fn){
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

module.exports.addPQ = function(req, res){
    if(req.body.pastq === 'Select Past Question'){
        console.log("PQ not selected");
    }else if(req.body.pastq === ''){
        console.log("PQ not selected");
    }else{
        try{
            let file = req.file;
            if (!req.file){
                //no picture
                objdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        const existingDoc = await objdoc.findOne({ name: req.body.pastq});
                        //get nextID
                        existingDoc.questions.push({
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
                            contributor: "Admin",
                            approved: 'false',
                        });
                        existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                            if(err){
                              console.log(`error saving ${req.body.pastq}`);
                            } else{
                              console.log(`${req.body.pastq} Updated`);
                            }
                        })
                    };
                });

            }else{
                //file available
                objdoc.exists({name: req.body.pastq}, async function(err, result){
                    if(result === false){
                        console.log(`${req.body.pastq} Document not found`)
                    }else{
                        const existingDoc = await objdoc.findOne({ name: req.body.pastq});
                        //get nextID
                        helper.getBase64Data(file.originalname, function(data){
                            existingDoc.questions.push({
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
                                contributor: "Admin",
                                approved: 'false',
                            });
                            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                                if(err){
                                  console.log(`error saving ${req.body.pastq}`);
                                } else{
                                  console.log(`${req.body.pastq} Updated`);
                                }
                            })
                        });
                    };
                });
            }

        }catch(e){
            console.log(e);
            res.end();
        }
    }
    //console.log(req.body);
    getPQTitle(function(b){
        res.render('objpq', {data: b});
    })
    
    
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
                    helper.nextID('user', function(e){
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
                            version: 1,
                            isDuplicate: 'No'
                        },function(err, result){
                            if (err) throw err;
                            if(result.result.n = 1){
                                console.log("User added Successfully");
                            }
        
                        })
                        db.close();
                        res.render('index');
                    });
                } else {
                    helper.getBase64Data(file.originalname, function(data){
                        //data is base64 string of image uploaded
                        //var dt = data;
                        var cx;
                        helper.nextID(req.body.course, function(e){
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
                                picture: data,
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'false',
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err) throw err;
                                if(result.result.n = 1){
                                    console.log("question added Successfully");
                                }
            
                            })
                            db.close();
                            helper.deleteFile(file.originalname);
                            res.render('Questions');
                        });
                    })
                }
            });
        }else{ // no authentication
            let file = req.file;
            MongoClient.connect(dbURI, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection(req.body.course);
                if(!req.file) { //if file parameter is not in request
                    var cx;
                    helper.nextID(req.body.course, function(e){
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
                            version: 1,
                            isDuplicate: 'No'
                        },function(err, result){
                            if (err) throw err;
                            if(result.result.n = 1){
                                console.log("question added Successfully");
                            }
        
                        })
                        db.close();
                        res.render('Questions');
                    });
                } else {
                    helper.getBase64Data(file.originalname, function(data){
                        //data is base64 string of image uploaded
                        //var dt = data;
                        var cx;
                        helper.nextID(req.body.course, function(e){
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
                                picture: data,
                                category: 'General',
                                difficulty: 0,
                                contributor: req.session.name,
                                approved: 'false',
                                version: 1,
                                isDuplicate: 'No'
                            },function(err, result){
                                if (err) throw err;
                                if(result.result.n = 1){
                                    console.log("question added Successfully");
                                }
            
                            })
                            db.close();
                            helper.deleteFile(file.originalname);
                            res.render('Questions');
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
            dbo.collection(req.body.course).deleteOne({_id:parseInt(req.body.id)}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    console.log(`${req.body.id} Deleted`);
                }
                res.send('')
                db.close(); //close database connection
            })
        });
    }else{
    }
}

module.exports.Modify = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection(req.body.course).updateMany({_id:parseInt(req.body.id)} ,{$set: {approved: "true", question: req.body.que, option1: req.body.opt1, option2: req.body.opt2, option3: req.body.opt3, option4: req.body.opt4, option5: req.body.opt5, answer1: req.body.ans1, answer2: req.body.ans2, answer3: req.body.ans3, answer4: req.body.ans4, answer5: req.body.ans5},$inc:{version:1}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    console.log(`${req.body.id} Modified and Approved`);
                }
                res.send('')
                db.close(); //close database connection
            })
        });
    }else{
    }
}

module.exports.Approve = function(req, res){
    //console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
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