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

router.post("/create", async (req, res) => {

  const {name, imageUrl, comingSoon} = req.body;
try{
  if(!name || !comingSoon){
    return res.status(400).json({error:"Name and Coming Soon are missing"});
  }

  const exists= await Template.findOne({
    name:name
  })
  if(exists){
    return res.status(400).json({error:"Tempolate with this name already exists"});
  }

  const template= new Template({
    name:name,
    image:imageUrl || null,
    comingSoon:comingSoon
  })

  await template.save();
res.status(201).json({message:"Template created successfully", template});
}catch(err){
  res.status(500).json({ error: "Server error" });
}
});

module.exports = router;