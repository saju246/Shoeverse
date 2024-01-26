const express = require("express");
const adminRoute = express();
const adminController = require("../controllers/admin/adminController");
const categoryController = require("../controllers/admin/categoryController");
const productController = require('../controllers/admin/productController')
const orderController = require("../controllers/admin/orderController");

const {isAdminLoggedin,isAdminLoggedOut,} =require('../middleware/adminAuth')
const { upload, handleError, fileUploadValidation } = require("../config/upload");
adminRoute.set('layout','./admin/includes/layout.ejs')

// --------------------------admin login----------------------------

adminRoute.get("/",isAdminLoggedOut, adminController.loadLogin);
adminRoute.post("/", adminController.verifyAdmin);
adminRoute.get('/logout',isAdminLoggedin,adminController.logout);

// ---------------------------------admin usermanagement---------------------
adminRoute.get("/index", isAdminLoggedin, adminController.loadIndex);
adminRoute.get("/userlist",isAdminLoggedin, adminController.usermanagement);
adminRoute.post("/blockUser/:id",isAdminLoggedin, adminController.blockUser);
adminRoute.post("/unblockUSer/:id",isAdminLoggedin,adminController.unblockUser);

// ----------------------------admin category management------------------------

adminRoute.get("/category", isAdminLoggedin,categoryController.categoryManagement);
adminRoute.get("/addCategory",isAdminLoggedin,categoryController.addCategory);
adminRoute.post("/addCategory",isAdminLoggedin, categoryController.insertCategory);
adminRoute.get("/category/list/:id",isAdminLoggedin, categoryController.list);
adminRoute.get("/category/unlist/:id",isAdminLoggedin,categoryController.unlist);
adminRoute.get('/editCategory/:id',isAdminLoggedin,categoryController.editCategory)
adminRoute.post('/editCategory/:id',isAdminLoggedin,categoryController.updateCategory);

// -------------------------------admin product management------------------------------

adminRoute.get('/products',isAdminLoggedin,productController.loadProduct)
adminRoute.get('/addProduct',isAdminLoggedin,productController.addProduct);
adminRoute.post('/addProduct',isAdminLoggedin,upload.fields([{ name: "images", maxCount: 4 }]),productController.insertProduct)
adminRoute.post('/product/list/:id',isAdminLoggedin,productController.listProduct);
adminRoute.post('/product/unlist/:id',isAdminLoggedin,productController.unlistProduct);
adminRoute.get('/product/editProduct/:id',isAdminLoggedin,productController.editProduct)
adminRoute.post('/product/editProduct/:id',isAdminLoggedin,productController.updateProduct)
adminRoute.put("/product/editImage/:id",upload.single("images"),isAdminLoggedin,productController.editImage);
adminRoute.put('/product/editImage/upload/:id',upload.fields([{name:"images",maxCount:4}]),isAdminLoggedin,productController.addNewImages)
adminRoute.delete('/product/deleteImage/:id',isAdminLoggedin,productController.deleteImages)


// ----------------------------------------admin order management -------------------------------------

adminRoute.get("/orders",isAdminLoggedin, orderController.ordersPage);
adminRoute.get("/orders/:id", isAdminLoggedin,orderController.editOrder);
adminRoute.put("/orders/update/:id", isAdminLoggedin, orderController.updateOrderStatuss);

module.exports = adminRoute;
