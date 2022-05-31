const UserModel = require("../Model/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
exports.getRegForm = (req, res) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("Auth/Registration", {
    titlePage: "User Registration",
    path: "/registration",
    errorMsg: message,
    error: [],
  });
};

exports.postRegUserData = (req, res) => {
  console.log("collected value:", req.body, req.cookies);
  let fname = req.body.u_fname;
  let lname = req.body.u_lname;
  let email = req.body.u_email;
  let password = req.body.u_pass;

  let error = validationResult(req);
  if (!error.isEmpty()) {
    errorResponse = validationResult(req).array();
    console.log("Error response:", errorResponse);
    res.render("Auth/Registration", {
      titlePage: "User Registration",
      path: "/registration",
      errorMsg: "",
      error: errorResponse,
    });
  } else {
    UserModel.findOne({ uEmail: email })
      .then((userValue) => {
        if (userValue) {
          console.log(userValue, "Email already exist");
          req.flash("error", "Error:: Email Does exist already");
          return res.redirect("/registration");
        }
        return bcrypt
          .hash(password, 12)
          .then((hashPassword) => {
            const userData = UserModel({
              uFname: fname,
              uLname: lname,
              uEmail: email,
              uPassword: hashPassword,
            });

            return userData.save();
          })
          .then((result) => {
            console.log("Registration Done");
            // res.cookie("firstname", fname);
            // res.cookie("lastname", lname);
            // res.cookie("email", email);
            // res.cookie("password", bcrypt.hash(password, 12));
            return res.redirect("/login");
          })
          .catch((error) => {
            console.log(error);
            req.flash("error", "Error:: error");
          });
      })
      .catch((err) => {
        console.log("error in findOne");
        req.flash("error", "Error:: error in findOne");
      });
  }
};
exports.getLoginForm = (req, res) => {
  let message = req.flash("error");
  console.log(message);
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("Auth/Login", {
    titlePage: "User Login",
    path: "/login",
    errorMsg: message,
    error: [],
    cookie_data: req.cookies,
  });
};

exports.postLoginUserData = (req, res) => {
  console.log("collected value:", req.body);
  let email = req.body.u_email;
  let password = req.body.u_pass;
  let checked = req.body.checked;

  let error = validationResult(req);
  if (!error.isEmpty()) {
    errorResponse = validationResult(req).array();
    console.log("Error response:", errorResponse);
    res.render("Auth/Login", {
      titlePage: "User Login",
      path: "/login",
      errorMsg: "",
      error: errorResponse,
    });
  } else {
    UserModel.findOne({ uEmail: email })
      .then((userValue) => {
        if (!userValue) {
          console.log(userValue, "Invalid email address");
          req.flash("error", "Error:: Invalid email address");
          res.redirect("/login");
        }
        bcrypt
          .compare(password, userValue.uPassword)
          .then((result) => {
            if (!result) {
              console.log("Invalid password");
              req.flash("error", "Error:: Invalid password");
            } else {
              console.log("Logged in successfully", result);
              req.session.isLoggedIn = true;
              req.session.user = userValue;
              return req.session.save((err) => {
                if (err) {
                  console.log(err);
                } else {
                  if (checked) {
                    const cookie_value = {
                      emailCookie: userValue.uEmail,
                      passwordCookie: password,
                    };
                    console.log(
                      "cookie:",
                      cookie_value.emailCookie,
                      cookie_value.passwordCookie
                    );
                    res.cookie("cookieData", cookie_value, {
                      expires: new Date(Date.now() + 12000000),
                      httpOnly: true,
                    });
                  }

                  console.log("Logged in successfully");
                  res.cookie("email", email);
                  res.cookie("password", password);
                  return res.redirect("/admin/products");
                }
              });
            }
            res.redirect("/login");
          })
          .catch((error) => {
            console.log(error);
            res.redirect("/login");
          });
      })
      .catch((err) => {
        console.log("error in findOne", err);
      });
  }
};
exports.postLogOutData = (req, res) => {
  res.clearCookie("cookieData");
  res.clearCookie("email");
  res.clearCookie("password");

  return req.session.destroy((err) => {
    console.log(err);
    return res.redirect("/");
  });
};
