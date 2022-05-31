const ProductModel = require("../Model/product");
const path = require("path");
exports.getForm = (req, res) => {
  res.render("Admin/AdProduct", {
    titlePage: "Add Products",
    path: "/addProducts",
  });
};

exports.postFormData = (req, res) => {
  console.log("collected value:", req.body);
  let title = req.body.p_title;
  let price = req.body.p_price;
  let description = req.body.p_desc;
  let product_img = req.file;
  let pImage_url = product_img.path;
  console.log(title, price, description);
  let ProductData = new ProductModel({
    pTitle: title,
    pPrice: price,
    pDescription: description,
    pImage: pImage_url,
  });
  ProductData.save()
    .then((res) => {
      console.log("data added");
    })
    .catch((err) => {
      console.log("error to add data", err);
    });
  res.redirect("/admin/products");
};
exports.getProducts = (req, res) => {
  ProductModel.find()
    .sort({ pTitle: 1 })
    // .sort({ pPrice: 1 })
    .then((products) => {
      res.render("Admin/ViewProduct", {
        titlePage: "Admin Products",
        path: "/admin/products",
        data: products,
      });
    })
    .catch((err) => {
      console.log("error to fetch data", err);
    });
};
exports.editProduct = (req, res) => {
  const product_id = req.params.pid;
  console.log("Collected product id:", product_id);
  ProductModel.findById(product_id)
    .then((product) => {
      console.log("Product found by id:", product);
      res.render("Admin/editProduct", {
        titlePage: "Edit Product",
        path: "/editProduct",
        data: product,
      });
    })
    .catch((err) => {
      console.log("Product not found", err);
    });
};
exports.postEditData = (req, res) => {
  console.log("collected value:", req.body);
  let editedtitle = req.body.p_title;
  let editedprice = req.body.p_price;
  let editeddescription = req.body.p_desc;
  let editedId = req.body.prod_id;
  let editedpImage = " ";
  const oldUrl = req.body.oldUrl;

  if (req.file === undefined) {
    editedpImage = oldUrl;
  } else {
    editedpImage = req.file.path;
  }
  console.log("Url value:", editedpImage, oldUrl);
  ProductModel.findById(editedId).then((updated_data) => {
    updated_data.pTitle = editedtitle;
    updated_data.pPrice = editedprice;
    updated_data.pDescription = editeddescription;
    updated_data.pImage = editedpImage;
    return updated_data
      .save()
      .then((result) => {
        console.log(" Edited Product is saved");
        res.redirect("/admin/products");
      })
      .catch((err) => {
        console.log("error to save data", err);
      });
  });
};
exports.deleteProductAdmin = (req, res) => {
  let prod_id = req.params.pid;

  ProductModel.deleteOne({ _id: prod_id })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postDeleteData = (req, res) => {
  console.log("collected value:", req.body);
  let deletedId = req.body.delete;
  ProductModel.deleteOne({ _id: deletedId })
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("error to delete data", err);
    });
};
