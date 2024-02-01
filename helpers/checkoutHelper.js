    const asyncHandler = require('express-async-handler')
    const Address = require('../models/addressModel');
    const Cart = require('../models/cartModel');
    const Product = require('../models/productModel');
    const Order = require('../models/orderModel');
    const { generateUniqueOrderID } = require("../utils/generateUniqueId");
    const OrderItems = require('../models/orderItemModel')


    // -----------------------get cart items -----------------------------

    const getCartItems = asyncHandler (async(userId)=>{
        try{
            console.log('in helper get cart')
            return await Cart.findOne({user:userId}).populate('products.product')
        }catch(error){
            throw new Error(error)
        }
    })



/**
 * Calculate the total price of cart items
 */
//  const calculateTotalPrice = asyncHandler(async (cartItems, userid,
//     //  payWithWallet, coupon
//      ) => {
//     const wallet = await Wallet.findOne({ user: userid });
//     let subtotal = 0;
//     for (const product of cartItems.products) {
//         const productTotal = parseFloat(product.product.salePrice) * product.quantity;
//         subtotal += productTotal;
//     }
//     let total;
//     let usedFromWallet = 0;
//     if (wallet && payWithWallet) {
//         let discount = 0;
//         total = subtotal;

//         if (coupon) {
//             if (coupon.type === "percentage") {
//                 discount = ((total * coupon.value) / 100).toFixed(2);
//                 if (discount > coupon.maxAmount) {
//                     discount = coupon.maxAmount;
//                     total -= discount;
//                 } else {
//                     total -= discount;
//                 }
//             } else if (coupon.type === "fixedAmount") {
//                 discount = coupon.value;
//                 total -= discount;
//             }
//         }

//         if (total <= wallet.balance) {
//             usedFromWallet = total;
//             wallet.balance -= total;
//             total = 0;
//         } else {
//             usedFromWallet = wallet.balance;
//             total = subtotal - wallet.balance - discount;
//             wallet.balance = 0;
//         }
//         return { subtotal, total, usedFromWallet, walletBalance: wallet.balance, discount: discount ? discount : 0 };
//     } else {
//         total = subtotal;
//         let discount = 0;
//         if (coupon) {
//             if (coupon.type === "percentage") {
//                 discount = ((total * coupon.value) / 100).toFixed(2);
//                 if (discount > coupon.maxAmount) {
//                     discount = coupon.maxAmount;
//                     total -= discount;
//                 } else {
//                     total -= discount;
//                 }
//             } else if (coupon.type === "fixedAmount") {
//                 discount = coupon.value;
//                 total -= discount;
//             }
//         }
//         return {
//             subtotal,
//             total,
//             usedFromWallet,
//             walletBalance: wallet ? wallet.balance : 0,
//             discount: discount ? discount : 0,
//         };
//     }
// });



    // -----------------------------place an order-----------------------
    const placeOrder = asyncHandler(async(userId,addressId,paymentMethod)=>{
        const cartItems =  await getCartItems(userId);

        if (!cartItems && cartItems.length) {
            throw new Error("Cart not found or empty");
        }

        const orders = [];
        let total = 0;

        for (const cartItem of cartItems.products) {
            const productTotal = parseFloat(cartItem.product.salePrice) * cartItem.quantity;
            console.log(productTotal);

            total += productTotal;

            const item = await OrderItems.create({
                quantity: cartItem.quantity,
                price: cartItem.product.salePrice,
                product: cartItem.product._id,
            });
            orders.push(item);
        }

        const address = await Address.findById(addressId);
    
    console.log(orders,total,paymentMethod,userId);
        const existingOrderIds = await Order.find().select("orderId");
        // Create the order 
        const newOrder = await Order.create({
            orderId: "OD" + generateUniqueOrderID(existingOrderIds),
            user: userId,
            orderItems: orders,
            shippingAddress: address.name,
            town: address.town,
            state: address.state,
            postcode: address.postcode,
            phone: address.mobile,
            totalPrice: total.toFixed(2),
            payment_method: paymentMethod,
        });
        console.log(newOrder);

        return newOrder;
    })
    
    
module.exports = {
    getCartItems,
    placeOrder
}