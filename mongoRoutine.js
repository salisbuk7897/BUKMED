var mongoose = require( 'mongoose' );
//const { db } = require("./appserver/Models/coursesSchema");
let coursesdoc = require("./appserver/Models/coursesSchema")
let testdoc = require("./appserver/Models/Test")
var Zconfig = require("./qconfig.json");
var mongourl = Zconfig['mongourl'];
var mongoport = Zconfig['mongoport'];
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var authSource = Zconfig['authSource'];
var conn;
var MongoClient = require('mongodb').MongoClient;
var q = require('./appserver/Controller/question')

var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 


async function createCoursesDB(cname, subc, fn){
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


async function delSC(cname, subc, fn){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('coursesactivities').updateOne({name:cname} ,{$pull: {subCourses: {subCourse: subc}}}, function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
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
                if(result.result.n === 1){
                    fn(`${subc} deleted`);
                }
                db.close(); //close database connection
            })
        });   
    }
}

async function delTopic(cname, tp, fn){
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

/*delTopic("ana", "Stomach", function(e){
    console.log(e);
});*/

function test(){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file 
        dbo.collection('ana').find({approved: 'false'}).toArray(function(err, result){
            console.log(result);
            if(result.length === 0){
                console.log("not found")
            }else{
                console.log(result);
            }
        });
        
    });
}

ts();

function ts(){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file 
        dbo.collection('pqobjactivities').find().toArray(function(err, result){
            if (err) throw err;
            if(result.length > 0){
                for(i in result){
                    console.log(result[i]['name']);
                }
            }
            db.close();
        });
        
    });
}