var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
mongoose.connect("mongodb://localhost:27017/socialsiyappa",{ useUnifiedTopology:true,useNewUrlParser:true}).then(()=>{
//mongoose.connect("mongodb+srv://mynodeapp:mynodeapp@cluster0-jekgp.mongodb.net/test?retryWrites=true&w=majority",{ useUnifiedTopology:true,useNewUrlParser:true}).then(()=>{
    console.log('Database connected successfully')
}).catch((e)=>{
    console.log('Unable to connect',e)
})
module.exports = {
    mongocon:mongoose
}