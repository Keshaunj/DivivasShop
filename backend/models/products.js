const mongoose = require('mongoose')

const productSchema = new mongoose.Schema = ({
    name: {type:String,required:true},
    description:{type:String},
    price:{type:Number,required:true},
    category:{type:String},
    imageUrl:{type:String},
    inStock:{type:Boolean,default:true},
    createdAt:{type:String,default:Date.now},
})
module.exports = mongoose.model('Product,productSchema');