const category = require('../../models/categoryModel');
const expressHandler = require('express-async-handler')


// --------------------------category page---------------------------

const categoryManagement = expressHandler(async(req,res)=>{
    try{
        const findCategory = await category.find();
        res.render('./admin/pages/category',{
            category:findCategory
        })
    }catch(error){
        throw new Error(error.message);
    }
})

// --------------------------add category----------------------------
const addCategory =  expressHandler(async (req,res)=>{
    try{
        const messages = req.flash();
    res.render('./admin/pages/addCategory',{messages});

    }catch(error){
        throw new Error(error.message);
    }
})


// --------------------------------inserting category---------------------------

const insertCategory = expressHandler(async (req,res)=>{
    try{
        const categoryName = req.body.text;
        const regexCategoryName = new RegExp(`^${categoryName}$`,"i");
        const findCat = await category.findOne({categoryName:regexCategoryName});

        if(findCat){
            const catCheck = `Category ${categoryName} Already exist`;
            req.flash("danger",'category already exist')
            res.render("./admin/pages/addCategory",{catCheck});
        }else{
            const result = new category ({
                categoryName : categoryName,
            })
            await result.save();
            req.flash("success", "category added successfully");
            res.redirect('/admin/addCategory')
        }
    }catch(error){
        throw new Error(error.message)
    }
})

// -----------------------------list Category----------------------------------

const list = expressHandler(async (req,res)=>{
    try{
        const id = req.params.id;
        const listing = await category.findByIdAndUpdate(
            {_id:id},
            {$set:{isListed:true}}
            );
            res.redirect('/admin/category')
    }catch(error){
        throw new Error(error.message);
    }
})

// ---------------------------------unlist category-------------------------------


const unlist = expressHandler(async(req,res)=>{
    try{
        const id = req.params.id;
        const unlisting = await category.findByIdAndUpdate(
            {_id:id},
            {$set:{isListed:false}}
        );
        res.redirect('/admin/category')
    }catch(error){
        throw new Error(error)
    }
})

// ----------------------------------edit category-----------------------------------------

const editCategory = expressHandler(async (req,res)=>{
    try{
        const {id} = req.params;
        const catName = await category.findById(id)

        if(catName){
            const messages = req.flash();
            res.render("./admin/pages/editCategory",{
                value:catName,messages
            });
        }
    }catch(error){
        throw new Error(error.message)
    }
})


// --------------------------------------update category name---------------------------------

const updateCategory = expressHandler(async(req,res)=>{
    try{
        const id = req.params.id;
        const {updatedName}=req.body;

        const existedCategory = await category.find({
            categoryName:updatedName,
            _id:{$ne : id}
        })
        if(existedCategory && existedCategory.length!=0){
            req.flash("danger",`${updatedName} already exist , try new one`);
            res.redirect('back');
        }else{
            const cat = await category.findById(id)
            cat.categoryName = updatedName;

            const saved = await cat.save();
            res.redirect('/admin/category')
        }
    }catch(error){
        throw new Error (error.message)
    }
})


module.exports = {
    categoryManagement,
    addCategory,
    insertCategory,
    list,
    unlist,
    editCategory,
    updateCategory,
}