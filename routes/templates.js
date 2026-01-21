// routes/templates.js (new file)
const router = require("express").Router();
const Template = require("../models/Template"); // we'll create this model

// GET all templates
router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ name: 1 }); // optional sort
    res.json(templates);
  } catch (err) {
    console.error("Templates fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;