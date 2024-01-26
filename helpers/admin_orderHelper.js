
const Product = require("../models/productModel");
const OrderItem = require("../models/orderItemModel");
const Order = require("../models/orderModel");
const {status} = require("../utils/status");

module.exports = {
    updateOrderStatus: async (orderId, newStatus) => {
        return OrderItem.findByIdAndUpdate(orderId, { status: newStatus });
    },

    handleCancelledOrder: async (order) => {
        if (order.isPaid !== "pending") {
            const product = await Product.findById(order.product);
            product.sold -= order.quantity;
            product.quantity += order.quantity;
            await product.save();
        }

        const orders = await Order.findOne({ orderItems: order._id });
       
    },

    // handleReturnedOrder: async (order) => {
    //     order.status = status.status.returned;
    //     const product = await Product.findById(order.product);
    //     product.sold -= order.quantity;
    //     product.quantity += order.quantity;
    //     await product.save();

    //     const orders = await Order.findOne({ orderItems: order._id });

    //     const orderTotal = parseInt(order.price * order.quantity);
    //     await handleReturnAmount(order, orders, orderTotal);

    //     await order.save();
    // },
};