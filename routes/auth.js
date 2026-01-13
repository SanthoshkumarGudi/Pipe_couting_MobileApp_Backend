const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const crypto = require("crypto");

const { sendVerificationEmail } = require("../utils/sendEmail");

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");

    await User.create({
      email,
      password: hashed,
      verificationToken: token,
      verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
    });

    await sendVerificationEmail(email, token);

    res.status(201).json({
      message: "Verification email sent. Please verify your email.",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ error: "User not found" });

  if (!user.isVerified)
    return res.status(403).json({
      error: "Please verify your email before login",
    });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret", { expiresIn: "7d" });
  res.json({ token });
});


router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).send("Invalid or expired verification link");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpiry = undefined;
  await user.save();

  res.send("Email verified successfully. You can now login.");
});


module.exports = router;
