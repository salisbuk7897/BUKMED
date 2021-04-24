var Zconfig = require("../../qconfig.json");
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

module.exports.level = function(name){
    var lvls = [10, 30, 80, 150, 300, 500, 800, 1200, 1500, 2000, 2800, 3700, 5000, 7000]
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); 
        dbo.collection('users').find({username: name.toUpperCase()}).toArray(function(err, result){
            for(i in lvls){
                if(result[0]['qApproved'] === lvls[i]){
                    dbo.collection('users').updateOne({username: name.toUpperCase()} ,{$inc: {clevel:1}}, function(err, result){ //make an array of all data in cpcactivities 
                        db.close(); //close database connection
                    })
                    break;
                }else if(result[0]['qApproved'] < lvls[i]){
                    break;
                }
            }
        });
    });
}

async function getnum(sq, fn){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file 
        var sd = dbo.collection('counters').updateOne({_id: sq},{$inc:{sequence_value:1}});
        var b ;
        dbo.collection('counters').find({_id: sq}).toArray(function(err, result){
            console.log(result);
            b = parseInt(result[0].sequence_value);
            if(b == 0){
                b = b + 1;
            }
            //console.log(`sd:  ${b}`);
            db.close();
            fn(b);
        });
         
    });
}

module.exports.getIDNum = async function(sq, fn){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file 
        var b ;
        dbo.collection('counters').find({_id: sq}).toArray(function(err, result){
            console.log(result);
            b = parseInt(result[0].sequence_value);
            //console.log(`sd:  ${b}`);
            db.close();
            fn(b);
        });
         
    });
}

module.exports.updnum = async function(sq, num){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file 
        var sd = dbo.collection('counters').updateOne({_id: sq},{$inc:{sequence_value:num}});
        var b ;
        dbo.collection('counters').find({_id: sq}).toArray(function(err, result){
            console.log(` upd ${result}`);
            //fn(b);
        });
         
    });
}

module.exports.nextID = async function(sq, fn){
    if (dbauth === 'true'){
        await getnum(sq, function(e){
            fn(e);
        })
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            var sd = dbo.collection('counters').updateOne({_id: sq},{$inc:{sequence_value:1}});
            var b ;
            dbo.collection('counters').find({_id: sq}).toArray(function(err, result){
                console.log(result);
                b = parseInt(result[0].sequence_value);
                //console.log(`sd:  ${b}`);
                db.close();
                fn(b);
            });
            
        });

    }
    
}

module.exports.nextPQID = async function(sq, tp, fn){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var b ;
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            if(tp === 'scq'){
                var sd = dbo.collection('pqscqactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqscqactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }else if(tp === "mcq"){
                var sd = dbo.collection('pqobjactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqobjactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }else if(tp === "essay"){
                var sd = dbo.collection('pqessactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqessactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var b ;
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            if(tp === 'scq'){
                var sd = dbo.collection('pqscqactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqscqactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }else if(tp === "mcq"){
                var sd = dbo.collection('pqobjactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqobjactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }else if(tp === "essay"){
                var sd = dbo.collection('pqessactivities').updateOne({name: sq},{$inc:{qnum:1}});
                dbo.collection('pqessactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                    fn(b);
                });
            }
        });

    }
    
}

module.exports.nextPQVersion = async function(sq, tp){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
            var b ;
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            if(tp === 'scq'){
                var sd = dbo.collection('pqscqactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqscqactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            }else if(tp === "mcq"){
                var sd = dbo.collection('pqobjactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqobjactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            }else if(tp === "essay"){
                var sd = dbo.collection('pqessactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqessactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            } 
        });
    }else{
        MongoClient.connect(dbURI, function(err, db) {
            var b ;
            var dbo = db.db(dbname); // use dbname from Zconfig file 
            if(tp === 'scq'){
                var sd = dbo.collection('pqscqactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqscqactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            }else if(tp === "mcq"){
                var sd = dbo.collection('pqobjactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqobjactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            }else if(tp === "essay"){
                var sd = dbo.collection('pqessactivities').updateOne({name: sq},{$inc:{version:1}});
                var b ;
                dbo.collection('pqessactivities').find({name: sq}).toArray(function(err, result){
                    console.log(result);
                    b = parseInt(result[0].qnum);
                    //console.log(`sd:  ${b}`);
                    db.close();
                });
            }
        });
    }
}

module.exports.getBase64Data = function(av, fn){
    var c = path.join(__dirname, `../../uploads/${av}`)
    let buff = fs.readFileSync(c);
    let base64data = buff.toString('base64');
    fn(base64data);
}

module.exports.deleteFile = function(file){
    const directoryPath = path.join(__dirname, `../../uploads/${file}`); // the path to the file

    try{
        fs.unlink(directoryPath, function(err) { // remove the fie from the directory
            if (err) { 
              throw err //if error, throw it
            } else {
                console.log(`${file} deleted`);
            }
        });
    }catch(err){
        console.log("Error deleting file")
    }
}