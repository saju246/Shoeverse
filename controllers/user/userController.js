const { User } = require("../../models/userModel");
const bcrypt = require("bcrypt");
require("dotenv").config();
const otpSetup = require("../../config/otpSetup");
const otpModel = require("../../models/otpModel");
const asynchandler = require("express-async-handler");
const product = require("../../models/productModel");
const category = require("../../models/categoryModel");
const Orders = require("../../models/orderModel");
const crypto = require("crypto");
// ------------------------------------loadHome----------------------------------------
const loadIndex = asynchandler(async (req, res) => {
  try {
    const listedCategories = await category.find({ isListed: true });
    const listedCategoryIds = listedCategories.map((category) => category._id);
    const topProduct = await product
      .find({ categoryName: { $in: listedCategoryIds }, isListed: true })
      .populate("images")
      .limit(8);
    // const banner = await Banner.find({isActive:true}).limit(1);
    res.render("./user/pages/index", { title: "SHOEVERSE", topProduct });
  } catch (error) {
    throw new Error(error.message);
  }
});

//------------------------------------load register page--------------------------------
const loadRegister = async (req, res) => {
  try {
    res.render("./user/pages/register", { title: "SHOEVERSE" });
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
        res.render("register", {
          title: "SHOEVERSE",
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

    res.render("./user/pages/verifyOtp", {
      title: "SHOEVERSE",
      email,
      messages,
    });
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

const resendOtp = asynchandler(async (req, res) => {
  try {
    const OTP = otpSetup.generateNumericOTP();
    const email = req.session.userData.email;
    const otp = new otpModel({ email: email, otp: OTP });
    const otpSave = await otp.save();
    const name = req.session.userData.name;
    const otpSend = otpSetup.sendOtp(email, OTP, name);
    try {
      return res.redirect("/verifyOtp");
    } catch (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    throw new Error(error.message);
  }
});
// -----------------------------------------load login-----------------------------------------

const loadLogin = async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/login", { title: "SHOEVERSE", messages });
  } catch (error) {
   throw new Error(error)
  }
};

// -----------------------------------------verify Login-----------------------------------------

const userLogin = asynchandler(async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
  } catch (error) {
    throw new Error(error)
  }
});

// -----------------------------------------------logout-----------------------------------------------

const logout = asynchandler(async (req, res) => {
  try {
    req.logout(function (err) {
      if (err) {
        next(err);
      }
    });
    res.redirect("/login");
  } catch (error) {
    throw new Error(error.message);
  }
});

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

// -----------------------------account page loader----------------------------------------

const loadAccount = asynchandler(async (req, res) => {
  try {
    const user = req.user;
    console.log(user);
    const order = await Orders.findOne({ user: req.user._id }).count();
    res.render("./user/pages/account", { title: "SHOEVERSE", order });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------edit the profile page------------------------

const editProfile = asynchandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findOne({ _id: userId });

    const newFirstName = req.body.firstName;
    const newMobile = req.body.mobile;
    
    // console.log(newFirstName); // Fix the typo here
    // console.log(newMobile);
    // Update the user's information.
    user.firstName = newFirstName;
    user.mobile = newMobile;
    
    await user.save();
    // Return a success response.
    console.log(user.firstName)
    console.log(user.mobile)
    res.redirect("/account");

  } catch (error) {
    throw new Error(error);
  }
});

//-------------------load--sendEmail----------------------------------------------------------------
const loadSendEmail = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/verifyOtp", { title: "SHOEVERSE ", messages });
  } catch (error) {
    throw new Error(error);
  }
});


//-------------------sendEmail----------------------------------------------------------------
const sendEmail = asynchandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email }); //---------------checking email already registered-----------------------

    if(!user){
      req.flash("danger", "please register first");
      res.redirect("/sendEmail");
    }

   else if (user.isVerified) {
      req.flash("danger", "you are already verified");
      res.redirect("/sendEmail");
    } else {
      req.session.verifyEmail = email;
      const OTP = otpSetup.generateNumericOTP();
      const otp = new otpdb({ email: email, otp: OTP });
      const otpSave = await otp.save();
      const name = user.firstName;
      const otpSend = otpSetup.sendOtp(email, OTP, name);
      try {
        res.redirect("/verifyEmail");
      } catch (error) {
        throw new Error(error);
      }
    }
  } catch (error) {
    throw new Error(error);
  }
});


//-----------------------load verify email----------------------------------

const LoadVerifyEmail = asynchandler(async (req, res) => {
  try {
    const email = req.session.verifyEmail;
    const messages = req.flash();
    res.render("./user/pages/emailVerification", {
      title: "SHOEVERSE",
      email,
      messages,
    });
  } catch (error) {
    throw new Error(error);
  }
});

//--------------------------verifyEmail------------------------

const verifyEmail = asynchandler(async (req, res) => {
  try {
    const enteredOtp = req.body.otp;
    const otpRecord = await otpdb.findOne({ otp: enteredOtp });
    if (otpRecord) {
      const verifyOtp = await User.findOneAndUpdate(
        { email: otpRecord.email },
        { $set: { isVerified: true } }
      );
      req.flash("success", "succesfully registered");
      res.redirect("/login");
    } else {
      req.flash("danger", "enter a valid otp");
      res.redirect("/verifyEmail");
    }
  } catch (error) {
    throw new Error(error);
  }
});


//----------------------------------resend verify email--------------------------------

const reverifyEmail = asynchandler(async (req, res) => {
  try {
    const OTP = otpSetup.generateNumericOTP();
    email = req.session.verifyEmail;
    const otp = new otpdb({ email: email, otp: OTP });
    const otpSave = await otp.save();
    const user = await User.findOne({ email: email });
    const otpSend = otpSetup.sendOtp(email, OTP, user.firstName);
    try {
      return res.redirect("/verifyEmail");
    } catch (error) {
      throw new Error(error);
    }
  } catch (error) {
    throw new Error(error);
  }
});



//--------------load forgot password ----------------------------

const loadforgotPassword = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./user/pages/forgotPassword", { title:"WAT", messages });
  } catch (error) {
    throw new Error(error);
  }
});

// post method forgot----------------------

const forgotPassword = asynchandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("danger", "enter a registered email addresss");
      res.redirect("back");
    } else {
      //generate a random reset token-------------------
      const resetToken = await user.createResetPasswordToken();
      await user.save();
      const name = user.firstName;
      const sendToken = await otpSetup.sendToken(email, resetToken, name);
      req.flash('success',"verify link send to the email address")
      res.redirect('/forgotPassword')
    }
  } catch (error) {
    throw new Error(error);
  }
});

//----------------------email check-------------------------

const emailcheck = asynchandler(async (req, res) => {
  try {
    const existingEmail = await User.findOne({ email: req.body.email });

    if (!existingEmail) {
      res.json("please register your email address");
    } else {
      res.json("");
    }
  } catch (error) {
    throw new Error(error);
  }
});


//-------------------------reset password -----------------------------------

const resetPassword = asynchandler(async (req, res) => {
  try {
    const resetToken = req.params.id; //accessing the token

    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const tokenCheck = await User.findOne({ passwordResetToken });
    const time = tokenCheck.passwordResetTokenExpires;
    if (time < Date.now()) {
      // The reset token has expired
      req.flash("danger", "the link expired,try new one");
      res.redirect("/forgotPassword");
    } else {
      // The reset token is still valid
      req.session.email = tokenCheck.email;
      res.redirect("/newPassword");
    }
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------load the new password --------------------------------

const loadnewPassword = asynchandler(async (req, res) => {
  try {
    res.render("./user/pages/newPassword", {title:"SHOEVERSE"});
  } catch (error) {
    throw new Error(error);
  }
});

//---------------------------setting the new password --------------------------------

const newPassword = asynchandler(async (req, res) => {
  try {
    const newPassword = req.body.newPassword;
    const email = req.session.email;
    const user = await User.findOne({ email });
    if (user) {
      
      const password = newPassword;
      user.password = password;
      user.passwordChangedAt = Date.now();
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save();
      req.session.email = null;
      res.redirect("/login");
    } else {
      res.json("some internal error" + user);
    }
  } catch (error) {
    throw new Error(error);
  }
});



//-----------------------changing password page --------------------

const changePassword = asynchandler(async (req, res) => {
  try {
    const email = req.user.email;
    const user = await User.findOne({ email: email });
    const resetToken = await user.createResetPasswordToken();
    await user.save();
    const name = user.firstName;
    const sendToken = await otpSetup.sendToken(email, resetToken, name);

    // Sending a response back to the client
    res.status(200).json({ message: "Password change initiated successfully" });
  } catch (error) {
    // Handle errors and send an error response
  throw new Error(error)
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
  checkEmail,
  loadAccount,
  editProfile,
  loadSendEmail,
  sendEmail,
  LoadVerifyEmail,
  verifyEmail,
  reverifyEmail,
loadforgotPassword,
forgotPassword,
emailcheck,
resetPassword,
loadnewPassword,
newPassword,
changePassword
};
