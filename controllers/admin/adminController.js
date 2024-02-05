const { User } = require("../../models/userModel");
const asynchandler = require("express-async-handler");
const Product = require('../../models/productModel')
const Orders = require('../../models/orderModel')
const graphHelpers = require('../../helpers/graphHelper');

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
    const [orderResult, soldResult, totalProductsResult, totalUsersResult] =
      await Promise.all([
        Orders.aggregate([
          {
            $group:{
              _id:null,
              totalOrders : {$sum:1},
            },
          },
        ]),
        Product.aggregate([
          {
            $group:{
              _id:null,
              totalProducts:{$sum:"$sold"},
            },
          },
        ]),
        Product.aggregate([
          {
            $group:{
              _id:null,
              totalQuantity:{$sum:"$quantity"},
            },
          },
        ]),
        User.aggregate([{$group: {_id:null,totalUsers:{$sum:1}}}]),
      ]);
      const totalOrders = orderResult.length>0?orderResult[0].totalOrders : 0;
      console.log("total orders",totalOrders);
      const soldCount = soldResult.length>0?soldResult[0].totalProducts : 0;
      console.log("soldCount",soldCount);
      const totalQuantity = totalProductsResult.length>0?totalProductsResult[0].totalQuantity : 0;
      console.log("totalQuantity",totalQuantity);
      const totalUsers = totalUsersResult.length>0?totalUsersResult[0].totalUsers : 0;
      console.log("totalUsers",totalUsers)
 
      // -----------------------graph details -----------------------
      const usersData = await graphHelpers.countUsers();
      console.log("usersData",usersData);
      const productSold = await graphHelpers.calculateProductSold();
      console.log("productSold",productSold)

    res.render("./admin/pages/index",{
       title: "SHOEVERSE/INDEX",
       soldCount,
       totalOrders,
       totalQuantity,
       totalUsers,
       usersData,
       productSold,
      });
  } catch (error) {
    throw new Error(error);
  }
});

// ---------------------------------------usermanagement-------------------------------------

const usermanagement = asynchandler(async (req, res) => {
  try {
    const [orderResult, soldResult, totalProductsResult, totalUsersResult] =
      await Promise.all([
        Orders.aggregate([
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
            },
          },
        ]),
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalProducts: { $sum: "$sold" },
            },
          },
        ]),
        Product.aggregate([
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$quantity" },
            },
          },
        ]),
        User.aggregate([{ $group: { _id: null, totalUsers: { $sum: 1 } } }]),
      ]);

    const totalOrders = orderResult.length > 0 ? orderResult[0].totalOrders : 0;
    const soldCount = soldResult.length > 0 ? soldResult[0].totalProducts : 0;
    const totalQuantity =
      totalProductsResult.length > 0 ? totalProductsResult[0].totalQuantity : 0;
    const totalUsers =
      totalUsersResult.length > 0 ? totalUsersResult[0].totalUsers : 0;

    //-------------graph deatails----------------------------

    const usersData = await graphHelpers.countUsers();
    const productSold = await graphHelpers.calculateProductSold();
    console.log(productSold,"........................");

    res.render("./admin/pages/userlist", {
      title: "SHOEVERSE/USERLIST",
      soldCount,
      totalOrders,
      totalQuantity,
      totalUsers,
      usersData,
      productSold,
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
