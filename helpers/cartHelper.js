const Product = require("../models/productModel");
const Cart = require("../models/cartModel");

// ---------------------------------------------calculateToatal----------------------------------------------


function calculateCartTotals(products) {
  let subtotal = 0;
 
  for (const product of products) {

    const productTotal =
      parseFloat(product.product.salePrice) * product.quantity;
    subtotal += productTotal;
  }
  let total = subtotal;
  return { subtotal,total };
}

// ---------------------------------find cart item--------------------------------------------------


const findCartItem = async (userId, productId) => {
  return await Cart.findOne({ user: userId, "products.product": productId });
};

// ------------------------------------find by id--------------------------------------------------------

const findProductById = async (productId) => {
  return await Product.findById(productId);
};

// --------------------------increment Quantity---------------------------------


const incrementQuantity = async (userId, productId, res) => {
  const updateProduct = await findCartItem(userId, productId);

  if (!updateProduct) {
    return res.json({ message: "Product not found in cart", status: "error" });
  }

  const foundProduct = updateProduct.product.find((cartProduct) =>
    cartProduct.product.equals(productId)
  );

  const product = await findProductById(productId);

  if (foundProduct.quantity < product.quantity) {
    foundProduct.quantity += 1;
    await updateProduct.save();

    const productTotal = product.salePrice * foundProduct.quantity;
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    const { subtotal, total } = calculateCartTotals(cart.products);

    res.json({
      message: "Quantity Increased",
      quantity: foundProduct.quantity,
      productTotal,
      status: "success",
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
    });
  } else {
    const productTotal = product.salePrice * foundProduct.quantity;
    const cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    const { subtotal, total } = calculateCartTotals(cart.products);
    res.json({
      message: "Out of stock!",
      status: "danger",
      quantity: foundProduct.quantity,
      productTotal,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
    });
  }
};

// ------------------------------------------decremen quantity-------------------------------------


const decrementQuantity = async (userId, productId, res) => {
    const updatedCart = await Cart.findOne({ user: userId });
    const productToDecrement = updatedCart.products.find((item) => item.product.equals(productId));
    if (productToDecrement) {
        productToDecrement.quantity -= 1;
        if (productToDecrement.quantity <= 0) {
            updatedCart.products = updatedCart.products.filter((item) => !item.product.equals(productId));
        }
        const product = await findProductById(productId);
        await updatedCart.save();
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total } = calculateCartTotals(cart.products);
        res.json({
            message: "Quantity Decreased",
            quantity: productToDecrement.quantity,
            status: "warning",
            productTotal: product.salePrice * productToDecrement.quantity,
            subtotal,
            total,
        });
    } else {
        const cart = await Cart.findOne({ user: userId }).populate("products.product");
        const { subtotal, total } = calculateCartTotals(cart.products);
        const product = await findProductById(productId);
        res.json({
            message: "Product not found in the cart.",
            status: "error",
            subtotal,
            total,
            productTotal: product.salePrice * productToDecrement.quantity,
        });
    }
};

module.exports = {
    calculateCartTotals,
    findCartItem,
    findProductById,
    incrementQuantity,
    decrementQuantity,
}