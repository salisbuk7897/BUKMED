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

module.exports.upgUser = function(req, res){
    console.log(req.body);
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            if(req.body.st === 'adm'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "Admin"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Upgraded to Admin`);
                    }
                })
            }else if(req.body.st === 'sadm'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "SuperAdmin"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Upgraded to Super Admin`);
                    }
                })
            }else if(req.body.st === 'cnt'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "Contributor"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Updated to Contributor`);
                    }
                })
            }  
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            if(req.body.st === 'adm'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "Admin"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Upgraded to Admin`);
                    }
                })
            }else if(req.body.st === 'sadm'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "SuperAdmin"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Upgraded to Super Admin`);
                    }
                })
            }else if(req.body.st === 'cnt'){
                dbo.collection('users').updateOne({username:(req.body.user).toUpperCase()} ,{$set: {role: "Contributor"}}, function(err, result){ //make an array of all data in cpcactivities 
                    if (err) throw err; //if there is an error, throw it
                    if(result.result.n === 1){
                        db.close(); //close database connection
                        res.send(`${req.body.user} Updated to Contributor`);
                    }
                })
            } 
        });
    }
}

module.exports.deluser = function(req, res){
    if (dbauth === 'true'){ // if user has specified database authentication
        MongoClient.connect(dbURIAuth, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('users').deleteOne({username:(req.body.user).toUpperCase()} , function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`${req.body.user} Deleted Successfully`);
                }
            })
        });
    }else{
        //db auth not in use
        MongoClient.connect(dbURI, function(err, db) {
            var dbo = db.db(dbname); // use dbname from Zconfig file
            dbo.collection('users').deleteOne({username:(req.body.user).toUpperCase()} , function(err, result){ //make an array of all data in cpcactivities 
                if (err) throw err; //if there is an error, throw it
                if(result.result.n === 1){
                    db.close();
                    res.send(`${req.body.user} Deleted Successfully`);
                }
            })
        });
    }
}

module.exports.GetUserAccount = function(req, res){
    try{
        if (dbauth === 'true'){
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.user).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        //res.render("login", {lgmsg: "Wrong Username and Password"});
                    }else{// user available, ignore
                        res.render("adminupg2", {username: result[0].username, fname: result[0].firstName, lname:result[0].lastName, clevel:result[0].clevel, school:result[0].school, lvl:result[0].level, dept:result[0].dept, email:result[0].email, pic:result[0].pic});
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
                        res.render("adminupg2", {username: result[0].username, fname: result[0].firstName, lname:result[0].lastName, clevel:result[0].clevel, school:result[0].school, lvl:result[0].level, dept:result[0].dept, email:result[0].email, pic:result[0].pic});
                    }
                });
            });
        }
    }catch(e){
        //res.render("login", {lgmsg: "Login Failed"});
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
                        res.render("dashboard", {username: result[0].username, fname: result[0].firstName, lname:result[0].lastName, clevel:result[0].clevel, school:result[0].school, lvl:result[0].level, dept:result[0].dept, email:result[0].email, noq:result[0].noOfQ, qap:result[0].qApproved, msg:"logged in", name:req.session.name, pic:result[0].pic, pastq:result[0].pastq});
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
                        res.render("dashboard", {username: result[0].username, fname: result[0].firstName, lname:result[0].lastName, clevel:result[0].clevel, school:result[0].school, lvl:result[0].level, dept:result[0].dept, email:result[0].email, noq:result[0].noOfQ, qap:result[0].qApproved, msg:"logged in", name:req.session.name, pic:result[0].pic, pastq:result[0].pastq});
                    }
                });
            });
        }
    }catch(e){
        //res.render("login", {lgmsg: "Login Failed"});
    }
}