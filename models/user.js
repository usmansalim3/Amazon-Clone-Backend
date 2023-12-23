// const mongoose= require('mongoose');


// const userSchema=new mongoose.Schema({
//     email:{
//         type:String,
//         required:true
//     },
//     password:{
//         type:String,
//         required:true
//     },
//     phoneNumber:{
//         type:Number,
//         required:true
//     },
//     chat:Array,
//     images:Array,
//     pfp:String,
//     walletAddress:String,
//     walletPrivateKey:String,
//     transactions:Array,
//     otp:Number
// },{timestamps:true});
// const userCollection= mongoose.model('user',userSchema);
// module.exports=userCollection;
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  verificationToken: String,
  addresses: [
    {
      name: String,
      mobileNo: String,
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      country: String,
      postalCode: String,
      addressID: String 
    },
  ],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  defaultAddress:{
      name: String,
      mobileNo: String,
      houseNo: String,
      street: String,
      landmark: String,
      city: String,
      country: String,
      postalCode: String,
      addressID: String
  },
  cart:[{
      id: Number,
      title: String,
      price: Number,
      description: String,
      category: String,
      image: String,
      rating: {
        rate: Number,
        count: Number,
      },
      quantity: Number,
  }],
  wishlist:[
    {
      id: Number,
      title: String,
      price: Number,
      description: String,
      category: String,
      image: String,
      rating: {
        rate: Number,
        count: Number,
      }
  }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User",userSchema);

module.exports = User