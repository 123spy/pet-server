const express = require("express");
const file_router = express.Router();
const FileController = require("../controller/FileController");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

file_router.post("/upload", upload.single('productImage'), FileController.uploadFile);


module.exports = file_router;