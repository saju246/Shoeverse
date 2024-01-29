const asynchandler = require("express-async-handler");
const product = require("../../models/productModel");
const User = require("../../models/userModel");
const Category = require("../../models/categoryModel");

// ---------------------------------load shop--------------------------------

const loadShop = asynchandler(async (req, res) => {
  try {
    const user = req.user;
    const page = req.query.p || 1;
    const limit = 8;

    const listedCategories = await Category.find({ isListed: true });
    const categoryMapping = {};

    listedCategories.forEach((category) => {
      categoryMapping[category.categoryName] = category._id;
    });
    const filter = { isListed: true };

    if (req.query.category) {
      // Check if the category name exists in the mapping
      if (categoryMapping.hasOwnProperty(req.query.category)) {
        filter.categoryName = categoryMapping[req.query.category];
      } else {
        filter.categoryName = cat;
      }
    }

    // Check if a search query is provided
    if (req.query.search) {
      filter.$or = [{ title: { $regex: req.query.search, $options: "i" } }];
      // if search and category both included in the query parameters
      if (req.query.search && req.query.category) {
        if (categoryMapping.hasOwnProperty(req.query.category)) {
          filter.categoryName = categoryMapping[req.query.category];
        } else {
          filter.categoryName = cat;
        }
      }
    }

    let sortCriteria = {};

    // Check for price sorting
    if (req.query.sort === "lowtoHigh") {
      sortCriteria.salePrice = 1;
    } else if (req.query.sort === "highToLow") {
      sortCriteria.salePrice = -1;
    }
    //filter by both category and price
    if (req.query.category && req.query.sort) {
      if (categoryMapping.hasOwnProperty(req.query.category)) {
        filter.categoryName = categoryMapping[req.query.category];
      } else {
        filter.categoryName = cat;
      }

      if (req.query.sort) {
        sortCriteria.salePrice = 1;
      }
      if (req.query.sort === "highToLow") {
        sortCriteria.salePrice = -1;
      }
    }
    const findProducts = await product
      .find(filter)
      .populate("images")
      .populate("categoryName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort(sortCriteria);

    const count = await product
      .find(filter)
      // { categoryName: { $in: listedCategoryIds }, isListed: true })
      .countDocuments();
    let selectedCategory = [];
    if (filter.categoryName) {
      selectedCategory.push(filter.categoryName);
    }
    console.log(listedCategories);
    res.render("./user/pages/shop", {
      title: "SHOP",
      products: findProducts,
      category: listedCategories,
      user,
      currentPage: page,
      totalPages: Math.ceil(count / limit), // Calculating total pages
      selectedCategory,
    });
  } catch (error) {
    throw new Error(error);
  }
});

// -------------------------------------load product details---------------------------------------

const loadProductDetails = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const Product = await product
      .findOne({ _id: id })
      .populate("images")
      .populate("categoryName");
    const relatedProducts = await product.find().populate("images");
    res.render("./user/pages/productDetails", {
      title: "SHOEVERSE/PRODUCTDETAILS",
      Product,
      relatedProducts,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

module.exports = {
  loadShop,
  loadProductDetails,
};
