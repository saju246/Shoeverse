const asyncHandler = require('express-async-handler')

const {
  getOrders,
  getSingleOrder,
  cancelOrderById,
  cancelSingleOrder,

} = require('../../helpers/orderHelper')
const OrderItem = require("../../models/orderItemModel");

// -----------------------------order page------------------------

exports.orderspage = asyncHandler(async (req, res) => {
  try {
      const userId = req.user._id;
      console.log(userId);

      const orders = await getOrders(userId);

      res.render("./user/pages/orders", {
          title: "Orders",
          page: "orders",
          orders,
      });
  } catch (error) {
      throw new Error(error);
  }
});


exports.singleOrder = asyncHandler(async (req, res) => {
  try {
      const orderId = req.params.id;

      const { order, orders } = await getSingleOrder(orderId);
      
      res.render("./user/pages/single-order", {
          title: order.product.title,
          page: order.product.title,
          order,
          
          orders,
      });
  } catch (error) {
      throw new Error(error);
  }
});


exports.cancelOrder = asyncHandler(async (req, res) => {
  try {
      const orderId = req.params.id;

      const result = await cancelOrderById(orderId);

      if (result === "redirectBack") {
          res.redirect("back");
      } else {
          res.json(result);
      }
  } catch (error) {
      throw new Error(error);
  }
});


exports.cancelSingleOrder = asyncHandler(async (req, res) => {
  try {
    console.log('her');
      const orderItemId = req.params.id;

      const result = await cancelSingleOrder(orderItemId, req.user._id);
     
      
       
        res.redirect("back");
      
  } catch (error) {
      throw new Error(error);
  }
});

