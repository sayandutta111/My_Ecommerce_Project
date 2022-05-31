const mongoose = require("mongoose");
const SchemaVariable = mongoose.Schema;

const ProductSchema = new SchemaVariable({
  pTitle: {
    type: String,
    required: true,
  },
  pPrice: {
    type: Number,
    required: true,
  },
  pDescription: {
    type: String,
    required: true,
  },
  pImage: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Products", ProductSchema);
