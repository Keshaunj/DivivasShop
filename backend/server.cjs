const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); 
const mongoose = require("mongoose");

const app = express()

dotenv.config

const mongoURI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;


if(!process.env.MONGODB_URI){
    console.error("MONGODB_URI  is not defined in .env")
    process.exit(1)
}
async function connectToMongoDB(){
  try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}
connectToMongoDB




app.listen()