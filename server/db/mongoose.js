var mongoose = require('mongoose');
mongoose.connect("mongodb+srv://mynodeapp:mynodeapp@cluster0-jekgp.mongodb.net/test?retryWrites=true&w=majority",{ useUnifiedTopology:true,useNewUrlParser:true}).then(()=>{
    console.log('Database connected successfully')
}).catch((e)=>{
    console.log('Unable to connect',e)
})
module.exports = {
    mongocon:mongoose
}