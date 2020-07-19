var mongoose = require('mongoose');
var bcryptjs = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('./../db/config');

var userscheema = mongoose.Schema({
    name:{
        type:String,
        minlength:3,
        require:true
    },
    email:{
        type:String,
        minlength:5,
        require:true
    },
    contact:{
        type:String,
        minlength:10,
        require:true
    },
    password:{
        type:String,
        require:true
    },
    created_on:{
        type:Date
    },
    last_seen:{
        type:String
    },
    tokens:[{
        access:{
            type:String,
            require:true
        },
        token:{
            type:String,
            require:true
        }
    }]
})

/*===hashing of password===*/
userscheema.pre('save',function(next){
    var user = this;
   if(user.isModified('password')){
       bcryptjs.genSalt(10,(err,salt)=>{
          
           if(err){
               next();
           }else if(!salt){
               next();
           }else{
               bcryptjs.hash(user.password,salt,(haserr,passhash)=>{
                   if(haserr){
                       next();
                   }else if(!passhash){
                       next();
                   }else{
                       user.password = passhash;
                       next();
                   }
               })
           }
       })
   }else{
       next();
   }
})

/*==== generating authenticating tokens===*/
userscheema.methods.generateAuthToken = function(){
    var user = this;
    var token_secrate = config.getSecret();
    var access = 'auth';
    var token = jwt.sign({_id:user._id,access:access},token_secrate);
    user.tokens.push({access:access,token:token});

    return user.save().then(()=>{
        return token;
    });
}
/*==== get user by token ====*/
userscheema.statics.findByToken = function(token){

    var user = this;
    var decode;
    try{
        decode = jwt.verify(token,config.getSecret());
    }catch(e){
        return new Promise((resolve,reject)=>{
            return reject({'reason':'Invalid Token'});
        })
    }
    
   
    return user.findOne({'_id':decode._id,'tokens.token':token,'tokens.access':decode.access});
}

userscheema.statics.findByCredentils = function(formObj){

    var user = this;
    return user.findOne({email:formObj.email}).then((userData)=>{
        if(!userData){
                return new Promise((resolve,reject)=>{
                    return reject({'status':'0',res:'Email not found'});
                })
        }
    return new Promise((resolve,reject)=>{
        bcryptjs.compare(formObj.password,userData.password,(pass_err,pass_succ)=>{
            if(pass_err){
                return reject({'status':'0','reason':'Wrong password'})
            }else if(!pass_succ){
                return reject({'status':'0','reason':'Wrong password'});
            }else{
                return resolve(userData);
            }
        })

        
    })

    }).catch((e)=>{
        return new Promise((resolve,reject)=>{
            return reject({'reason':"Error occured in user's email validation"});
        })
    })
}
var usermodel = mongoose.model('users',userscheema);
module.exports = {
    usermodel
}