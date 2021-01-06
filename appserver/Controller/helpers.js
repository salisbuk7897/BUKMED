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

module.exports.nextID = async function(sq, fn){
    if (dbauth === 'true'){
        MongoClient.connect(dbURIAuth, function(err, db) {
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