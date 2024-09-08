import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";



const connectDB = async () => {
    try{
       const connect = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected ! DB host: ${connect.connection.host}`);
        
    } catch(err){
        console.log("MongoDB Connection error", err);
        process.exit(1);
    }
}

export default connectDB;