const asyncHandler = require("express-async-handler");
const checkoutHelper = require("../../helpers/checkoutHelper");
const { User } = require("../../models/userModel");
const Cart = require("../../models/cartModel");
const Order = require("../../models/orderModel");
const Product = require("../../models/productModel");
const Razorpay = require("razorpay");
const OrderItems = require("../../models/orderItemModel");

// const { generateRazorPay } = require("../../config/razorpay");
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
    } else if (payment_method === "online_payment") {
      const user = await User.findById(req.user._id);
      const wallet = await Wallet.findOne({ user: userId });
      let totalAmount = 0;

      if (isWallet) {
          totalAmount = newOrder.totalPrice;
          totalAmount -= wallet.balance;
          newOrder.paidAmount = totalAmount;
          newOrder.wallet = wallet.balance;
          await newOrder.save();
          const walletTransaction = await WalletTransaction.create({
              wallet: wallet._id,
              event: "Order Placed",
              orderId: newOrder.orderId,
              amount: wallet.balance,
              type: "debit",
          });
      } else if (!isWallet) {
          totalAmount = newOrder.totalPrice;
          newOrder.paidAmount = totalAmount;
          await newOrder.save();
      }

      var instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      const rzp_order = instance.orders.create(
          {
              amount: totalAmount * 100,
              currency: "INR",
              receipt: newOrder.orderId,
          },
          (err, order) => {
              if (err) {
                  res.status(500).json(err);
              }
              res.status(200).json({
                  message: "Order placed successfully",
                  rzp_order,
                  order,
                  user,
                  walletAmount: wallet?.balance,
                  orderId: newOrder._id,
              });
          }
      );
  } 
     else {
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
    }else if (order.payment_method === "online_payment") {
      for (const item of order.orderItems) {
          item.isPaid = "paid";
          await item.save();
      }
      if (coupon) {
          coupon.usedBy.push(userId);
          await coupon.save();
      }
      const wallet = await Wallet.findOne({ user: req.user._id });
   
      wallet.balance -= order.wallet;
      await wallet.save();
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
  setTimeout(function(){
    res.render("./user/pages/orderPlaced", {
      title: "Order Placed",
      page: "Order Placed",
      order: order,
      moment: moment,
    });
  },3000)

  } catch (error) {
    throw new Error(error);
  }

});

/**
 * Vefify Payment
 * Method POST
 */
const verifyPayment = asyncHandler(async (req, res) => {
  try {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId,  userId } = req.body;
      const result = await checkoutHelper.verifyPayment(
          razorpay_payment_id,
          razorpay_order_id,  
          razorpay_signature,
          orderId
         
      );     

      // if (result) {
      //     const wallet = await Wallet.findOneAndUpdate(
      //         { user: userId },
      //         {
      //             balance: walletAmount,
      //         }
      //     );
         
      // }

      // res.json(result);
  } catch (error) {
      throw new Error(error);
  }
});


const updateCheckoutPage = asyncHandler(async (req, res) => {
  try {
      const userid = req.user._id;
      // const coupon = (await Coupon.findOne({ code: req.body.code, expiryDate: { $gt: Date.now() } })) || null;
      const user = await User.findById(userid).populate("addresses");
      const cartItems = await checkoutHelper.getCartItems(userid);

      if (coupon) {
          const { subtotal, total, usedFromWallet, walletBalance, discount } = await checkoutHelper.calculateTotalPrice(
              cartItems,
              userid,
              // req.body.payWithWallet,
              // coupon
          );
          res.json({ total, subtotal,
            //  usedFromWallet,
              // walletBalance,
              //  discount 
              });
      } else {
          const { subtotal, total,
            //  usedFromWallet,
              // walletBalance,
              //  discount
               } = await checkoutHelper.calculateTotalPrice(
              cartItems,
              userid,
              req.body.payWithWallet,
              coupon
          );
          res.json({ total, subtotal,
            //  usedFromWallet,
              // walletBalance,
              //  discount
               });
      }
  } catch (error) {
      throw new Error(error);
  }
});

module.exports = {
  checkoutPage,
  getCartData,
  placeOrder,
  orderPlaced,
  verifyPayment,
  updateCheckoutPage,
}
