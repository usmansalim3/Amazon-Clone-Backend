// const express=require('express');
const connect = require('./db');
// const flicksterRouter=require("./Routers/log/firebaseLog")
// const moviesRouter=require("./Routers/movies")
// const cors = require('cors');
// const app=express();

// app.use(cors());
// app.use(express.json({limit: '50mb'}));


// app.use('/flickster',flicksterRouter);
// app.use('/movies',moviesRouter)


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
app.listen(3000, () => {
    console.log("Server is running on port");
});
connect();
// mongoose
//   .connect("mongodb+srv://sujananand:sujan@cluster0.cueelai.mongodb.net/", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("Connected to MongoDB");
//   })
//   .catch((err) => {
//     console.log("Error connecting to MongoDb", err);
//   });

const User = require("./models/user");
const Order = require("./models/order");
const { default: axios } = require('axios');
const Review = require('./models/reviews');


app.get("/",(req,res)=>{
  res.json({message:"done"})
})
// const sendVerificationEmail = async (email, verificationToken) => {
//   // Create a Nodemailer transporter
//   const transporter = nodemailer.createTransport({
//     // Configure the email service or SMTP details here
//     service: "gmail",
//     auth: {
//       user: "sujananand0@gmail.com",
//       pass: "wkkjjprzkqxtboju",
//     },
//   });

//   // Compose the email message
//   const mailOptions = {
//     from: "amazon.com",
//     to: email,
//     subject: "Email Verification",
//     text: `Please click the following link to verify your email: http://localhost:8000/verify/${verificationToken}`,
//   };

//   // Send the email
//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Verification email sent successfully");
//   } catch (error) {
//     console.error("Error sending verification email:", error);
//   }
// };
// Register a new user
// ... existing imports and setup ...

app.post("/register", async (req, res) => {
    console.log("her")
  try {
    const { name, email, password } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered:", email); // Debugging statement
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new user
    const newUser = new User({ name, email, password });

    // Generate and store the verification token
    newUser.verificationToken = crypto.randomBytes(20).toString("hex");

    // Save the user to the database
    await newUser.save();

    // Debugging statement to verify data
    console.log("New User Registered:", newUser);

    // Send verification email to the user
    // Use your preferred email service or library to send the email
    // sendVerificationEmail(newUser.email, newUser.verificationToken);

    res.status(201).json({
      message:
        "Registration successful",
    });
  } catch (error) {
    console.log("Error during registration:", error); // Debugging statement
    res.status(500).json({ message: "Registration failed" });
  }
});

//endpoint to verify the email
app.get("/verify/:token", async (req, res) => {
  try {
    const token = req.params.token;

    //Find the user witht the given verification token
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "Invalid verification token" });
    }

    //Mark the user as verified
    user.verified = true;
    user.verificationToken = undefined;

    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Email Verificatioion Failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

//endpoint to login the user!
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email,password)
    //check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //check if the password is correct
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    //generate a token
    const token = jwt.sign({ userId: user._id }, secretKey);
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Login Failed" });
  }
});

//endpoint to store a new address to the backend
app.post("/addresses", async (req, res) => {
  try {
    const { userId, address } = req.body;

    //find the user by the Userid
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //add the new address to the user's addresses array
    address.addressID=crypto.randomUUID()
    user.addresses.push(address);

    //save the updated user in te backend
    await user.save();

    res.status(200).json({ message: "Address created Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error addding address" });
  }
});

app.get('/addresses/removeAddress/:userId/:addressID',async (req,res)=>{
  const {userId,addressID} = req.params;
  console.log("call")
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newAddresses=user.addresses.filter((add)=>add.addressID!=addressID);
    user.addresses=newAddresses;
    if(user.defaultAddress?.addressID==addressID){
      user.defaultAddress={}
    }
    await user.save();
    res.status(200).json({ message: "Address deleted Successfully" });
    }
    catch(e){
      res.status(500).json({ message: "Error removing address" });
    }
  })

app.post('/addresses/setDefault',async (req,res)=>{
  const {userId,address} = req.body;
  try{
    console.log(address)
    const user = await User.findById(userId);
    
    user.defaultAddress=address;
    
    await user.save();
    
    res.status(200).json({ message: "Address marked Successfully" });
  }catch(error){
    res.status(500).json({ message: "Error addding address" });
  }
})

//endpoint to get all the addresses of a particular user
app.get("/addresses/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addresses = user.addresses;
    res.status(200).json({ addresses });
  } catch (error) {
    res.status(500).json({ message: "Error retrieveing the addresses" });
  }
});

//endpoint to store all the orders
app.post("/orders", async (req, res) => {
  try {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //create an array of product objects from the cart Items
    const products = cartItems.map((item) => ({
      name: item?.title,
      quantity: item.quantity,
      price: item.price,
      image: item?.image,
    }));

    //create a new Order
    const order = new Order({
      user: userId,
      products: cartItems,
      totalPrice: totalPrice,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
    });
    user.cart=[];
    await user.save();
    await order.save();

    res.status(200).json({ message: "Order created successfully!" });
  } catch (error) {
    console.log("error creating orders", error);
    res.status(500).json({ message: "Error creating orders" });
  }
});

app.get("/reviews/:productId",async(req,res)=>{
  const {productId}=req.params;
  console.log(productId)
  try{
    const result=await Review.find({productId});
    res.status(200).json({result})
  }catch(e){
    res.status(500).json({ message: "error retrieving reviews" });
  }
})

app.post("/reviews/write",async(req,res)=>{
  try{
    const{userId,userName,review,stars,productId,images}=req.body;

    console.log(req.body)
    const reviewObject=new Review({
      userId,
      productId,
      stars,
      review,
      username:userName,
      images
    })
    await reviewObject.save();
    res.status(200).json({message:"submitted"});
  }catch(e){
    console.log(e.message)
    res.status(500).json({ message: "Error creating review" });
  }

})
//get the user profile
app.get("/profile/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving the user profile" });
  }
});

app.get("/orders/:userId",async(req,res) => {
  try{
    const userId = req.params.userId;

    const orders = await Order.find({user:userId}).populate("user");

    if(!orders || orders.length === 0){
      return res.status(200).json({orders:[]})
    }

    res.status(200).json({ orders });
  } catch(error){
    res.status(500).json({ message: "Error"});
  }
})

app.get('/cart/getCart/:userId',async (req,res)=>{
  const {userId}=req.params;
  try{
    const user = await User.findById(userId);
    res.status(200).json({cart:user.cart})
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.post('/cart/add',async (req,res)=>{
  const {item,userId}=req.body;
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.cart.push(item);
    await user.save();
    res.status(200).json({ message:"item added successfully" });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.post("/cart/increase",async (req,res)=>{
  const {userId,itemId}=req.body
  try{
    const user = await User.findById(userId);
    const itemFound=user.cart.find(item=>item.id==itemId);
    itemFound.quantity++;
    await user.save();
    res.status(200).json({ message:"item++ successfully" });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.post("/cart/decrease",async (req,res)=>{
  const {userId,itemId}=req.body
  try{
    const user = await User.findById(userId);
    const itemFound=user.cart.find(item=>item.id==itemId);
    itemFound.quantity--;
    await user.save();
    res.status(200).json({ message:"item-- successfully" });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.post('/cart/remove',async(req,res)=>{
  const {userId,itemId}=req.body;
  try{
    const user = await User.findById(userId);
    const newCart= user.cart.filter(item=>item.id!==itemId);
    user.cart=newCart;
    user.save();
    res.status(200).json({ message:"item removed successfully" });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.post("/products/filter",async(req,res)=>{
  try{
    const {stars,lowest,highest,query,category,limit}=req.body;
    console.log(req.body)
    if(category==undefined||category==null){
    category="";
  }
  if(lowest==undefined||lowest==null){
    lowest=0;
  }else if(highest==undefined||highest==null){
    highest=100000000;
  }
  const url=`http://fakestoreapi.com/products${category?"/category/"+category:""}?limit=${limit}`;
  console.log(url);
  let {data} = await axios.get(url);
  data=data.filter(product=>product.price>=lowest&&product.price<=highest);
  if(stars!=undefined||stars!=null){
    data=data.filter(product=>product.rating.rate>=stars);
    // https://fakestoreapi.com/products?limit=5
  }
  console.log(data)
  res.json({products:data});

}catch(e){
  console.log(e.message)
}
})

app.post("/wishlist/add",async (req,res)=>{
  const {item,userId}=req.body;
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const found=user.wishlist.find(wish=>wish.id==item.id);
    if(found){
      res.status(200).json({ message:"item in wish successfully",success:false });
    }
    //user.wishlist.push(item);
    //await user.save();
    res.status(200).json({ message:"item in wish successfully",success:true });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.get("/wishlist/remove/:userId/:itemId",async(req,res)=>{
  const {userId,itemId}=req.params
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(user.wishlist.length)
    user.wishlist=user.wishlist.filter(wish=>wish.id!=itemId)
    console.log(user.wishlist.length)
    await user.save();
    res.status(200).json({ message:"item in wish removed successfully" });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.get("/wishlist/:userId",async(req,res)=>{
  const userId=req.params.userId
  try{
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ wishlist:user.wishlist });
  }catch(e){
    console.log(e);
    res.status(500).json({ message: "Error"});
  }
})

app.listen(5000,()=>console.log('Server is up'));