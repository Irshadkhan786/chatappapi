var express = require('express');
var app = express();
var port = process.env.PORT || '5000';
var mongoosedb = require('mongoose')
var bodyparser = require('body-parser');
var cors = require('cors');
/*=== local imports===*/
var mongocon = require('./db/mongoose');
var {usermodel}= require('./user/user')
var {authenticateToken,checkDuplicatedata} = require('./db/authinticate');

app.use(express.static(__dirname+'/assets'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json())
app.use(cors());

app.get("/",(req,res)=>{
    res.send("<h1>Stay Healthy. Stay Home. Stay Safe.</h1>");
})

app.post("/signup",async (req,res)=>{
    
    var name        = req.body.name;
    var email       = req.body.email;
    var contact     = req.body.contact;
    var password    = req.body.password;
    var cnfpasswprd = req.body.cnfpasswprd;

    try{

        var is_email = await checkDuplicatedata({email:email});
        var is_contact = await checkDuplicatedata({contact:contact});
        
        if(is_email.status == 0){
            res.send({status:0,'res':'This email is already exist'});
            return false;
        }
       
        if(is_contact.status == 0){
            res.send({status:0,'res':'This contact is already exist'});
            return false;
        }
        
        var userdata = new usermodel({
            name,
            email,
            contact,
            password,
            created_on: new Date()
        });
        let data_to_return = {name,email};
        let token = await userdata.generateAuthToken();
        res.header('x-auth',token).send({status:1,data:data_to_return,res:'User Registered Successfully'});
    }catch(e){
        res.send({status:0,data:e,res:'Sorry Some Problem Occurred. Please Try Again'});
    }
    
})

app.post("/test",(req,res)=>{
    console.log('testing...');
})
app.post("/login",(req,res)=>{
    
    var email = req.body.email;
    var password = req.body.password;

    if(email == ""){
        res.send({status:0,res:'Email is required'})
    }
    if(password == ""){
        res.send({status:0,res:'Password is required'})
    }

    usermodel.findByCredentils({email,password}).then((loginRes)=>{
        return loginRes.generateAuthToken().then((token)=>{
            res.header('x-auth',token).send({status:1,res:loginRes})
        })
    }).catch((e)=>{
        res.status(404).send({status:0,res:'Invalid Email/Password'});
    })
})

app.get("/about",authenticateToken,(req,res)=>{
    console.log(req.user)
})
app.listen(port,()=>{
console.log(`Server is runnning on port 5000 `);
})