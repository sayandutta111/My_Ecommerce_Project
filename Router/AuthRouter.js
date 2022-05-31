const express = require("express");
const { check, body } = require("express-validator");
const AuthController = require("../Controller/AuthController");
const Auth_Router = express.Router();

Auth_Router.get("/registration", AuthController.getRegForm);
Auth_Router.get("/login", AuthController.getLoginForm);

Auth_Router.post(
  "/regPostValue",
  [
    body("u_fname", "Enter valid First Name").isLength({ min: 3, max: 12 }),
    body("u_lname", "Enter Valid Last Name").isLength({ min: 3, max: 12 }),
    check("u_email").isEmail().withMessage("Enter Valid Email"),
    body("u_pass", "Enter Valid Password").matches(
      "^(?=.*[A-Za-z0-9)(?=.*[!@#$*]).{4,12}$"
    ),
  ],
  AuthController.postRegUserData
);
Auth_Router.post(
  "/logPostValue",
  [
    check("u_email").isEmail().withMessage("Enter Valid Email"),
    body("u_pass", "Enter Valid Password").matches(
      "^(?=.*[A-Za-z0-9)(?=.*[!@#$*]).{4,12}$"
    ),
  ],
  AuthController.postLoginUserData
);
Auth_Router.get("/logout", AuthController.postLogOutData);

module.exports = Auth_Router;
