const mongoose=require('mongoose');
// const { type } = require('os');
const bookSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    ISBN:
    {
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    review:{
        type:String,
        required:true   
    }

});
module.exports=mongoose.model('Book',bookSchema);