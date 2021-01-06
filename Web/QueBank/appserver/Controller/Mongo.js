var mongoose = require( 'mongoose' );
var Zconfig = require("../../qconfig.json");
var mongourl = Zconfig['mongourl'];
var mongoport = Zconfig['mongoport'];
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var authSource = Zconfig['authSource'];
var conn;
let coursesdoc = require("../Models/coursesSchema");
var MongoClient = require('mongodb').MongoClient;
var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 

module.exports.addSubCourse = async function(title, sc){
    var c = (sc.split(',')).length;
    var d = sc.split(',');
    if(sc === '' && title === ''){
        console.log("No Course and subcourse entered");
    }else if(sc === ''){
        console.log("No subcourse entered");
    }else{
        if(c > 1){
            for (i in d){
                await saveSC(title, d[i]);
            }
        } else{
            await saveSC(title, sc)
        };
    };
}

module.exports.delTopic = async function(cname, tp, fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            /*dbo.collection('coursesactivities').find({name:cname}, {'subCourses.subCourse': {subc}}).toArray(function(err, result){
                fn(result)
            })*/
            dbo.collection('coursesactivities').updateOne({name:cname} ,{$pull: {'subCourses.0.topics': {topic: tp}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    fn(`${tp} deleted`);
                }
                //fn(result)
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').updateOne({name:cname} ,{$pull: {'subCourses.0.topics': {topic: tp}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    fn(`${tp} deleted`);
                }
                db.close(); //close database connection
            })
        });   
    }
}

module.exports.delSC = async function(cname, subc, fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').updateOne({name:cname} ,{$pull: {subCourses: {subCourse: subc}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.ok === 1){
                    fn(`${subc} deleted`);
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').updateOne({name:cname} ,{$pull: {subCourses: {subCourse: subc}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.ok === 1){
                    fn(`${subc} deleted`);
                }
                db.close(); //close database connection
            })
        });   
    }
}

module.exports.getSC = async function(cname, fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').find({name: cname}).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{
                    var b = []
                    var d = (result[0].subCourses).length;
                    var c = result[0].subCourses
                    for(i in c){
                        b.push(result[0].subCourses[i].subCourse.trim());
                    }
                    fn(b); // return the array of all data in cpcactivities

                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').find({name: cname}).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{
                    var b = []
                    var d = (result[0].subCourses).length;
                    var c = result[0].subCourses
                    for(i in c){
                        b.push(result[0].subCourses[i].subCourse.trim());
                    }
                    fn(b);
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}

module.exports.getTopics = async function(cname, subc, fn){
    console.log(`name: ${cname}, sub: ${subc}`);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').find({name: cname}).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{
                    
                    var b = []
                    var d = (result[0].subCourses).length;
                    var c = result[0].subCourses
                    //console.log(result);
                    for(i in c){
                        
                        if(result[0].subCourses[i].subCourse === subc){
                            var e = result[0].subCourses[i].topics
                            for (j in e){
                                b.push(result[0].subCourses[i].topics[j].topic);
                            }
                            fn(b);
                            break;
                        }
                    }
                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            });
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').find({name: cname}).toArray(function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                try{
                    var b = []
                    var d = (result[0].subCourses).length;
                    var c = result[0].subCourses
                    for(i in c){
                        if(result[0].subCourses[i].subCourse === subc){
                            var e = result[0].subCourses[i].topics
                            for (j in e){
                                b.push(result[0].subCourses[i].topics[j].topic);
                            }
                            fn(b);
                            break;
                        }
                    }

                }catch(err){ 
                    fn({}) // retuen emptry object
                }
                db.close(); //close database connection
            })
        });   
    }
}

async function saveSC(title, scs){
    coursesdoc.exists({name: title}, async function(err, result){
        if(result === false){
            console.log(`${title} Document not found`)
        }else{
            const existingDoc = await coursesdoc.findOne({ name: title });
            existingDoc.subCourses.push({
                subCourse: scs.trim()
            });
            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                if(err){
                  console.log(`error saving subcourse ${scs}`);
                } else{
                  console.log(`${title} Updated with ${scs}`);
                }
            })
        };
    });
}

async function saveTopic(title, scs, topic){
    coursesdoc.exists({name: title}, async function(err, result){
        if(result === false){
            console.log(`${title} Document not found`)
        }else{
            const existingDoc = await coursesdoc.findOne({ name: title });
            //console.log(existingDoc.subCourses)
            for(i in existingDoc.subCourses){
                if (existingDoc.subCourses[i].subCourse === scs){
                    console.log("found it");
                    existingDoc.subCourses[i].topics.push({
                        topic: topic.trim()
                    });
                    existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                        if(err){
                          console.log(`error saving topic ${topic}`);
                        } else{
                          console.log(`${scs} Updated with ${topic}`);
                        }
                    });
                    break;
                };
            };
            /**/
        };
    });
}

module.exports.addTopic = async function(title, sc, topic){
    var c = (topic.split(',')).length;
    var d = topic.split(',');
    if(sc === '' && title === '' && topic===''){
        console.log("No Course, subcourse and topic entered");
    }else if(sc === '' && topic === ''){
        console.log("No subcourse and topic entered");
    }else if(topic === ''){
        console.log("No topic entered");
    }else{
        if(c > 1){
            for (i in d){
                await saveTopic(title, sc, d[i]);
            }
        } else{
            await saveTopic(title, sc, topic);
        };
        
    };
}