// routes/templates.js (new file)
const router = require("express").Router();
const Template = require("../models/Template"); // we'll create this model

// GET all templates
router.get("/", async (req, res) => {
  try {
    const { name } = req.query;
    let templates;

    if (name) {
      templates = await Template.find({ name });
    } else {
      templates = await Template.find().sort({ name: 1 });
    }

    res.json(templates);

  } catch (err) {
    console.error("Templates fetch error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;