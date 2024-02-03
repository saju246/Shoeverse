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

// const session = require('express-session')
// const mongoDBSession=require('connect-mongodb-session')(session)
// const store=new mongoDBSession({
//     uri:process.env.MONGODB_URL,
//     collection:'user_session'
// })
// userRoute.use(session({
//     secret:process.env.SECRET,
//     resave:false,
//     saveUninitialized:false,
//     store:store
// }))

// ------------------------------auth methods-----------------------------

/*get methods*/

userRoute.get('/sample',userController.loadSample)
userRoute.get("/", userController.loadIndex);
userRoute.get("/register",ensureNotAuthenticated, userController.loadRegister);
userRoute.get("/login",ensureNotAuthenticated, userController.loadLogin);
userRoute.post('/resendOtp',ensureNotAuthenticated,userController.resendOtp);
userRoute.get("/verifyOtp", ensureNotAuthenticated,userController.loadOtp);
userRoute.get( "/sendEmail",ensureNotAuthenticated,userController.loadSendEmail);
userRoute.get( "/verifyEmail",ensureNotAuthenticated, userController.LoadVerifyEmail);
userRoute.get("/reverifyEmail",ensureNotAuthenticated,userController.reverifyEmail);
userRoute.get("/logout",ensureAuthenticated, userController.logout);
userRoute.get("/account", ensureAuthenticated, userController.loadAccount);
userRoute.post("/account", ensureAuthenticated, userController.editProfile);


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
userRoute.post("/sendEmail", userController.sendEmail);
userRoute.post("/verifyEmail", userController.verifyEmail);
userRoute.get("/forgotPassword", userController.loadforgotPassword);
userRoute.post("/forgotPassword", userController.forgotPassword);
userRoute.post("/resetPassword/:id", userController.resetPassword);
userRoute.get("/newPassword", userController.loadnewPassword);
userRoute.post("/newPassword", userController.newPassword);
userRoute.get("/changePassword",ensureAuthenticated,userController.changePassword);

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

userRoute.post("/checkout",ensureAuthenticated,checkoutController.checkoutpage);
userRoute.get('/checkout/get',ensureAuthenticated,checkoutController.getCartData);
userRoute.post('/placeOrder',checkoutController.placeOrder);
userRoute.get('/orderPlaced/:id',checkoutController.orderPlaced);
userRoute.post("/verifyPayment", checkoutController.verifyPayment);
userRoute.post("/update", checkoutController.updateCheckoutPage);

// ---------------------------------------address route---------------------------------------

userRoute.get('/addAddress',ensureAuthenticated,addressController.loadAddress)
userRoute.post('/addAddress',ensureAuthenticated,addressController.insertAddress)
userRoute.get('/savedAddress',ensureAuthenticated,addressController.loadSavedAddress)
userRoute.get('/editAddress/:id',validateID,ensureAuthenticated,addressController.loadEditAddress)
userRoute.post('/editAddress/:id',validateID,ensureAuthenticated,addressController.editAddress)
userRoute.delete('/deleteAddress/:id', validateID, ensureAuthenticated, addressController.deleteAddress);

// ------------------------------------order routes -----------------------------
userRoute.get("/order", ensureAuthenticated, orderController.orderspage);
userRoute.get("/orders/:id",ensureAuthenticated, orderController.singleOrder);
userRoute.put("/orders/:id",ensureAuthenticated, orderController.cancelOrder);
userRoute.get("/cancelOrder/:id", ensureAuthenticated,orderController.cancelSingleOrder);


module.exports = userRoute;
