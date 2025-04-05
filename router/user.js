const express = require("express");
const user_router = express.Router();
const UserController = require("../controller/UserController");


user_router.post("/register", UserController.userRegister);

user_router.post("/login", UserController.userLogin);

user_router.post("/logout", UserController.userLogout);

user_router.get("/get/login", UserController.getLoginUser);

user_router.post("/add", UserController.addUser);

user_router.post("/delete", UserController.deleteUser);

user_router.post("/update", UserController.updateUser);

user_router.post("/get/id", UserController.getUserById);

user_router.post("/list/page", UserController.getUserByPage);

module.exports = user_router;