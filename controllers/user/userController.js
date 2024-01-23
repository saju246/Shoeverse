const { User } = require("../../models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const otpSetup = require("../../config/otpSetup");
const otpModel = require("../../models/otpModel");
const asynchandler = require("express-async-handler");
const product = require('../../models/productModel')
const category = require('../../models/categoryModel')



// ------------------------------------loadHome----------------------------------------
const loadIndex = asynchandler(async(req,res)=>{
  try{
    const listedCategories = await category.find({isListed:true});
    const listedCategoryIds = listedCategories.map((category)=>category._id)
    const topProduct = await product.find({categoryName: {$in:listedCategoryIds},isListed:true})
    .populate("images")
    .limit(8);
    // const banner = await Banner.find({isActive:true}).limit(1);
    res.render('./user/pages/index',{title:"SHOEVERSE",topProduct})

  }catch(error){
    throw new Error(error.message)
  }
})


//------------------------------------load register page--------------------------------
const loadRegister = async (req, res) => {
  try {
    res.render("./user/pages/register",{title:"SHOEVERSE"});
  } catch (error) {
    console.log(error.message);
  }
};

// --------------------------------------insert user Page-----------------------------------------

const insertUser = async (req, res) => {
  try {
    // const user = new User({
    //   firstName: req.body.firstName,
    //   lastName: req.body.lastName,
    //   email: req.body.email,
    //   mobile: req.body.mobile,
    //   password: req.body.password,
    // });

    // const userData = await user.save();

    // console.log(userData);

    // req.session.userData = userData;

    const email = req.body.email;
    // const existingUser = await User.findOne({ email: email });
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      const newUser = await User.create(req.body);
      req.session.userData = newUser;
      const OTP = otpSetup.generateNumericOTP();

      console.log(OTP);

      const email = newUser.email;
      console.log(email);
      const otp = await otpModel.create({ email: email, otp: OTP });

      const otpSend = otpSetup.sendOtp(email, OTP, req.body.firstName);

      if (newUser) {
        res.redirect("/verifyOtp");
      } else {
        res.render("register", {title:"SHOEVERSE",
          message: "Your registration has been failed.",
        });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};

//----------------------------------------- load otp-----------------------------------------

const loadOtp = async (req, res) => {
  try {
    const email = req.session.userData.email;

    console.log(req.session.userData);

    const messages = req.flash();

    res.render("./user/pages/verifyOtp", { title:"SHOEVERSE",email, messages });
  } catch (error) {
    console.log(error.message);
  }
};

// -----------------------------------------verify otp-----------------------------------------

const verifyOtp = async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    console.log(enteredOtp);

    const otpRecord = await otpModel.findOne({ otp: enteredOtp });
    if (otpRecord) {
      const verifyOtp = await User.findOneAndUpdate(
        { email: otpRecord.email },
        { $set: { isVerified: true } }
      );
      req.flash("success", "succesfully registered");
      res.redirect("/login");
    } else {
      req.flash("danger", "enter the valid otp");
      res.redirect("/verifyOtp");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("verify otp Error");
  }
};


// --------------------------------------------resend otp--------------------------------------

const resendOtp = asynchandler(async(req,res)=>{
  try{
    const OTP = otpSetup.generateNumericOTP();
    const email = req.session.userData.email;
    const otp = new otpModel({email:email,otp:OTP})
    const otpSave = await otp.save()
    const name = req.session.userData.name
    const otpSend = otpSetup.sendOtp(email,OTP,name)
    try{
      return res.redirect('/verifyOtp')
    }catch(error){
      throw new Error(error.message);
    }
  }catch(error){
    throw new Error(error.message);
  }
})
// -----------------------------------------load login-----------------------------------------

const loadLogin = async (req, res) => {
  try {
    const messages=req.flash()
    res.render("./user/pages/login",{title:"SHOEVERSE",messages});
  } catch (error) {
    console.log(error.message);
  }
};

// -----------------------------------------verify Login-----------------------------------------

const userLogin = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
  } catch (error) {
    console.log(error.message);
  }
});

// -----------------------------------------------logout-----------------------------------------------

const logout = asynchandler(async (req,res)=>{
  try{
    req.logout(function (err){
      if(err){
        next(err)
      }
    });
    res.redirect('/login')
  }catch(error){
    throw new Error(error.message)
  }
})

//-----------check email if already existing--------------------------------
const checkEmail = asynchandler(async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });

    if (existingEmail) {
      res.json("email already registered");
    } else {
      res.json("");
    }
  } catch (error) {
    throw new Error(error);
  }
});



module.exports = {
  loadIndex,
  loadRegister,
  insertUser,
  loadOtp,
  verifyOtp,
  resendOtp,
  loadLogin,
  userLogin,
  logout,
  checkEmail
};
