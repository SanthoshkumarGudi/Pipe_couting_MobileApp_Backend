const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const crypto = require("crypto");

const { sendVerificationEmail } = require("../utils/sendEmail");
const { sendResetPasswordEmail } = require("../utils/sendEmail");

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
      // verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000,
            verificationTokenExpiry: Date.now() +  60 * 1000,

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
  console.log("inside login route");
  
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

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Always return success (security)
    const user = await User.findOne({ email });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      user.resetPasswordToken = token;
      user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
      await user.save();

      await sendResetPasswordEmail(email, token);
    }

    res.json({
      message: "If the email exists, a reset link has been sent.",
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  console.log("inside reset password API");

  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});


router.get("/reset-password-redirect", (req, res) => {
  console.log("inside redirect");
  
  const { token } = req.query;

  if (!token) {
    return res.status(400).send("Invalid reset link");
  }

  return res.redirect(`myapp://reset-password/${token}`);
  
});


module.exports = router;
