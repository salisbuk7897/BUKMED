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
var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 
var helper = require("./helpers");
const bcrypt = require('bcryptjs')

module.exports.register = function(req, res){
    //console.log(req.body);
    if(req.body.pwd === req.body.cpwd){
        //console.log("password clear")
        if (dbauth === 'true'){
            let file = req.file;
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.user).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        if(!req.file) { //if file parameter is not in request
                            res.render('Register');
                            console.log("no file")
                        } else {
                            helper.getBase64Data(file.originalname, function(data){
                                //data is base64 string of image uploaded
                                //var dt = data;
                                var cx;
                                helper.nextID('user', function(e){
                                    cx = e;
                                    const Salt = bcrypt.genSaltSync()
                                    const hashedpassword = bcrypt.hashSync(req.body.pwd, Salt)
                                    collection.insertOne({
                                        _id: cx,
                                        firstName: req.body.fname,
                                        lastName: req.body.lname,
                                        school: req.body.school,
                                        dept: req.body.dept,
                                        email: req.body.email,
                                        level: req.body.lvl,
                                        username: (req.body.user).toUpperCase(),
                                        role: 'Contributor',
                                        pic: data,
                                        password: hashedpassword,
                                        clevel: 1,
                                        noOfQ: 0,
                                        qApproved: 0
                                    },function(err, result){
                                        if (err) throw err;
                                        if(result.result.n = 1){
                                            console.log("user added Successfully");
                                        }
                                    })
                                    db.close();
                                    req.session.name = (req.body.user).toUpperCase();
                                    req.session.password = hashedpassword;
                                    req.session.role = 'Contributor';
                                    helper.deleteFile(file.originalname);
                                    res.redirect('/');
                                });
                            })
                        }
                    }else{// user available, ignore
                        res.render('Register');
                        //console.log("user available")
                    }
                });
                
            });

        }else{
            //no db authentication
            let file = req.file;
            MongoClient.connect(dbURI, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.user).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        if(!req.file) { //if file parameter is not in request
                            res.render('Register');
                            console.log("no file")
                        } else {
                            helper.getBase64Data(file.originalname, function(data){
                                //data is base64 string of image uploaded
                                //var dt = data;
                                var cx;
                                helper.nextID('user', function(e){
                                    cx = e;
                                    const Salt = bcrypt.genSaltSync()
                                    const hashedpassword = bcrypt.hashSync(req.body.pwd, Salt)
                                    collection.insertOne({
                                        _id: cx,
                                        firstName: req.body.fname,
                                        lastName: req.body.lname,
                                        school: req.body.school,
                                        dept: req.body.dept,
                                        email: req.body.email,
                                        level: req.body.lvl,
                                        username: (req.body.user).toUpperCase(),
                                        role: 'Contributor',
                                        pic: data,
                                        password: hashedpassword,
                                        clevel: 1,
                                        noOfQ: 0,
                                        qApproved: 0
                                    },function(err, result){
                                        if (err) throw err;
                                        if(result.result.n = 1){
                                            console.log("user added Successfully");
                                        }
                                    })
                                    db.close();
                                    req.session.name = (req.body.user).toUpperCase();
                                    req.session.password = hashedpassword;
                                    req.session.role = 'Contributor';
                                    helper.deleteFile(file.originalname);
                                    res.redirect('/');
                                });
                            })
                        }
                    }else{// user available, ignore
                        res.render('Register');
                    }
                });
            });
        }

    }else{
        //password did not match
        res.render('Register');
    }
}

module.exports.createAdmin = function(){
    MongoClient.connect(dbURIAuth, function(err, db) {
        var dbo = db.db(dbname); // use dbname from Zconfig file
        const collection = dbo.collection('users');
        var cx;
        helper.nextID('user', function(e){
            cx = e;
            const Salt = bcrypt.genSaltSync()
            const hashedpassword = bcrypt.hashSync('bukmeds', Salt)
            collection.insertOne({
                _id: cx,
                firstName: 'Bukmeds',
                lastName: 'Admin',
                school: 'Bukmeds University',
                dept: 'Medicine And Surgey',
                email: 'bukmeds@gmail.com',
                level: "4",
                username: 'ADMIN',
                role: 'Admin',
                pic: "No Picture",
                password: hashedpassword,
                clevel: 1,
                noOfQ: 0,
                qApproved: 0
            },function(err, result){
                if (err) throw err;
                if(result.result.n = 1){
                    console.log("Admin added Successfully");
                }
            })
            db.close();
        });

    });
    
}