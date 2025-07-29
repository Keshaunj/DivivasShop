const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");

const sanitizeMiddleware = require ('./middleware/sanitize')

const session = require("express-session");
const app = express();

const apiRouter = require('./routes'); 


dotenv.config();




const mongoURI = process.env.MONGODB_URI;

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI  is not defined in .env");
  process.exit(1);
}
async function connectToMongoDB() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
connectToMongoDB();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(
  cors({
    // origin: "https://your-frontend-domian.com"
  })
);

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(morgan);
app.use(express.json());
app.use(cookieParser());
app.use(sanitizeMiddleware);

app.use(helmet());
app.use(compression());



app.use('/api', apiRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});






