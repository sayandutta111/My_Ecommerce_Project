const express = require("express");
const home_router = express.Router();
const home_controller = require("../Controller/HomeController");

home_router.get("/", home_controller.getHomePage);

module.exports = home_router;
