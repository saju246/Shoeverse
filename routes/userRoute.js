const express = require("express");
const userRoute = express();
const userController = require("../controllers/user/userController");
const shopController = require('../controllers/user/shopController')
const cartController = require('../controllers/user/cartController');
const checkoutController = require('../controllers/user/checkoutController')
const addressController = require('../controllers/user/addressController')
const orderController = require('../controllers/user/orderController')
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const {
  ensureAuthenticated,
  ensureNotAuthenticated,
}
=require("../middleware/userAuth");

const { validateID } = require("../middleware/idValidation");
const { validate } = require("../models/addressModel");

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

userRoute.get('/viewProduct/:id',validateID,shopController.loadProductDetails)

// ----------------------------usercart page------------------------------------

userRoute.get('/cart',ensureAuthenticated,cartController.loadCart)
userRoute.get("/cart/add/:id",validateID,ensureAuthenticated,cartController.addToCart);
userRoute.get('/cart/remove/:id',validateID,ensureAuthenticated,ensureAuthenticated,cartController.removeProduct);
userRoute.get('/cart/inc/:id',validateID,ensureAuthenticated,cartController.incQuantity);
userRoute.get('/cart/dec/:id',validateID,ensureAuthenticated,cartController.decQuantity);
userRoute.get('/getCartCount',ensureAuthenticated,cartController.getCartCount);
userRoute.get('/checkProductAvailability',ensureAuthenticated,cartController.checkProductAvailability);


// --------------------------------checkout page-----------------------------------

userRoute.post("/checkout",ensureAuthenticated,checkoutController.checkoutPage);
userRoute.get('/checkout/get',ensureAuthenticated,checkoutController.getCartData);
userRoute.post('/placeOrder',checkoutController.placeOrder);
userRoute.get('/orderPlaced/:id',checkoutController.orderPlaced);

// ---------------------------------------address route---------------------------------------

userRoute.get('/addAddress',ensureAuthenticated,addressController.loadAddress)
userRoute.post('/addAddress',ensureAuthenticated,addressController.insertAddress)
userRoute.get('/savedAddress',ensureAuthenticated,addressController.loadSavedAddress)
userRoute.get('/editAddress/:id',validateID,ensureAuthenticated,addressController.loadEditAddress)
userRoute.post('/editAddress/:id',validateID,ensureAuthenticated,addressController.editAddress)
userRoute.delete('/deleteAddress/:id', validateID, ensureAuthenticated, addressController.deleteAddress);

// ------------------------------------order routes -----------------------------



module.exports = userRoute;
