const mongoose =require('mongoose')
var validator = require('validator');

const postSchema=new mongoose.Schema({

 desc:{
    type: 'string',
    maxLength:500,
    default:"",
    trim:true
 },
 image:{
    type: Array,
    default:[]
 },
 like:{
    type: Array,
    default:[]
 },
 comments:{
    type: Array,
    default:[]
 },
 
user:{
   type:mongoose.Types.ObjectId,
   ref:"User"
}

},{timestamps:true})
module.exports=mongoose.model('Post',postSchema)