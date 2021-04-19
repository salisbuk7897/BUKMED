var Zconfig = require("../../qconfig.json");
var mongoose = require( 'mongoose' );
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
const readline = require('readline');
var conn;
var coursesdoc = require("../Models/coursesSchema");
const { collection } = require("../Models/coursesSchema");
var dbURI = `mongodb://${mongourl}:${mongoport}/${dbname}?compressors=zlib`; //no authentication
var dbURIAuth = `mongodb://${dbuser}:${dbpwd}@${mongourl}:${mongoport}/${dbname}?authMechanism=DEFAULT&authSource=${authSource}`; 
var helper = require("./helpers");
let objdoc = require("../Models/pqobjSchema");
let essdoc = require("../Models/pqessSchema");
let scqdoc = require('../Models/pqscqSchema');
let userdoc = require('../Models/Users');
var helper = require("./helpers");


async function addReqPQtoUser(owner, name, year, type){
    userdoc.exists({username: owner}, async function(err, result){
        if(result === false){
            console.log(`${name} Document not found`)
        }else{
            const existingDoc = await userdoc.findOne({ username: owner });
            existingDoc.pastq.push({
                name: name,
                type: type,
                year: year,
            });
            existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                if(err){
                  console.log(`error saving subcourse ${name} to user account`);
                } else{
                  console.log(`${owner} Updated with ${name} Past question`);
                }
            })
        };
    });
}


async function register(qtype, name, year, owner , fn){
    console.log(`pastq ${name}, year ${year}, type ${typeof qtype}`);
    if(qtype === 'ESSAY') {
        await essdoc.exists({name : name, year : year}, async function(err, result){
            if(result === false){
                await helper.nextID('essaypq', function(e){
                    var essDoc = new essdoc({
                        _id: e,
                        name : name,
                        year : year,
                        type : qtype,
                        owner : owner,
                        qnum : 0,
                        version : 1, 
                    });
                    essDoc.save(async (err, essDoc) => {
                        if(err){
                            fn('FAIL');
                            //res.render('registerpq', {msg: `error saving ${req.body.name} ${req.body.year} ${req.body.qtype} past Question`});
                        } else{
                            await addReqPQtoUser(owner, name, year, qtype);
                            //res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                            fn('SAVED');
                        }
                    });
                });
            }else{
                fn("Error");
            }
        })
    }else if(qtype === 'MCQ'){
        objdoc.exists({name : name, year : year}, async function(err, result){
            if(result === false){
                helper.nextID('mcqpq', function(e){
                    var objDoc = new objdoc({
                        _id: e,
                        name : name,
                        year : year,
                        type : qtype,
                        owner : owner,
                        version : 1, 
                        qnum: 0,
                    });
                    objDoc.save(async (err, objDoc) => {  
                        if(err){
                            fn('FAIL');
                            //res.render('registerpq', {msg: `error saving ${req.body.name} ${req.body.year} ${req.body.qtype} past Question`});
                        } else{
                            await addReqPQtoUser(owner, name, year, qtype);
                            //res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                            fn('SAVED');
                        }
                    });
                });
            }else{
                fn("Error");
            }
        })
    }else if(qtype === 'SCQ'){
        scqdoc.exists({name : name, year : year}, async function(err, result){
            if(result === false){
                helper.nextID('scqpq', function(e){
                    var objDoc = new scqdoc({
                        _id: e,
                        name : name, 
                        year : year,
                        type : qtype,
                        owner : owner,
                        version : 1,
                        qnum: 0,
                    });
                    objDoc.save(async (err, objDoc) => {  
                        if(err){
                            console.log(err);
                            fn('FAIL');
                        } else{
                            await addReqPQtoUser(owner, name, year, qtype);
                            //res.render('registerpq', {msg: `${req.body.name} ${req.body.year} ${req.body.qtype} saved Successfully`});
                            fn('SAVED');
                        }
                    });
                });
            }else{
                fn('Error');
            }
        })
    }

}



// SAVE SCQ PAPER FROM FILE
module.exports.scqpq = async function(req, res){
    try {
        if(!req.file) { //if file parameter is not in request
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let file = req.file;
            await screenSCQPQ(file, async function(data){
                if(data === "OK"){
                    await saveSCQPQTitle(file, req.session.name, async function(data1){
                        if(data1 === "OK"){
                            await saveSCQ(file, req.session.name, function(data2){
                                res.render("uploads", {msg: data2})
                            }) 
                        }else{
                            res.render("uploads", {msg: data1})
                        }
                    }) 
                }else{
                    res.render("uploads", {msg: data})
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
        console.log(err)
    }
    //res.render("uploads", {msg:'Successful'})
}

async function screenSCQPQ(file, fn){
    var i = 0;
    var heading = "NO";
    var check = "OK";
    var ErrorNumber = 0;
    const readline = require('readline');
    //const fileStream = fs.createReadStream('input.txt');

    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    }); 

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            try{
                //console.log(i)
                var que = line.split(";");
                var question = que[0].trim();
                var opt1 = que[1].trim();
                var opt2 = que[2].trim();
                var opt3 = que[3].trim();
                var opt4 = que[4].trim();
                var opt5 = que[5].trim();
                var ans = que[6].trim();
                if(question != "" && opt1 != "" && opt2 != "" && opt3 != "" && opt4 != "" && opt5 != "" && ans != ""){ //Check if answer is part of options too
                    //console.log(`q - ${question}, 1 - ${opt1}, 2 - ${opt2}, 3 - ${opt3}, 4 - ${opt4}, 5 - ${opt5}, ans - ${ans},`);
                    i = i + 1;
                }else{
                    check = "Error";
                    ErrorNumber = i;
                    break;
                }
            }catch{
                check = "Error";
                ErrorNumber = i;
                break;
            }
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0].trim();
                var year = hd[1].trim();
                var type = hd[2].trim();
                console.log(`id ${id}, year ${year}, type ${type}`)
                if(id != "" && year != "" && type != ""){
                    try{
                        var extra = hd[3].trim();
                        if(extra != ""){
                            heading = "Excess"
                            break;
                        }else{
                            heading = "YES"
                            i = i + 1;
                        }
                    }catch{
                        heading = "YES"
                        i = i + 1;
                    }  
                }else{
                    heading = "Error";
                    break;
                    
                }
            }
        }
    }

    if(heading === "YES" && check === "OK"){
        fn("OK")
    }else if(heading === "Error"){
        fn("No/Wrong Header line");
    }else if(heading === "Excess"){
        fn("Too Many Parameters! Please Correct Header Line");
    }else if(heading === "NO"){
        fn("No Header line");
    }else if(check === "Error"){
        fn(`Error on Question number ${ErrorNumber}`);
    }
}

async function saveSCQPQTitle(file, owner, fn){
    const readInterface = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;
    readInterface.on('line', async function(line) {
        if (i >= 1 && line != ""){
            
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0];
                var year = hd[1];
                var type = hd[2]; 
                i = i + 1; 
                await register(type.trim(), id.trim(), year.trim(), owner.trim(), function(a){
                    if(a === 'Error'){
                        fn("Question paper with thesame name and year Already Exist")
                    } else if(a === "FAIL"){
                        fn("Saving Question Paper Failed")
                    }else{
                        fn("OK");
                    }
                });
            }
        }
    })
}

async function saveSCQ(file, owner, fn){
    var pastq;
    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;
    

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            console.log(`pastq ${pastq}`);
            var que = line.split(";");
            var question = que[0].trim();
            var opt1 = que[1].trim();
            var opt2 = que[2].trim();
            var opt3 = que[3].trim();
            var opt4 = que[4].trim();
            var opt5 = que[5].trim();
            var ans = que[6].trim();

            await saveSCQtoDB(pastq, i, question, opt1, opt2, opt3, opt4, opt5, ans, owner);

            i = i + 1;
            
            
        }else if(i == 0){
            var hd = line.split(";");
            var id = hd[0].trim();
            console.log(`id ${id}`);
            pastq = id.trim();
            i = i + 1
            
        }else{

        }
    }
    fn("Past Question Saved Successfully");
}

async function saveSCQtoDB(pastq, c, question, opt1, opt2, opt3, opt4, opt5, ans, owner){
    scqdoc.exists({name: pastq}, async function(err, result){
        if(result === false){
            fn(`${pastq} Document not found`)
        }else{
            const existingDoc = await scqdoc.findOne({ name: pastq});
            //get nextID
            await helper.nextPQID(pastq, 'scq', async function(e){
                await existingDoc.questions.push({
                    _id: c,
                    question: question,
                    option1: opt1,
                    option2: opt2,
                    option3: opt3,
                    option4: opt4,
                    option5: opt5,
                    answer: ans,
                    picture: "No Picture",
                    contributor: owner,
                    approved: 'true',
                });
                await existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                    if(err){
                        //fn(err);
                    } else{
                      helper.nextPQVersion(pastq, 'scq');
                      //console.log("Saved a question");
                    }
                })
            }); 
        };
    });
}

// SAVE MCQ PAPER FROM FILE
module.exports.mcqpq = async function(req, res){
    try {
        if(!req.file) { //if file parameter is not in request
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let file = req.file;
            await screenMCQPQ(file, async function(data){
                if(data === "OK"){
                    await saveMCQPQTitle(file, req.session.name, async function(data1){
                        if(data1 === "OK"){
                            await saveMCQ(file, req.session.name, function(data2){
                                res.render("uploads", {msg: data2})
                            }) 
                        }else{
                            res.render("uploads", {msg: data1})
                        }
                    }) 
                }else{
                    res.render("uploads", {msg: data})
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
        console.log(err)
    }
    //res.render("uploads", {msg:'Successful'})
}

async function screenMCQPQ(file, fn){
    var i = 0;
    var heading = "NO";
    var check = "OK";
    var ErrorNumber = 0;
    const readline = require('readline');
    //const fileStream = fs.createReadStream('input.txt');

    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    }); 

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            try{
                //console.log(i)
                var que = line.split(";");
                var question = que[0];
                var opt1 = que[1].trim();
                var opt2 = que[2].trim();
                var opt3 = que[3].trim();
                var opt4 = que[4].trim();
                var opt5 = que[5].trim();
                var ans1 = que[6].trim();
                var ans2 = que[7].trim();
                var ans3 = que[8].trim();
                var ans4 = que[9].trim();
                var ans5 = que[10].trim();
                if(question != "" && opt1 != "" && opt2 != "" && opt3 != "" && opt4 != "" && opt5 != "" && ans1 != "" && ans2 != "" && ans3 != "" && ans4 != "" && ans5 != ""){ //Check if answer is part of options too
                    //console.log(`q - ${question}, 1 - ${opt1}, 2 - ${opt2}, 3 - ${opt3}, 4 - ${opt4}, 5 - ${opt5}, ans - ${ans},`);
                    i = i + 1;
                }else{
                    check = "Error";
                    ErrorNumber = i;
                    break;
                }
            }catch{
                check = "Error";
                ErrorNumber = i;
                break;
            }
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0].trim();
                var year = hd[1].trim();
                var type = hd[2].trim();
                console.log(`id ${id}, year ${year}, type ${type}`)
                if(id != "" && year != "" && type != ""){
                    try{
                        var extra = hd[3].trim();
                        if(extra != ""){
                            heading = "Excess"
                            break;
                        }else{
                            heading = "YES"
                            i = i + 1;
                        }
                    }catch{
                        heading = "YES"
                        i = i + 1;
                    }  
                }else{
                    heading = "Error";
                    break;
                    
                }
            }
        }
    }

    if(heading === "YES" && check === "OK"){
        fn("OK")
    }else if(heading === "Error"){
        fn("No/Wrong Header line");
    }else if(heading === "Excess"){
        fn("Too Many Parameters! Please Correct Header Line");
    }else if(heading === "NO"){
        fn("No Header line");
    }else if(check === "Error"){
        fn(`Error on Question number ${ErrorNumber}`);
    }
}

async function saveMCQPQTitle(file, owner, fn){
    const readInterface = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;
    readInterface.on('line', async function(line) {
        if (i >= 1 && line != ""){
            
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0].trim();
                var year = hd[1].trim();
                var type = hd[2].trim();
                i = i + 1; 
                await register(type.trim(), id.trim(), year.trim(), owner.trim(), function(a){
                    if(a === 'Error'){
                        fn("Question paper with thesame name and year Already Exist")
                    } else if(a === "FAIL"){
                        fn("Saving Question Paper Failed")
                    }else{
                        fn("OK");
                    }
                });
            }
        }
    })
}

async function saveMCQ(file, owner, fn){
    var pastq;
    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            //console.log(`pastq ${pastq}`);
            var que = line.split(";");
            var question = que[0].trim();
            var opt1 = que[1].trim();
            var opt2 = que[2].trim();
            var opt3 = que[3].trim();
            var opt4 = que[4].trim();
            var opt5 = que[5].trim();
            var ans1 = que[6].trim();
            var ans2 = que[7].trim();
            var ans3 = que[8].trim();
            var ans4 = que[9].trim();
            var ans5 = que[10].trim();

            await saveMCQtoDB(pastq, i, question, opt1, opt2, opt3, opt4, opt5, ans1, ans2, ans3, ans4, ans5, owner );

            i = i + 1;
            
        }else if(i == 0){
            var hd = line.split(";");
            var id = hd[0];
            console.log(`id ${id}`);
            pastq = id.trim();
            i = i + 1
            
        }else{

        }
    }
    fn("Past Question Saved Successfully");
}

async function saveMCQtoDB(pastq, i, question, opt1, opt2, opt3, opt4, opt5, ans1, ans2, ans3, ans4, ans5, owner ){
    objdoc.exists({name: pastq}, async function(err, result){
        if(result === false){
            fn(`${pastq} Document not found`)
        }else{
            var c;
            const existingDoc = await objdoc.findOne({ name: pastq});
            //get nextID
            await helper.nextPQID(pastq, 'mcq', async function(e){
                await existingDoc.questions.push({
                    _id: i,
                    question: question,
                    option1: opt1,
                    option2: opt2,
                    option3: opt3,
                    option4: opt4,
                    option5: opt5,
                    answer1: ans1,
                    answer2: ans2,
                    answer3: ans3,
                    answer4: ans4,
                    answer5: ans5,
                    picture: "No Picture",
                    contributor: owner,
                    approved: 'true',
                });
                await existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                    if(err){
                        fn(err);
                    } else{
                      helper.nextPQVersion(pastq, 'mcq');
                      //console.log("Saved a question");
                    }
                })
            }); 
        };
    });
}

// SAVE ESSAY PAPER FROM FILE
module.exports.esspq = async function(req, res){
    try {
        if(!req.file) { //if file parameter is not in request
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let file = req.file;
            await screenESSAYPQ(file, async function(data){
                if(data === "OK"){
                    await saveESSAYPQTitle(file, req.session.name, async function(data1){
                        if(data1 === "OK"){
                            await saveESSAY(file, req.session.name, function(data2){
                                res.render("uploads", {msg: data2})
                            }) 
                        }else{
                            res.render("uploads", {msg: data1})
                        }
                    }) 
                }else{
                    res.render("uploads", {msg: data})
                }
            });
        }
    } catch (err) {
        res.status(500).send(err);
        console.log(err)
    }
    //res.render("uploads", {msg:'Successful'})
}

async function screenESSAYPQ(file, fn){
    var i = 0;
    var heading = "NO";
    var check = "OK";
    var ErrorNumber = 0;
    const readline = require('readline');
    //const fileStream = fs.createReadStream('input.txt');

    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    }); 

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            try{
                //console.log(i)
                var que = line.split(";");
                var label = que[0].trim();
                var question = que[1].trim();
                
                if(question != "" && label != ""){ //Check if answer is part of options too
                    //console.log(`q - ${question}, 1 - ${opt1}, 2 - ${opt2}, 3 - ${opt3}, 4 - ${opt4}, 5 - ${opt5}, ans - ${ans},`);
                    i = i + 1;
                }else{
                    check = "Error";
                    ErrorNumber = i;
                    break;
                }
            }catch{
                check = "Error";
                ErrorNumber = i;
                break;
            }
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0].trim();
                var year = hd[1].trim();
                var type = hd[2].trim();
                console.log(`id ${id}, year ${year}, type ${type}`)
                if(id != "" && year != "" && type != ""){
                    try{
                        var extra = hd[3].trim();
                        if(extra != ""){
                            heading = "Excess"
                            break;
                        }else{
                            heading = "YES"
                            i = i + 1;
                        }
                    }catch{
                        heading = "YES"
                        i = i + 1;
                    }  
                }else{
                    heading = "Error";
                    break;
                    
                }
            }
        }
    }

    if(heading === "YES" && check === "OK"){
        fn("OK")
    }else if(heading === "Error"){
        fn("No/Wrong Header line");
    }else if(heading === "Excess"){
        fn("Too Many Parameters! Please Correct Header Line");
    }else if(heading === "NO"){
        fn("No Header line");
    }else if(check === "Error"){
        fn(`Error on Question number ${ErrorNumber}`);
    }
}

async function saveESSAYPQTitle(file, owner, fn){
    const readInterface = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;
    readInterface.on('line', async function(line) {
        if (i >= 1 && line != ""){
            
        }else{
            if(line != ""){
                var hd = line.split(";");
                var id = hd[0].trim();
                var year = hd[1].trim();
                var type = hd[2].trim(); 
                i = i + 1; 
                await register(type.trim(), id.trim(), year.trim(), owner.trim(), function(a){
                    if(a === 'Error'){
                        fn("Question paper with thesame name and year Already Exist")
                    } else if(a === "FAIL"){
                        fn("Saving Question Paper Failed")
                    }else{
                        fn("OK");
                    }
                });
            }
        }
    })
}

async function saveESSAY(file, owner, fn){
    var pastq;
    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(__dirname,`../../uploads/${file.originalname}`))
    });
    var i = 0;
    

    for await (const line of rl) {
        if (i >= 1 && line != ""){
            console.log(`pastq ${pastq}`);
            var que = line.split(";");
            var label = que[0].trim();
            var question = que[1].trim();

            await saveESSAYtoDB(pastq, i, question, label, owner);

            i = i + 1;
            
            
        }else if(i == 0){
            var hd = line.split(";");
            var id = hd[0].trim();
            console.log(`id ${id}`);
            pastq = id.trim();
            i = i + 1
            
        }else{

        }
    }
    fn("Past Question Saved Successfully");
}

async function saveESSAYtoDB(pastq, c, question, label, owner){
    essdoc.exists({name: pastq}, async function(err, result){
        if(result === false){
            console.log(`${pastq} Document not found`)
        }else{
            
            const existingDoc = await essdoc.findOne({ name: pastq });
            helper.nextPQID(pastq, 'essay', function(e){
                existingDoc.questions.push({
                    _id: c,
                    label: label,
                    question: question,
                    contributor: owner,
                    approved: 'true',
                });
                existingDoc.save((err, existingDoc) => { // save Subdocument to existing Document
                    if(err){
                        
                    } else{
                      helper.nextPQVersion(pastq, 'essay');
                      
                    }
                })
            });
        };
    });
}