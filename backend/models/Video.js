const mongoose = require('mongoose');

const vedioSchema= new mongoose.Schema({
    user_id:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    file_path:{type:String,required:true},
    created_at:{type:Date,default:Date.now},
})

module.exports= mongoose.model("video",vedioSchema)