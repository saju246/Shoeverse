const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel')
const {User} = require('../../models/userModel')
const Order = require('../../models/orderModel')
const OrderItem = require('../../models/orderItemModel')
const asyncHandler = require("express-async-handler");
const orderHelpers = require("../../helpers/orderHelper");
const {status} = require('../../utils/status');
const { Timestamp } = require("mongodb");
const moment = require("moment");
const {  handleCancelledOrder, updateOrderStatus } = require("../../helpers/admin_orderHelper");

// ----------------------order page---------------------------


const ordersPage = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find()
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
            .select("orderId orderedDate shippingAddress city zip totalPrice")
            .sort({ orderedDate: -1 });
        // res.json(orders);
        res.render("./admin/pages/orders", { title: "Orders", orders });
    } catch (error) {
        throw new Error(error);
    }
});


// ------------------------------------edit order----------------------------------

const editOrder = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findOne({ orderId: orderId })
            .populate({
                path: "orderItems",
                modal: "OrderItems",
                populate: {
                    path: "product",
                    modal: "Product",
                    populate: {
                        path: "images",
                        modal: "Images",
                    },
                },
            })
            .populate({
                path: "user",
                modal: "User",
            });
        res.render("./admin/pages/editOrder", { title: "Edit Order", order });
    } catch (error) {
        throw new Error(error);
    }
});

// -----------------------------update order status-----------------------------

const updateOrderStatuss = asyncHandler(async (req, res) => {
    try {
        const orderId = req.params.id;
console.log(req.body.status)
const newStatus = req.body.status
        // const order = await updateOrderStatus(orderId, req.body.status);\
        const order = await OrderItem.findByIdAndUpdate(orderId, { status: newStatus })
        if (req.body.status === status.shipped) {
            order.shippedDate = Date.now();
        } else if (req.body.status === status.delivered) {
            order.deliveredDate = Date.now();
        }
      
        await order.save();

        if (req.body.status === status.cancelled) {
            await handleCancelledOrder(order);
        }
    
        if (order.status === status.returnPending) {
            await handleReturnedOrder(order);
        }

        res.redirect("back");
    } catch (error) {
        throw new Error(error);
    }
});



module.exports = {
    ordersPage,
    editOrder,
    updateOrderStatuss,
}