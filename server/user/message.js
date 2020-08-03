var mongoose = require('mongoose');
var messageScheema = mongoose.Schema({
    touserId:{
        type:String,
        require:true
    },
    fromuserId:{
        type:String,
        require:true
    },
    toEmail:{
        type:String,
        require:true
    },
    fromEmail:{
        type:String,
        require:true
    },
    message:{
        type:String,
        require:true
    },
    msg_date:{
        type:Date,
        require:true
    }
})

var msgmodel = new mongoose.model('chatmsg',messageScheema)
module.exports = {
    msgmodel
}