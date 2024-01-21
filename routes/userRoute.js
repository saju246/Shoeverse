const express = require("express");
const userRoute = express();
const userController = require("../controllers/user/userController");
const shopController = require('../controllers/user/shopController')
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const {
  ensureAuthenticated,
  ensureNotAuthenticated,
}
=require("../middleware/userAuth")

userRoute.set('layout','./user/includes/layout.ejs')

// ------------------------------auth methods-----------------------------

/*get methods*/


userRoute.get("/", userController.loadIndex);
userRoute.get("/register",ensureNotAuthenticated, userController.loadRegister);
userRoute.get("/login",ensureNotAuthenticated, userController.loadLogin);
userRoute.get('/resendOtp',ensureNotAuthenticated,userController.resendOtp);
userRoute.get("/verifyOtp", ensureNotAuthenticated,userController.loadOtp);
userRoute.get("/logout",ensureAuthenticated, userController.logout);



/*post methods*/


userRoute.post("/register", userController.insertUser);
userRoute.post(
  "/login",ensureNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash:true,
  })
);
userRoute.post("/verifyOtp", userController.verifyOtp);
userRoute.post("/checkEmail", userController.checkEmail);
userRoute.post("/logout",  userController.logout);



// ------------------------shop page----------------------------------

userRoute.get('/shop',shopController.loadShop);


// ----------------------product details page -------------------------

userRoute.get('/viewProduct/:id',shopController.loadProductDetails)


module.exports = userRoute;
