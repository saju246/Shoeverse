const asyncHandler = require("express-async-handler");
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const OrderItem = require('../models/orderItemModel')
const { status } = require("../utils/status");
const user = require('../models/userModel') 

const getOrders = asyncHandler( async(userId)=>{
    const orders = await Order.find({ user: userId })
    .populate({
        path: "orderItems",
        select: "product status _id",
        populate: {
            path: "product",
            select: "title images",
            populate: {
                path: "images",
            },
        },
    })
    .select("orderId orderedDate shippingAddress city")
    .sort({ _id: -1 });

return orders;
})

getSingleOrder = asyncHandler(async(orderId)=>{
    const order = await OrderItem.findById(orderId).populate({
        path: "product",
        model: "Product",
        populate: {
            path: "images",
            model: "Images",
        },
})
const orders = await Order.findOne({ orderItems: orderId }).select("shippingAddress city orderedDate");

return { order, orders };

})


cancelOrderById = asyncHandler(async(orderId)=>{
    const order = await Order.findById(orderId).populate("orderItems");

    if (order.orderItems.every((item) => item.status === status.cancelled)) {
        return { message: "Order is already cancelled." };
    }


    if (order.payment_method === "cash_on_delivery") {
        // Update product quantities and sold counts for each order item
        for (const item of order.orderItems) {
            await OrderItem.findByIdAndUpdate(item._id, {
                status: status.cancelled,
            });

            const cancelledProduct = await Product.findById(item.product);
            cancelledProduct.quantity += item.quantity;
            cancelledProduct.sold -= item.quantity;
            await cancelledProduct.save();
        }

        // Update the order status
        order.status = status.cancelled;
        await order.save();

        return "redirectBack";
    }
})


module.exports = {
    getOrders,
    getSingleOrder,
    cancelOrderById
}