const express = require("express");
const product_router = express.Router();
const ProductController = require("../controller/ProductController");
const UserController = require("../controller/UserController");

product_router.post("/add", ProductController.addProduct);

product_router.post("/delete", ProductController.deleteProduct);

product_router.post("/update", ProductController.updateProduct);

product_router.post("/get/id", ProductController.getProductById);

product_router.post("/list/page", ProductController.getProductByPage);

module.exports = product_router;