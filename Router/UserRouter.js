const express = require("express");
const auth_check = require("../middle-ware/auth");
const UserController = require("../Controller/UserController");
const User_Router = express.Router();
User_Router.get("/user/products", UserController.userValueDisplay);
User_Router.get(
  "/productDetails/:pid",
  auth_check,
  UserController.viewSingleProduct
);
User_Router.get("/addToCart/:pid", UserController.addToCartProduct);

User_Router.post("/searchData", UserController.viewSearchedProduct);

module.exports = User_Router;
