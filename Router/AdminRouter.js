const express = require("express");
const AdminController = require("../Controller/AdminController");
const Admin_Router = express.Router();
// const auth_check = require("../middle-ware/auth");

Admin_Router.get("/addProducts", AdminController.getForm);
Admin_Router.post("/postValue", AdminController.postFormData);
Admin_Router.get("/admin/products", AdminController.getProducts);
Admin_Router.get("/editProduct/:pid", AdminController.editProduct);
Admin_Router.post("/postEditedValue", AdminController.postEditData);
Admin_Router.get(
  "/deleteProductAdmin/:pid",
  AdminController.deleteProductAdmin
);
Admin_Router.post("/postDeletedValue", AdminController.postDeleteData);
module.exports = Admin_Router;
