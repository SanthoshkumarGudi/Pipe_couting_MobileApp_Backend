const mongoose = require("mongoose");

const TemplateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // URL to image
  comingSoon: { type: Boolean, default: false },
  description: { type: String, default: "" }, // optional
  category: { type: String, default: "Metal Products" },
});

module.exports = mongoose.model("Template", TemplateSchema);