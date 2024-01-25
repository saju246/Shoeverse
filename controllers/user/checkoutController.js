const Cart = require("../../models/cartModel");
const { User } = require("../../models/userModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const OrderItems = require("../../models/orderItemModel");
const asyncHandler = require("express-async-handler");
const checkoutHelper = require("../../helpers/checkoutHelper");
const { calculateCartTotals } = require("../../helpers/cartHelper");
const moment =require("moment");

// ---------------------------------checkout Page----------------------------------

const checkoutPage = asyncHandler(async (req, res) => {
  try {
    const userid = req.user._id;

    const user = await User.findById(userid).populate("addresses");
    // console.log(user);

    const cartItems = await checkoutHelper.getCartItems(userid);
    // console.log(cartItems);
    const cartData = await Cart.findOne({ user: userid });
    // console.log(cartData);

    if (cartItems) {
      const { subtotal, total } = calculateCartTotals(cartItems.products);
      res.render("./user/pages/checkout", {
        title: "SHOEVERSE/CHECKOUT",
        address: user.addresses,
        product: cartItems.products,
        total,
        subtotal,
        cartData,
      });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// -----------------------place order --------------------------------

const placeOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { addressId, payment_method } = req.body;

    const newOrder = await checkoutHelper.placeOrder(
      userId,
      addressId,
      payment_method
    );
    console.log(newOrder);

    if (payment_method === "cash_on_delivery") {
      res.status(200).json({
        message: "Order placed successfully",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// ----------------------------------get cart data----------------------------------------

const getCartData = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const cartData = await Cart.findOne({ user: userId });
    res.json(cartData);
  } catch (error) {
    throw new Error(error);
  }
});

// ----------------------------------------order placed ------------------------------------------------

const orderPlaced = asyncHandler(async (req, res) => {
  try {
    const orderId = req.params.id;

    const userId = req.user._id;

    const order = await Order.findById(orderId).populate({
      path: "orderItems",
      populate: {
        path: "product",
      },
    });
    // console.log(order)

    const cartItems = await checkoutHelper.getCartItems(req.user._id);

    if (order.payment_method === "cash_on_delivery") {
      for (const item of order.orderItems) {
        item.isPaid = "cod";
        await item.save();
      }
    }
    
  if (cartItems) {
    for (const cartItem of cartItems.products) {
      const updateProduct = await Product.findById(cartItem.product._id);
      updateProduct.quantity -= cartItem.quantity;
      updateProduct.sold += cartItem.quantity;
      await updateProduct.save();
    }
    await Cart.findOneAndDelete({ user: req.user._id });
  }
  res.render("./user/pages/orderPlaced", {
    title: "Order Placed",
    page: "Order Placed",
    order: order,
    moment: moment,
  });
  } catch (error) {
    throw new Error(error);
  }

});

module.exports = {
  checkoutPage,
  getCartData,
  placeOrder,
  orderPlaced,
}
