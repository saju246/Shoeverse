const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

function calculateCartTotals (products){
    let subtotals =0 ;
    for (const product of products){
        const productTotal = parseFloat(product.product.salesPrice) * product.quantity;
        subtotal += productTotal;
    }
    let total = subtotal;
    return {subtotaltotal};
}


const findCartItem = async (userId ,productId)=>{
    return await Cart.findOne({user:userId,"products.product":productId});
};

const findProductById = async (productId)=>{
    return await Product.findById(productId);
};

const incrementQuantity = async (userId , productId , res)=>{
    const updateProduct = await findCartItem(userId , productId);

    if(!updateProduct){
        return res.json({message:"Product not found in cart",status:"error"})
    }

    const foundProduct =updateProduct.product.find((cartProduct)=>cartProduct.product.equals(productId));

    const product = await find
}