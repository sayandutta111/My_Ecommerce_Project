const path = require("path");

const express = require("express");

const ShopController = require("../Controller/ShopController");

const router = express.Router();

// router.get("/", ShopController.getIndex);

// router.get("/products", ShopController.getProducts);

// router.get("/products/:productId", ShopController.getProduct);

router.get("/cart", ShopController.getCart);

router.post("/cart", ShopController.postCart);
router.post("/addOne", ShopController.addQuantity);
router.post("/removeOne", ShopController.removeQuantity);

router.post("/cart-delete-item", ShopController.postCartDeleteProduct);

router.get("/checkout", ShopController.getCheckout);

router.get("/orders", ShopController.getOrders);

router.get("/orders/:orderId", ShopController.getInvoice);

module.exports = router;
