// Importing required modules
const express = require("express");
const connectDatabase = require("./config/database");
const path = require("path");
const dotenv = require("dotenv");
const nocache = require("nocache");
const session = require("express-session");
const mongoose = require("mongoose");
const morgan = require("morgan");
const flash = require("connect-flash");
const passport = require("passport");
const override = require("method-override");
const expressLayouts = require('express-ejs-layouts')
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Load environment variables from a .env file
dotenv.config();

// Create Express app
const app = express();

// Connect to the database
connectDatabase();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));

// Set up EJS for rendering views
app.use(expressLayouts)

app.set("view engine", "ejs");

app.set('views', path.join(__dirname, "./views"));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "./public")));

app.use(flash());
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    // store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport");


app.use(override("_method"));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


// Add nocache middleware
app.use(nocache());



// Include express-ejs-layouts middleware

// Routes
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);


const adminRoute = require('./routes/adminRoute');
app.use('/admin',adminRoute)

app.use(errorHandler);


// Set the port
const PORT = process.env.PORT || 4000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server Started 🚀 http://localhost:${PORT}`);
});
