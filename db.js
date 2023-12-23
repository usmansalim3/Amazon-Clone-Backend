const mongoose=require('mongoose');
require('dotenv').config();

module.exports=async function connectDB(){
    try{
        mongoose.set('strictQuery', true);
        await mongoose.connect(process.env.MONGO_URI,()=>console.log('connected to mongoDB'));
    }
    catch(error){
        console.log(error);
    }
}