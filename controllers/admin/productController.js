const category = require("../../models/categoryModel");
const product = require("../../models/productModel");
const asynchandler = require("express-async-handler");
const Images = require("../../models/imageModel");

const path = require("path");
const sharp = require("sharp");
const { constrainedMemory } = require("process");

// -----------------------load product--------------------------------

const loadProduct = asynchandler(async (req, res) => {
  try {
    const products = await product
      .find()
      .populate("categoryName")
      .populate("images")
      .sort({ createdAt: -1 });

    const messages = req.flash();

    res.render("./admin/pages/product", { title:"SHOEVERSE" , messages, products: products });
  } catch (error) {
    throw new Error(error.message);
  }
});

// -----------------------------load add products--------------------------

const addProduct = asynchandler(async (req, res) => {
  try {
    const Category = await category.find({ isListed: true });
    const messages = req.flash();
    res.render("./admin/pages/addProduct", { title:"SHOEVERSE" ,  catList: Category, messages });
  } catch (error) {
    throw new Error(error);
  }
});

// ------------------------------insert products----------------------------
const insertProduct = asynchandler(async (req, res) => {
  try {
    const imageUrls = [];

    if (req.files && req.files.images.length > 0) {
      const images = req.files.images;

      for (const file of images) {
        try {
          const imageBuffer = await sharp(file.path).resize(600, 800).toBuffer();
          const thumbnailBuffer = await sharp(file.path).resize(300, 300).toBuffer();

          const imageSize = await sharp(imageBuffer).metadata();
          const thumbnailSize = await sharp(thumbnailBuffer).metadata();

          if (
            imageSize.width !== 600 || imageSize.height !== 800 ||
            thumbnailSize.width !== 300 || thumbnailSize.height !== 300
          ) {
            throw new Error("Invalid image dimensions");
          }

          const imageUrl = path.join("/admin/uploads", file.filename);
          const thumbnailUrl = path.join("/admin/uploads", file.filename);
          imageUrls.push({ imageUrl, thumbnailUrl });
        } catch (error) {
          throw new Error(error);
        }
      }

      const image = await Images.create(imageUrls);
      const imageId = image.map((image) => image._id).reverse();

      const newProduct = await product.create({
        title: req.body.productName,
        description: req.body.description,
        categoryName: req.body.categoryName,
        quantity: req.body.quantity,
        productPrice: req.body.productPrice,
        salePrice: req.body.salePrice,
        brand: req.body.brand,
        images: imageId,
      });

      if (newProduct) {
        req.flash("success", "Product Created");
        res.redirect("/admin/products");
      }
    } else {
      res.status(400).json({ error: "Invalid input: no images provided" });
    }
  } catch (error) {
    throw new Error(error);
  }
});

// ---------------------------------list products----------------------------------

const listProduct = asynchandler(async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, {
      isListed: true,
    });
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error);
  }
});

// --------------------------------unlist products-------------------------------------------

const unlistProduct = asynchandler(async (req, res) => {
  const id = req.params.id;
  try {
    const updatedProduct = await product.findByIdAndUpdate(id, {
      isListed: false,
    });
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error);
  }
});

// --------------------------------edit product--------------------------------------------------

const editProduct = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const Product = await product
      .findById(id)
      .populate("categoryName")
      .populate("images");

    const categories = await category.find({ isListed: true });
    const messages = req.flash();

    res.render("./admin/pages/editProduct", {title:"SHOEVERSE",
      categories,
      Product,
      messages,
    });
  } catch (error) {
    throw new Error(error.message);
  }
});

// -----------------------------update product----------------------------

const updateProduct = asynchandler(async (req, res) => {
  try {
    const id = req.params.id;
    const exists = await product.findByIdAndUpdate(id, req.body);
    res.redirect("/admin/products");
  } catch (error) {
    throw new Error(error.message);
  }
});

// -----------------------------edit image-------------------------------------

const editImage = asynchandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    const file = req.file;
    const imageBuffer = await sharp(file.path).resize(600, 600).toBuffer();
    const thumbnailBuffer = await sharp(file.path).resize(300, 300).toBuffer();
    const imageUrl = path.join("/admin/uploads", file.filename);
    const thumbnailUrl = path.join("/admin/uploads", file.filename);

    const images = await Images.findByIdAndUpdate(imageId, {
      imageUrl: imageUrl,
      thumbnailUrl: thumbnailUrl,
    });

    req.flash("success", "image Updated");
    res.redirect("back");
  } catch (error) {
    throw new Error(error.message);
  }
});

// --------------------------------------add new image-----------------------------

const addNewImages = asynchandler(async (req, res) => {
  try {
    const files = req.files.images;
    const imageUrls = [];
    const productId = req.params.id;

    for (const file of files) {
      try {
        const imageBuffer = sharp(file.path).resize(600, 600).toBuffer();
        const thumbnailBuffer = sharp(file.path).resize(300, 300).toBuffer();
        const imageUrl = path.join("/admin/uploads", file.filename);
        const thumbnailUrl = path.join("/admin/uploads", file.filename);
        imageUrls.push({ imageUrl, thumbnailUrl });
      } catch (error) {
        throw new Error(error.message);
      }
    }
    // Find the existing product
    const existingProduct = await product.findById(productId);

    // Remove the old images from the database
    await Images.deleteMany({ _id: { $in: existingProduct.images } });

    // Create and store the new images
    const newImages = await Images.create(imageUrls);

    // Update the product with the new image ids
    await product.findByIdAndUpdate(productId, {
      images: newImages.map((image) => image._id),
    });

    req.flash("success", "Images replaced");
    res.redirect("back");
  } catch (error) {
    throw new Error(error);
  }
});

// -----------------------------delete images------------------------------

const deleteImages = asynchandler(async (req, res) => {
  try {
    const imageId = req.params.id;
    await Images.findByIdAndDelete(imageId);

    const Product = await product.findOneAndUpdate(
      { images: imageId },
      { $pull: { images: imageId } },
      { new: true }
    );

    res.json({ message: "Image removed" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = {
  loadProduct,
  addProduct,
  insertProduct,
  listProduct,
  unlistProduct,
  editProduct,
  updateProduct,
  editImage,
  addNewImages,
  deleteImages
};
