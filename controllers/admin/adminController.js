const { User } = require("../../models/userModel");
const asynchandler = require("express-async-handler");

require("dotenv").config();

// ---------------------------------------load login--------------------------------------

const loadLogin = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./admin/pages/login", {title: "WATCHBOX/LOGIN",  messages });
  } catch (error) {
    throw new Error(error);
  }
});

// ---------------------------------------verify admin-------------------------------------

const verifyAdmin = async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASS;

    const emailCheck = req.body.email;
    const user = await User.findOne({ email: emailCheck });
    console.log(user);

    if (user) {
      req.flash("danger", "you are not admin");
      res.redirect("/admin");
    } else if (emailCheck === email && req.body.password === password) {
      req.session.admin = email;
      res.redirect("./admin/index");
    } else {
      req.flash("danger", "Check email and password");
      res.redirect("/admin");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// ---------------------------------------load index-------------------------------------
const loadIndex = asynchandler(async (req, res) => {
  try {
    res.render("./admin/pages/index",{ title: "WATCHBOX/INDEX"});
  } catch (error) {
    throw new Error(error);
  }
});

// ---------------------------------------usermanagement-------------------------------------

const usermanagement = asynchandler(async (req, res) => {
  try {
    const findUsers = await User.find();
    res.render("./admin/pages/userlist", {
      title: "WATCHBOX/USERLIST",
      users: findUsers,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// -----------------------------------------block user---------------------------------

const blockUser = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    await User.findByIdAndUpdate(id, { isBlock: true }, { new: true });

    res.redirect("/admin/userlist");
  } catch (error) {
    throw new Error(error.message);
  }
});


// ----------------------------------------unblock user----------------------------------------------

const unblockUser = asynchandler(async(req,res)=>{
    try{
        const id = req.params.id;
        await User.findByIdAndUpdate(id,{isBlock : false},{new:true})
        res.redirect('/admin/userlist')
    }catch(error){
        throw new Error(error.message)
    }
})

//-------------------logout---------------- --------------------------------

const logout = asynchandler(async (req, res) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    throw new Error(error);
  }
});





module.exports = {
  loadLogin,
  verifyAdmin,
  loadIndex,
  usermanagement,
  blockUser,
  unblockUser,
  logout,
};
