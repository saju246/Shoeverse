const mongoose =  require('mongoose');

const Schema = mongoose.Schema;

const categorySchema =  new Schema ({
    categoryName : {
        type:String,
        require:true,
    },
    isListed : {
        type : Boolean,
        default : true,
    },

},
    {timestamps:true}
);

const category  = mongoose.model("Category",categorySchema);


module.exports = category;