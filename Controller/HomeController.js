exports.getHomePage = (req, res) => {
  res.render("home", {
    titlePage: "Home Page",
    path: "/",
  });
};
