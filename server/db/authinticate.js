var {usermodel} = require('./../user/user');
var bcryptjs = require('bcryptjs');
var mongoose = require('mongoose');

var authenticateToken = ((req,res,next)=>{
    var token = req.header('x-auth');
    
    usermodel.findByToken(token).then((data)=>{
        req.user = data;
        req.token = token;
        next();
    }).catch((e)=>{
        res.send({status:0,res:"Invaid Token"})
    })
})

var checkDuplicatedata =  async (userObj)=>{
    
    try{
        var data = await usermodel.findOne(userObj);
        if(data){
            return  {status:0};
        }else{
            return {status:1};
        }
    }catch(e){
        throw new Error('Some problem in function. Please wait. We are resolving');
    }
    
        
    }


module.exports = {
    authenticateToken,
    checkDuplicatedata
}