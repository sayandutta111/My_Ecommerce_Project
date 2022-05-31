const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");
const stripe = require("stripe")("sk_test_dcVHL86Zd2TjE8fOwFkcQO4e00JGCZhQw5");

const Product = require("../Model/product");
const Order = require("../Model/order");

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    // .execPopulate() // populate itself does not return a promise
    .then((user) => {
      const products = user.cart.items;
      res.render("User/addToCart", {
        titlePage: "Your Cart",
        path: "/cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    // .execPopulate() // populate itself does not return a promise
    .then((user) => {
      const products = user.cart.items;
      let total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.pPrice;
      });
      res.render("shop/checkout", {
        path: "/checkout",
        titlePage: "Checkout",
        products: products,
        totalSum: total,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.addQuantity = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/checkout");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.removeQuantity = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.removeOne(product);
    })
    .then((result) => {
      res.redirect("/checkout");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  // Get the payment token ID submitted by the form
  const token = req.body.stripeToken;
  let totalSum = 0;

  req.user
    .populate("cart.items.productId")
    // .execPopulate() // populate itself does not return a promise
    .then((user) => {
      user.cart.items.forEach((p) => {
        totalSum += p.quantity * p.productId.pPrice;
      });
      const products = user.cart.items.map((i) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.uEmail,
          userId: req.user, // Mongoose will pick the id
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: "INR",
        description: "Your Order",
        source: token,
        metadata: { order_id: result._id.toString() },
      });
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        titlePage: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found"));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      ); // replace inline with attachment for download
      // pipe into a writable stream
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.fontSize(14).text("--------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.pPrice;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.pTitle +
              " - " +
              prod.quantity +
              " x " +
              "₹" +
              prod.product.pPrice
          );
      });
      pdfDoc.text("--------------------------");
      pdfDoc.fontSize(20).text("Total Price: ₹" + totalPrice);

      pdfDoc.end();

      // reads the entire content into memory and returns it into the response
      // (for bigger files) may take long time to send a response + may overflow in memory
      /*
            fs.readFile(invoicePath, (err, data) => {
                if (err) {
                    return next(err);
                }
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
                res.send(data);
            });
            */

      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
      // pipe forwards the data that is read in with that stream to the response
      // the response object is actually a writable stream
      // no need to preload the whole data into the memory as before
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
