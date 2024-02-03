// orderHelper.js

const asyncHandler = require("express-async-handler");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const OrderItems = require("../models/orderItemModel");
const Product = require("../models/productModel");
const { generateUniqueOrderID } = require("../utils/generateUniqueId");
const Crypto = require("crypto");
const Wallet = require("../models/walletModel");
const { StringDecoder } = require("string_decoder");

/**
 * Get user's cart items
 */
exports.getCartItems = asyncHandler(async (userId) => {
    return await Cart.findOne({ user: userId }).populate("products.product");
});

/**
 * Calculate the total price of cart items
 */
exports.calculateTotalPrice = asyncHandler(async (cartItems, userid, payWithWallet, 
    // coupon
    ) => {
    const wallet = await Wallet.findOne({ user: userid });
    let subtotal = 0;
    for (const product of cartItems.products) {
        const productTotal = parseFloat(product.product.salePrice) * product.quantity;
        subtotal += productTotal;
    }
    let total;
    let usedFromWallet = 0;
    if (wallet && payWithWallet) {
        // let discount = 0;
        total = subtotal;

        // if (coupon) {
        //     if (coupon.type === "percentage") {
        //         discount = ((total * coupon.value) / 100).toFixed(2);
        //         if (discount > coupon.maxAmount) {
        //             discount = coupon.maxAmount;
        //             total -= discount;
        //         } else {
        //             total -= discount;
        //         }
        //     } else if (coupon.type === "fixedAmount") {
        //         discount = coupon.value;
        //         total -= discount;
        //     }
        // }

        if (total <= wallet.balance) {
            usedFromWallet = total;
            wallet.balance -= total;
            total = 0;
        } else {
            usedFromWallet = wallet.balance;
            total = subtotal - wallet.balance ;
            // - discount;
            wallet.balance = 0;
        }
        return { subtotal, total, usedFromWallet, walletBalance: wallet.balance,
            
            //  discount: discount ? discount : 0
             };
    } else {
        total = subtotal;
        // let discount = 0;
        // if (coupon) {
        //     if (coupon.type === "percentage") {
        //         discount = ((total * coupon.value) / 100).toFixed(2);
        //         if (discount > coupon.maxAmount) {
        //             discount = coupon.maxAmount;
        //             total -= discount;
        //         } else {
        //             total -= discount;
        //         }
        //     } else if (coupon.type === "fixedAmount") {
        //         discount = coupon.value;
        //         total -= discount;
        //     }
        // }
        return {
            subtotal,
            total,
            usedFromWallet,
            walletBalance: wallet ? wallet.balance : 0,
            // discount: discount ? discount : 0,
        };
    }
});

/**
 * Place an order
 */
// exports.placeOrder = asyncHandler(async (userId, addressId, paymentMethod, isWallet,
//     //  coupon
//      ) => {
//     const cartItems = await exports.getCartItems(userId);
// console.log("in order Placed in helper ====================================",cartItems)
//     if (!cartItems && cartItems.length) {
//         throw new Error("Cart not found or empty");
//     }

//     const orders = [];
//     let total = 0;

//     for (const cartItem of cartItems.products) {
//         const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
//         console.log("checkout helper placeorder ",productTotal)

//         total += productTotal;
//         console.log("placeOrder helper ",total)

//         const item = await OrderItems.create({
//             quantity: cartItem.quantity,
//             price: cartItem.product.salePrice,
//             product: cartItem.product._id,
//         });
//         console.log("placeOrder in helper  items",item)
//         orders.push(item);
//         console.log("place order helper orders array" , orders)
//     }

//     // let discount;

//     // if (coupon) {
//     //     if (coupon.type === "percentage") {
//     //         discount = ((total * coupon.value) / 100).toFixed(2);
//     //         if (discount > coupon.maxAmount) {
//     //             discount = coupon.maxAmount;
//     //             total -= discount;
//     //         } else {
//     //             total -= discount;
//     //         }
//     //     } else if (coupon.type === "fixedAmount") {
//     //         discount = coupon.value;
//     //         total -= discount;
//     //     }
//     // }

//     const address=await Address.findById(addressId);
//     console.log("in hel[per place order address ",address)
//     const existingOrdersIds= await Order.find().select("orderId");
//     console.log("in hel[per place existing order ",existingOrdersIds)
//     const newOrder = await Order.create({
//         orderId: "OD" + generateUniqueOrderID(existingOrdersIds),
//         orderItems: orders,
//         shippingAddress: { name: address.name, address: address.address },
//         state: address.state,
//         town: address.town,
//         postcode: address.postcode,
//         phone: address.mobile,
//         totalPrice: total.toFixed(2), // Ensure that totalPrice is of the correct data type
//         user: userId,
//         // discount: discount,
//         // coupon: coupon ?? coupon,
//         payment_method: paymentMethod,
//     });
    

//     console.log("in hel[per place order new oreder ",newOrder)
//     return newOrder;
// });
exports.placeOrder = asyncHandler(async (userId, addressId, paymentMethod, isWallet /*, coupon */) => {
    try {
      const cartItems = await exports.getCartItems(userId);
  
      console.log("Cart Items in order Placed in helper: ", cartItems);
  
      if (!cartItems && !cartItems.length) {
        throw new Error("Cart not found or empty");
      }
  
      const orders = [];
      let total = 0;
  
      for (const cartItem of cartItems.products) {
        const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
        console.log("Product Total in checkout helper placeOrder: ", productTotal);
  
        total += productTotal;
        console.log("Total in checkout helper placeOrder: ", total);
  
        const item = await OrderItems.create({
          quantity: cartItem.quantity,
          price: cartItem.product.salePrice,
          product: cartItem.product._id,
        });
  
        console.log("Order Item in placeOrder helper: ", item);
        orders.push(item);
        console.log("Orders Array in placeOrder helper: ", orders);
      }
  
      const address = await Address.findById(addressId);
      console.log("Address in helper place order: ", address);
  
      const existingOrdersIds = await Order.find().select("orderId");
      console.log("Existing Order IDs in helper place order: ", existingOrdersIds);
  
      // Ensure that the generateUniqueOrderID function is defined and working correctly
      console.log("Address object before creating the order:", address);
      const newOrder = await Order.create({
        orderId: "OD" + generateUniqueOrderID(existingOrdersIds),
        orderItems: orders,
        shippingAddress: address.name,
        state: address.state,
        town: address.town,
        postcode: address.postcode,
        phone: address.mobile,
        totalPrice: total.toFixed(2),
        user: userId,
        payment_method: paymentMethod,
      });
      
      console.log("New Order in helper place order: ", newOrder);
      return newOrder;
    } catch (error) {
      console.error("Error in helper place order:", error);
      throw error; // Ensure that errors are properly propagated
    }
  });
  

/**
 * Verify payment using Razorpay
 */
exports.verifyPayment = asyncHandler(async (razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId) => {
  // console.log("razorpay payment Id",razorpay_payment_id)
  // console.log("razorpay order id",razorpay_order_id)
  // console.log("razorpay signatture",razorpay_signature)
  // console.log("razorpay order id",orderId)
  // console.log("in verify payment in checkout helper ///////////////////////////////////")
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    console.log("sign in chekout helper ",sign)
    const expectedSign = Crypto.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY).update(sign.toString()).digest("hex");
  console.log("expectefsign in chekout helper",expectedSign)
  console.log("second console sign stringed",sign)
    if (razorpay_signature === expectedSign) {
        return { message: "success", orderId: orderId };
    } else {
        throw new Error("Payment verification failed");
    }
});
