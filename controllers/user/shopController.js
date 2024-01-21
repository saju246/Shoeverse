const asynchandler = require('express-async-handler');
const product = require('../../models/productModel');
const User = require('../../models/userModel');
const Category = require('../../models/categoryModel');


// ---------------------------------load shop--------------------------------


const loadShop = asynchandler(async(req,res)=>{
    try{

      console.log('IN LOAD SHOP');
      const listedCategories = await Category.find({isListed:true});
      const listedCategoryIds = listedCategories.map((category)=>category._id)
      const topProduct = await product.find({categoryName: {$in:listedCategoryIds},isListed:true})
      .populate("images")
      console.log(topProduct,"..............................................")
      
      res.render('./user/pages/shop',{topProduct,category:listedCategories })
  
    }catch(error){
      throw new Error(error.message)
    }
  })
  
  // -------------------------------------load product details---------------------------------------

  const loadProductDetails = asynchandler(async (req,res)=>{
    try{
      const id = req.params.id;
      const Product = await product
        .findOne({ _id: id })
        .populate("images")
        .populate("categoryName");
      const relatedProducts = await product.find().populate("images");
      res.render("./user/pages/productDetails", {Product,relatedProducts,});
    }catch(error){
      throw new Error(error.message);
    }
  })

module.exports = {
    loadShop,
    loadProductDetails,
}