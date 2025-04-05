const express = require("express");
const cart_router = express.Router();
const CartController = require("../controller/CartController");

cart_router.post("/add", CartController.addCart);

cart_router.post("/delete", CartController.deleteCart);

cart_router.post("/update", CartController.updateCart);

cart_router.post("/list/page", CartController.getCartByPage);

module.exports = cart_router;