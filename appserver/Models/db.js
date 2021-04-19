var mongoose = require( 'mongoose' );
require('./coursesSchema');
require('./Test');
require('./Users');
require('./pqessSchema');
require('./pqobjSchema');
var reg = require("../Controller/Register");
var Zconfig = require("../../qconfig.json");
var mongourl = Zconfig['mongourl'];
var mongoport = Zconfig['mongoport'];
var dbname = Zconfig['dbname'];
var dbauth = Zconfig['useDbAuth'];
var dbuser = Zconfig['dbUser'];
var dbpwd = Zconfig['dbPassword'];
var authSource = Zconfig['authSource'];
var conn;
let coursesdoc = require("./coursesSchema")
var MongoClient = require('mongodb').MongoClient;
var dbURIAuth1 = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 

var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${mongourl}:${mongoport}/${dbname}?authSource=${authSource}&compressors=zlib`; //with authentication

var ls =["scqpq", "mcqpq", "essaypq"];
var allCourses = [
    ["pth", "Pathology", "Not Selected", "MCQ"],
    ["phm", "Pharmacology", "Not Selected", "SCQ"],
    ["mdc", "Medicine", "Not Selected", "SCQ"],
    ["sgy", "Surgery", "Not Selected", "MCQ"]]

if (dbauth === 'true'){
    //mongoose.connect(`mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}`,{auth:{authdb:"admin"}, useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connect(dbURIAuth, {
        auth:{authdb: authSource},
        useNewUrlParser: true,
        useUnifiedTopology: true,
        user: dbuser,
        pass: dbpwd
    }).then(() => {
        console.log('Authentication successful');
        conn = mongoose.createConnection(dbURIAuth1);
        conn.on('open', function(){
            conn.db.listCollections({name: 'coursesactivities'})
            .next(async function(err, collinfo) {
                if(err){
                    console.log("error Connecting to database")
                } 
                if (collinfo) { 
                    console.log("Collections exist");
                }else{
                    
                    await conn.db.createCollection('users',{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                    await conn.db.createCollection('pqscqactivities',{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                    try{
                        conn.db.createCollection('counters',{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                    }catch(e){

                    }
                    await addCounter('user');
                    for(i in allCourses){
                        var courseDoc = new coursesdoc({ 
                            title : allCourses[i][1],
                            name : allCourses[i][0],
                            selected: allCourses[i][2],
                            type : allCourses[i][3]
                        });
                        conn.db.createCollection(allCourses[i][0],{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                        courseDoc.save((err, courseDoc) => {  
                            if(err){
                            console.log(`error Creating ${allCourses[i][0]} DB`);
                            } else{
                            console.log(`${allCourses[i][0]} created Successfully`);
                            }
                        });
                        addCounter(allCourses[i][0]);
                    }
                    reg.createAdmin();
                    for(i in ls){
                        addCounter(ls[i]);
                    }
                }
            });
        });
    }).catch(err => {
        console.log('Authentication Failed');
        //process.exit();
    });
}else{
    mongoose.connect(dbURI).then(()=> {
        conn = mongoose.createConnection(dbURIAuth);
        conn.on('open', function(){
            conn.db.listCollections({name: 'coursesactivities'})
            .next(async function(err, collinfo) {
                if(err){
                    console.log("error Connecting to database")
                } 
                if (collinfo) {
                    console.log("Collections exist");
                }else{
                   await conn.db.createCollection('users',{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                   try{
                        conn.db.createCollection('counters',{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                    }catch(e){

                    }
                   await addCounter('user');
                    for(i in allCourses){
                        var courseDoc = new coursesdoc({ 
                            title : allCourses[i][1],
                            name : allCourses[i][0],
                            selected: allCourses[i][2] 
                            });
                            conn.db.createCollection(allCourses[i][0],{storageEngine: {wiredTiger: {configString: 'block_compressor=zlib'}}});
                            courseDoc.save((err, courseDoc) => {  
                              if(err){
                                console.log(`error Creating ${allCourses[i][0]} DB`);
                              } else{
                                console.log(`${allCourses[i][0]} created Successfully`);
                                }
                            }
                        );
                        addCounter(allCourses[i][0]);
                    }  
                    reg.createAdmin();
                    for(i in ls){
                        addCounter(ls[i]);
                    }
                }
            });
        });
    });
}
 
var readLine = require ("readline");
if (process.platform === "win32"){
    var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
    });
    rl.on ("SIGINT", function (){
    process.emit ("SIGINT");
    });
}

mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to database');
});
mongoose.connection.on('error',function (err) {
    console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

var gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
    console.log('Mongoose disconnected through ' + msg);
    callback();
    });
};

process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
    process.kill(process.pid, 'SIGUSR2');
    });
});
process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
    process.exit(0);
    });
});
process.on('SIGTERM', function() {
    gracefulShutdown('app shutdown', function () {
    process.exit(0);
    });
});

function addCounter(id){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('counters').insertOne({"_id":id, "sequence_value":0}, function(err, result){
                db.close();
            })
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            dbo.collection('counters').insertOne({"_id":id, "sequence_value":0}, function(err, result){
                db.close();
            })
        });
    }
    
}