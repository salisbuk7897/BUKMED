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
const bcrypt = require('bcryptjs')


module.exports.userLogin = function(req, res){
    //console.log(req.body);
    try{
        if (dbauth === 'true'){
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.name).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        res.render("login", {lgmsg: "Wrong Username and Password"});
                    }else{// user available, ignore
                        if(bcrypt.compareSync(req.body.password, result[0].password)){
                            req.session.name = result[0].username;
                            req.session.password = result[0].password;
                            req.session.role = result[0].role;
                            res.redirect("/")
                        }else{
                            res.render("login", {lgmsg: "Wrong Password"});
                        }
                    }
                });
            });
        }else{
            MongoClient.connect(dbURI, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.name).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        res.render("login", {lgmsg: "Wrong Username and Password"});
                    }else{// user available, ignore
                        if(bcrypt.compareSync(req.body.password, result[0].password)){
                            req.session.name = result[0].username;
                            req.session.password = result[0].password;
                            req.session.role = result[0].role;
                            res.redirect("/")
                        }else{
                            res.render("login", {lgmsg: "Wrong Password"});
                        }
                    }
                });
            });
        }
    }catch(e){
        res.render("login", {lgmsg: "Login Failed"});
    }
}


module.exports.getDash = function(req, res){
    //console.log(req.body);
    var c = {};
    try{
        if (dbauth === 'true'){
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.session.name).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        //res.render("login", {lgmsg: "Wrong Username and Password"});
                    }else{// user available, ignore
                        res.render("dashboard", {fname: result[0].firstName, lname:result[0].lastName, clevel:result[0].clevel, school:result[0].school, lvl:result[0].level, dept:result[0].dept, email:result[0].email, noq:result[0].noOfQ, qap:result[0].qApproved, msg:"logged in", name:req.session.name, pic:result[0].pic})
                        
                    }
                });
            });
        }else{
            MongoClient.connect(dbURI, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.name).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        //res.render("login", {lgmsg: "Wrong Username and Password"});
                    }else{// user available, ignore
                        
                    }
                });
            });
        }
    }catch(e){
        //res.render("login", {lgmsg: "Login Failed"});
    }
}