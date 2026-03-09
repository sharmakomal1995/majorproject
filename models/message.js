const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  text:String,

  sender:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  receiver:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },

  listing:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Listing"
  }

},{timestamps:true});

module.exports = mongoose.model("Message",messageSchema);