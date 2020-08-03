var {usermodel} = require('./../user/user');
var mongoose = require('mongoose');
var {msgmodel} = require('./../user/message');
const e = require('express');
class Chat{
    
    dbUserList = Array();
    onlineUser = Array();
    userCount;
    constructor(){

    }

    
    getDbUserList(){
       return usermodel.find({status:1},{_id:1,name:1,email:1,contact:1,last_seen:1}).then((allusers)=>{
        var userObject = JSON.parse(JSON.stringify(allusers));
        userObject = userObject.filter((obj)=>{
            obj.online="no";
            obj.socketid="no";
            return obj;
        })
        return userObject;
       }).catch((e)=>{
            console.log('error in fetching user from db')
       })
    }
    getOnlineUsers(){
        return this.onlineUser;
    }
    makeOnlineUser(alluserArray,userObj){
        var updatedUser = alluserArray.filter((obj)=>{
            if(obj._id == userObj.userAutoId){
                obj.online = "yes";
                obj.last_seen = new Date();
                obj.socketid = userObj.socketid;
            }
            return obj;
        })
        this.onlineUser = updatedUser;
        return  this.onlineUser;
    }
    pushNewUser(userObj){
        return usermodel.find({status:1,_id:mongoose.Types.ObjectId(userObj.userAutoId)},{_id:1,name:1,email:1,contact:1,last_seen:1}).then((oneUser)=>{
            var userObject = JSON.parse(JSON.stringify(oneUser));
            userObject = userObject.filter((obj)=>{
                obj.online="no";
                obj.socketid="no";
                return obj;
            })
            this.onlineUser.push(userObject[0]);
            return this.onlineUser;
           }).catch((e)=>{
                console.log('error in fetching single user from db')
           })
    }
    makeUserOffile(userObj){
        var last_seen_time = new Date();
        usermodel.findOneAndUpdate({_id:mongoose.Types.ObjectId(userObj._id)},{last_seen:last_seen_time}).then((updRes)=>{

        });
        this.onlineUser =  this.onlineUser.filter((obj)=>{
            if(obj._id==userObj._id){
                obj.online = "no",
                obj.last_seen = last_seen_time
            }
            return obj;
        })
        return this.onlineUser;
    }
    searchUserBySocketId(socketid){
       
         var matchedUser =  this.onlineUser.filter((userObj)=>{
            if(userObj.socketid==socketid){
                return userObj;
            }
        })
        return matchedUser;
    }
    saveChatData(data){
        let chatData = new msgmodel({
            touserId:data.touserId,
            toEmail:data.touserEmail,
            fromuserId:data.fromuserId,
            fromEmail:data.fromuserEmail,
            message:data.message,
            msg_date:data.time
        })
        return chatData.save().then((res)=>{
            return res;
        }).catch((e)=>{
            return "error";
        })
    }
}

module.exports = {
    Chat
}