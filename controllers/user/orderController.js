// const asyncHandler = require('express-async-handler');
// const {
//     getOrders,
//     getSingleOrder,
//     cancelOrderById,
  
// } = require("../../helpers/orderHelper");
// const OrderItem = require('../../models/orderItemModel')

// const ordersPage = asyncHandler(async (req,res)=>{
//     try{
//         const userId = req.user._id;
//         console.log(userId);

//         const orders = await getOrders(userId);

//         res.render("users/pages/orders", {
//             title: "Orders",
//             page: "orders",
//             orders,
//         });
//     }catch(error){
//         throw new Error(Error)
//     }
// })