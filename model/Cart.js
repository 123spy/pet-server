const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId: {type: String},
    productId: {type: String},
    creatTime: {
        type: Date,
        default: Date.now,
    },
});

module.exports = CartSchema;