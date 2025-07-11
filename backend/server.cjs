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
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); 
const session = require("express-session")
const userRoutes = require("./routes/users")
const userProducts = require("./routes/products")
const userCategories = require("./routes/categories")
const userOrders = require("./routes/orders");
const { default: session } = require("express-session");


const app = express()

dotenv.config();

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
connectToMongoDB()



 const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false
        
    });



app.use(cors({
    // origin: "https://your-frontend-domian.com"
}));
app.use(session({
  secret: "yourSecretKey",
  resave: false,
  saveUninitialized: false,
}));

app.use(limiter);
app.use(express.json())
app.use(helmet())
app.use(morgan("dev"))
app.use(cookieParser())
app.use(compression())
app.use(mongoSanitize())
app.use(xss())
app.use("/api/users", userRoutes);
app.use("/api/products",userProducts)
app.use("/api/categories",userCategories)
app.use("/api/orders",userOrders)



app.listen()