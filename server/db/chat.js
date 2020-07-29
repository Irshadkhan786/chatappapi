var {usermodel} = require('./../user/user')
class Chat{
    onlineUSerList = [];
    constructor(){
        
    }
    async makeUserOnine(userData){
        var allUser = await usermodel.find()
        console.log(allUser)
    }
}

module.exports = {
    Chat
}