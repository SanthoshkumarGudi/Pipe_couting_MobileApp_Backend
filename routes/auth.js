const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashed });
  await user.save();

  res.json({ message: "User created" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  console.log("user is ", user);
  
  if (!user)
    return res.status(400).json({ error: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  console.log("match is ", match);
  
  if (!match)
    return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret");
  console.log("token is ", token);
  
  res.json({ token });
});

module.exports = router;
