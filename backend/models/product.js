const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, "Please enter product name"],
    trim: true,
    maxLength: [100, "Product name cannot exceed 100 characters"],
  },
  headPrice: {
    type: Number,
    required: [false, "Please enter head price"],
    default: 0.0,
  },
  bowelsPrice: {
    type: Number,
    required: [false, "Please enter bowels price"],
    default: 0.0,
  },
  smallPrice: {
    type: Number,
    required: [false, "Please enter weight price"],
    default: 0.0,
  },
  smallWeight: {
    type: Number,
    required: [false, "Please enter product weight"],
  },
  mediumPrice: {
    type: Number,
    required: [false, "Please enter weight price"],
    default: 0.0,
  },
  mediumWeight: {
    type: Number,
    required: [false, "Please enter product weight"],
  },
  largPrice: {
    type: Number,
    required: [false, "Please enter weight price"],
    default: 0.0,
  },
  largWeight: {
    type: Number,
    required: [false, "Please enter product weight"],
  },

  // category: {
  //   type: String,
  //   required: [true, "Please select category for this product"],
  //   enum: {
  //     values: ["something", "something else"],
  //     message: "Please select correct category for product",
  //   },
  // },
  num: {
    type: Number,
    
  },
  mainCategory: {
    type: String,
    required: [false, "Please select category for this product"],
    enum: {
      values: ["one", "two" , "three"],
      message: "Please select correct category for product",
    },
  },
  productImage : {
    data: String,
  },
});

module.exports = mongoose.model("Product", productSchema);

