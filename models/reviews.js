const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review:{
    type:String
  },
  productId:{
    type:Number
  },
  username:{
    type:String
  },
  stars:{
    type:Number
  },
  userId:{
    type:String
  },
  images:[{
    url:String,
    height:Number,
    width:Number,
    imageId:String
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


const Review = mongoose.model("Review",reviewSchema);
module.exports = Review