const express = require("express");
const userRoute = express();
const userController = require("../controllers/user/userController");
const shopController = require('../controllers/user/shopController')
const cartController = require('../controllers/user/cartController');
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const {
  ensureAuthenticated,
  ensureNotAuthenticated,
}
=require("../middleware/userAuth");
const { validate } = require("../models/cartModel");

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

// ----------------------------usercart page------------------------------------

userRoute.get('/cart',ensureAuthenticated,cartController.loadCart)
userRoute.get("/cart/add/:id",ensureAuthenticated,cartController.addToCart);
userRoute.get('/cart/remove/:id',ensureAuthenticated,ensureAuthenticated,cartController.removeProduct);
userRoute.get('/cart/inc/:id',ensureAuthenticated,cartController.incQuantity);
userRoute.get('/cart/dec/:id',ensureAuthenticated,cartController.decQuantity);
userRoute.get('/getCartCount',ensureAuthenticated,cartController.getCartCount);
userRoute.get('/checkProductAvailability',ensureAuthenticated,cartController.checkProductAvailability);


module.exports = userRoute;
