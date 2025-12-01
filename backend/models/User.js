const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{type:String,required:true,unique:true},
    role:{type:String,default:"user"},
});

module.exports= mongoose.model("user",userSchema);