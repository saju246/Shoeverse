const { User } = require("../../models/userModel");
const asynchandler = require("express-async-handler");
const Product = require('../../models/productModel')
const Orders = require('../../models/orderModel')
const graphHelpers = require('../../helpers/graphHelper');
const numeral = require('numeral')
require("dotenv").config();
const Order = require('../../models/orderModel')
const moment = require('moment');

// ---------------------------------------load login--------------------------------------

const loadLogin = asynchandler(async (req, res) => {
  try {
    const messages = req.flash();
    res.render("./admin/pages/login", {title: "SHOEVERSE/LOGIN",  messages });
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





// loadDashboard---  
const loadIndex = asynchandler(async (req, res) => {
  try {
      const messages = req.flash();
      const user = req?.user;
      const recentOrders = await Order.find()
          .limit(5)
          .populate({
              path: "user",
              select: "firstName lastName image",
          })
          .populate("orderItems")
          .select("totalAmount orderedDate totalPrice")
          .sort({ _id: -1 });

      let totalSalesAmount = 0;
      recentOrders.forEach((order) => {
          totalSalesAmount += order.totalPrice;
      });

      totalSalesAmount = numeral(totalSalesAmount).format("0.0a");

      const totalSoldProducts = await Product.aggregate([
          {
              $group: {
                  _id: null,
                  total_sold_count: {
                      $sum: "$sold",
                  },
              },
          },
      ]);

      const totalOrderCount = await Order.countDocuments();
      const totalActiveUserCount = await User.countDocuments({ isBlock: false });

      res.render("admin/pages/index", {
          title: "Dashboard",
          user,
          messages,
          recentOrders,
          totalOrderCount,
          totalActiveUserCount,
          totalSalesAmount,
          moment,
          totalSoldProducts: totalSoldProducts[0].total_sold_count,
      });
  } catch (error) {
      throw new Error(error);
  }
});


const salesReportpage = asynchandler(async (req, res) => {
  try {
      res.render("admin/pages/sales-report", { title: "Sales Report" });
  } catch (error) {
      throw new Error(error);
  }
});

const generateSalesReport = async (req, res, next) => {
  try {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);
      const salesData = await Order.find({
          orderedDate: {
              $gte: fromDate,
              $lte: toDate,
          },
      }).select("orderId totalPrice orderedDate payment_method -_id");

      res.status(200).json(salesData);
  } catch (error) {
      console.error(error);
      next(error);
  }
};

const getSalesData = async (req, res) => {
  try {
      const pipeline = [
          {
              $project: {
                  week: { $isoWeek: "$orderedDate" },
                  year: { $isoWeekYear: "$orderedDate" },
                  totalPrice: 1,
              },
          },
          {
              $group: {
                  _id: { year: "$year", week: "$week" },
                  totalSales: { $sum: "$totalPrice" },
              },
          },
          {
              $project: {
                  _id: 0,
                  week: {
                      $concat: [
                          { $toString: "$_id.year" },
                          "-W",
                          {
                              $cond: {
                                  if: { $lt: ["$_id.week", 10] },
                                  then: { $concat: ["0", { $toString: "$_id.week" }] },
                                  else: { $toString: "$_id.week" },
                              },
                          },
                      ],
                  },
                  sales: "$totalSales",
              },
          },
      ];

      const weeklySalesArray = await Order.aggregate(pipeline);
      // console.log(weeklySalesArray,"1234567890`123456789012345678901234567890")

      res.json(weeklySalesArray);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
};


// // ---------------------------------------load index-------------------------------------
// const loadIndex = asynchandler(async (req, res) => {
//   try {
//     const [orderResult, soldResult, totalProductsResult, totalUsersResult] =
//       await Promise.all([
//         Orders.aggregate([
//           {
//             $group:{
//               _id:null,
//               totalOrders : {$sum:1},
//             },
//           },
//         ]),
//         Product.aggregate([
//           {
//             $group:{
//               _id:null,
//               totalProducts:{$sum:"$sold"},
//             },
//           },
//         ]),
//         Product.aggregate([
//           {
//             $group:{
//               _id:null,
//               totalQuantity:{$sum:"$quantity"},
//             },
//           },
//         ]),
//         User.aggregate([{$group: {_id:null,totalUsers:{$sum:1}}}]),
//       ]);
//       const totalOrders = orderResult.length>0?orderResult[0].totalOrders : 0;
//       // console.log("total orders",totalOrders);
//       const soldCount = soldResult.length>0?soldResult[0].totalProducts : 0;
//       // console.log("soldCount",soldCount);
//       const totalQuantity = totalProductsResult.length>0?totalProductsResult[0].totalQuantity : 0;
//       // console.log("totalQuantity",totalQuantity);
//       const totalUsers = totalUsersResult.length>0?totalUsersResult[0].totalUsers : 0;
//       // console.log("totalUsers",totalUsers)
 
//       // -----------------------graph details -----------------------
//       const usersData = await graphHelpers.countUsers();
//       // console.log("usersData",usersData);
//       const productSold = await graphHelpers.calculateProductSold();
//       // console.log("productSold",productSold)

//     res.render("./admin/pages/index",{
//        title: "SHOEVERSE/INDEX",
//        soldCount,
//        totalOrders,
//        totalQuantity,
//        totalUsers,
//        usersData,
//        productSold,
//       });
//   } catch (error) {
//     throw new Error(error);
//   }
// });

// ---------------------------------------usermanagement-------------------------------------

const usermanagement = asynchandler(async (req, res) => {
  try {

    const findUsers = await User.find();
    console.log(findUsers);
    res.render("./admin/pages/userlist", {
      title: "SHOEVERSE/USERLIST",users:findUsers

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
  getSalesData,
  salesReportpage,
    generateSalesReport,
};
