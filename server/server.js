var express = require('express');
var http = require('http');
var socket = require('socket.io')

var port = process.env.PORT || '5000';
var mongoose = require('mongoose')
var bodyparser = require('body-parser');
var cors = require('cors');
/*=== local imports===*/
var mongocon = require('./db/mongoose');
var {usermodel}= require('./user/user');
var {msgmodel} = require('./user/message');
var {authenticateToken,checkDuplicatedata} = require('./db/authinticate');
/*== socket server setup ==*/
var app = express();
var server = http.createServer(app);
var io = socket(server);

app.use(express.static(__dirname+'/assets'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json())
app.use(cors({exposedHeaders:['x-auth']}));


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
        if(password!=cnfpasswprd){
            res.send({status:0,'res':'Password and Confirm Password are not same'});
            return false;
        }
        var userdata = new usermodel({
            name,
            email,
            contact,
            password,
            status:"1",
            last_seen: new Date(),
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


app.get("/varifyToken",authenticateToken,(req,res)=>{
    res.send({status:1,res:'token is valid'});
})

app.post('/getTwoUserChat',authenticateToken,(req,res)=>{
    var reciever_id = req.body.to_userid;
    var sender_id = req.body.from_userid;
    if(sender_id == '' || sender_id == 0){
        res.send({status:0,res:'Sender ID is required'})
    }
    if(reciever_id == '' || reciever_id == 0){
        res.send({status:0,res:'Reciever ID is required'})
    }
    if(!mongoose.mongo.ObjectID.isValid(reciever_id)){
        res.send({status:0,'res':'Reciever ID is not valid'});
    }
    if(!mongoose.mongo.ObjectID.isValid(sender_id)){
        res.send({status:0,'res':'Sender ID is not valid'});
    }
    msgmodel.find({$or:
        [
            {
                $and:[{'fromuserId':mongoose.mongo.ObjectID(sender_id),'touserId':mongoose.mongo.ObjectID(reciever_id)}]
            },
            {
                $and:[{'fromuserId':mongoose.mongo.ObjectID(reciever_id),'touserId':mongoose.mongo.ObjectID(sender_id)}]
            }
        ]
    },{_id:0,fromuserId:1,touserId:1,message:1,msg_date:1}).then((chat_data)=>{
        res.send({status:1,chat_data})
    }).catch((e)=>{
        res.send({status:0,chat_data:'Some error found'})
    })
})
/*==== socket code starts here ===*/
/*== import chat class ==*/
var {Chat} = require('./db/chat');
var chatObj = new Chat(); //##never put this code inside the io.on('connection') function
io.on('connection', (socket)=>{
    
    
    socket.on('setOnlineUser',async (data)=>{

        try{
        data.socketid = socket.id;
        var getOnlineUser = chatObj.getOnlineUsers(); 
        if(getOnlineUser.length<=0){
            var alluserList = await chatObj.getDbUserList();
            var makeUserOnline = chatObj.makeOnlineUser(alluserList,data);
        }else{
            //## 1 -check user is not available in array then push it in online array
            var is_available = getOnlineUser.filter((userObj)=>{
                if(userObj._id == data.userAutoId){
                    return userObj;
                }
            })
            
            if(is_available.length<=0){
                var allonlinedbUser = await chatObj.pushNewUser(data);
                var makeUserOnline = chatObj.makeOnlineUser(allonlinedbUser,data);
            }else{
                //## 2 -make user online if he is availabe in array.
                var makeUserOnline = chatObj.makeOnlineUser(getOnlineUser,data);
            }
            
        }
        console.log(makeUserOnline);
        socket.join(data.email);
        io.emit('updateOnlineUser',makeUserOnline);
        }catch(e){
            console.log(e)
        }
        
    })

    socket.on('sendMessage',(data)=>{
       
        data.time = new Date();
        var messageData = {
            data
        }
        chatObj.saveChatData(data);
        socket.broadcast.to(data.touserEmail).emit('recieveMessage',messageData)
        socket.emit('recieveMessage',messageData);
    })

    socket.on('disconnect',(data)=>{
        var disconnectUser = chatObj.searchUserBySocketId(socket.id);
        if(disconnectUser.length>0){
            var allUpdUser = chatObj.makeUserOffile(disconnectUser[0]);
            io.emit('updateOnlineUser',allUpdUser);
            socket.leave(disconnectUser[0].email);
        }
        console.log('dosconnect hitted')
    })
})
/*==== socket code ends here ===*/
server.listen(port,()=>{
console.log(`Server is runnning on port 5000 `);
})