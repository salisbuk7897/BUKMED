require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
var Zconfig = require("./qconfig.json");
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
var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`;

//Login for REST API calls
module.exports.login  = async function (req, res){
    try{
        if (dbauth === 'true'){
            MongoClient.connect(dbURIAuth, function(err, db) {
                var dbo = db.db(dbname); // use dbname from Zconfig file
                const collection = dbo.collection('users');
                collection.find({username: (req.body.name).toUpperCase()}).toArray(function(err, result){
                    //console.log(result);
                    if(result.length === 0){ //user not available, register it
                        res.send("Wrong Username and Password");
                    }else{// user available, ignore
                        if(bcrypt.compareSync(req.body.password, result[0].password)){
                            const username = {name: result[0].username};
                            const accessToken = generateAccessToken(username);
                            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
                            res.json({acctoken: accessToken, rfstoken: refreshToken, user: result[0]});
                        }else{
                            res.send("login failed");
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
                        res.send("Wrong Username and Password");
                    }else{// user available, ignore
                        if(bcrypt.compareSync(req.body.password, result[0].password)){
                            const username = {name: result[0].username};
                            const accessToken = generateAccessToken(username);
                            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
                            res.json({acctoken: accessToken, rfstoken: refreshToken});
                        }else{
                            res.send("login failed");
                        }
                    }
                });
            });
        }
    }catch(e){
        res.send( "Login Failed");
    }
}

module.exports.token = function(req, res){
    try{
        const refreshtok = req.body.token;
        jwt.verify(refreshtok, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) return res.sendStatus(403);
            const accessToken = generateAccessToken({name: req.body.user});
            res.json({accessToken: accessToken})
        })
    }catch(err){
        res.send("Token Generation Failed");
    }
}

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: "15m"})
}

module.exports.authenticateToken =function (req,res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401)
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403);
        //req.user = user
        next();
    }) 

}