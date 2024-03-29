require('dotenv').config()
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
var nedb = require("./nedbAdmin")
let db = nedb.db;
let dbrefresh = nedb.dbrefresh;
var Zconfig = require("./config/Zconfig.json");

//Update Password REST API
module.exports.updatePassword = async function(req, res){
    db.find({ }, async function (err, users) {
        const user = users.find(user => user.name == req.user.name)
        username = req.user.name;
        oldpassword  = req.body.oldpassword;
        newpassword = req.body.newpassword;
        if( user == null){
            res.status(400).send("Cannot Find User")
        }
        try{
            if ( bcrypt.compareSync(oldpassword, user.password)){
                try{
                    const Salt = bcrypt.genSaltSync()
                    const hashedpassword = bcrypt.hashSync(newpassword, Salt)
                    //const user = {name: data.name, password: hashedpassword}
                    db.update({ password: user.password }, {$set: { password: hashedpassword}}, {}, function (err, numReplaced) {
                        if(err){
                            res.status(201).send("Error");
                        } else {
                            res.status(200).send("Password Updated Successfully");
                        }
                    });
                }catch(err) {
                    res.status(500).send()
                }
            }else{
                res.send("Old Password is Incorrect")
            }
        } catch(err){
            res.status(500).send()
        }
    })
}



//Login for REST API calls
module.exports.login  = async function (req, res){
    db.find({}, async function (err, users) {
        const user = users.find(user => user.name == req.body.name)
        if( user == null){
            res.status(400).send("Cannot Find User")
        }else{
            try{
                if (bcrypt.compareSync(req.body.password, user.password)){
                    //Serialise User
                    const username = {name: user.name};
                    const accessToken = generateAccessToken(username);
                    const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN);
                    dbrefresh.find({}, function(err, tokens){
                        if(err){
                            res.send(err);
                        }else{
                            if (tokens.length >= 1){
                                dbrefresh.remove({}, {multi: true}, err => {
                                    if (err) {
                                        res.send(err);
                                    }
                                });
                            }
                            dbrefresh.insert({refreshToken: refreshToken});
                        }
                    })
                    res.status(200).send("Welcome "+ user.name + "\nAccess Token: " + accessToken + "\nRefresh Token: " + refreshToken)
                }else{
                    res.send("Login Failed");
                }
            } catch(err){
                res.status(500).send(err)
            }
        }    
    }); 
}

module.exports.token = function(req, res){
    refreshtokendb(function(dbrefreshTokens){
        const refreshtok = req.body.token;
      if (refreshtok == null) return res.sendStatus(401)
      try{
        if (!(dbrefreshTokens[0].refreshToken).includes(refreshtok)) return res.sendStatus(403);
        jwt.verify(refreshtok, process.env.REFRESH_TOKEN, (err, user) => {
            if (err) return res.sendStatus(403);
            const accessToken = generateAccessToken({name: user.name});
            res.json({accessToken: accessToken})
        })
      }catch(err){
          res.send("Token Generation Failed");
      }
      
    })
}

module.exports.findAdmin = function (fn){
    db.find({ }, function (err, docs) {
        fn(docs); // logs all of the data in docs
    });
}

function refreshtokendb(fn){
    dbrefresh.find({ }, function (err, docs) {
        fn(docs); // logs all of the data in docs
    });
}

function generateAccessToken(user){
    return jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn: "15m"})
}

module.exports.authenticateToken =function (req,res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if(token == null) return res.status(401).send("")

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
        if (err) return res.sendStatus(403).send("")
        req.user = user
        next();
    }) 

}