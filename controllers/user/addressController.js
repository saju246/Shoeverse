const Address = require('../../models/addressModel')
const {User} = require('../../models/userModel')
const asyncHandler = require('express-async-handler')

//  ---------------------------load address-------------------------------

const loadAddress = asyncHandler(async (req,res)=>{
    try{
        res.render('./user/pages/Address',{title:'SHOEVERSE'})
    }catch(error){
        throw new Error(error)
    }
})


// ---------------------insert user to db---------------------------------------


const insertAddress = asyncHandler(async (req,res)=>{
    try{
        const user = req.user;
        const address = await Address.create(req.body);
        user.addresses.push(address._id)
        await user.save();
        res.redirect('/savedAddress')
    }catch(error){
        throw new Error(error)
    }
})


// ----------------------------load saved address---------------------------------------

const loadSavedAddress = asyncHandler(async (req,res)=>{
    try{
        const user = req.user;

        const userWithAddresses = await User.findById(user).populate('addresses')
        console.log(userWithAddresses)
        const address = userWithAddresses.addresses
        res.render('./user/pages/savedAddress',{title:"SHOEVERSE",address})
    }catch(error){
        throw new Error(error)
    }
})


// --------------------------------load edit address --------------------------------

const loadEditAddress = asyncHandler (async(req,res)=>{
    try{
        const addressId = req.params.id;
        const address = await Address.findOne({_id:addressId});
        res.render('./user/pages/editAddress',{title:'SHOEVERSE',address})
    }catch(error){
        throw new Error(error);
    }
})
//  ------------------------edit address page ----------------------------

    const editAddress = asyncHandler(async (req,res)=>{
        try{
            const userId = req.params.id;
            const address = await Address.findOneAndUpdate({_id:userId},req.body)
            res.redirect('/savedAddress')
        }catch(error){
            throw new Error(error)
        }
    })

    
// ----------------------------delete address---------------------------------------

const deleteAddress = asyncHandler(async (req, res) => {
    try {
      const addressId = req.params.id;
      
      // Assuming you have a method to remove the address from the user's addresses array
      const user = req.user;
      user.addresses = user.addresses.filter(id => id.toString() !== addressId);
      await user.save();
  
      // Remove the address from the Address collection
      await Address.findByIdAndDelete(addressId);
  
      res.sendStatus(204); // Send a success response
    } catch (error) {
      console.error('Error deleting address:', error);
      res.sendStatus(500); // Send an internal server error response
    }
  });

module.exports = {
    loadAddress,
    insertAddress,
    loadSavedAddress,
    loadEditAddress,
    editAddress,
    deleteAddress,
}