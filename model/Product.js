const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: { type: String },
    productPrice: { type: Number },
    productStock: { type: Number, default: 10},
    productImages: [{ type: String }],
    productDescription: {type: String, default: null},
    productTags: [{ type: String }]
});

module.exports = ProductSchema;