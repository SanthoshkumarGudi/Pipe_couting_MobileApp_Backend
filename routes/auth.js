const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const crypto = require("crypto");

const { sendVerificationEmail } = require("../utils/sendEmail");
const { sendResetPasswordEmail } = require("../utils/sendEmail");
const { error } = require("console");

router.post("/register", async (req, res) => {
  console.log("inside register flow");

  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });

    const exists = await User.findOne({ email });

    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const token = crypto.randomBytes(32).toString("hex");

    await User.create({
      name: name, // new
      email: email,
      password: hashed,
      phone: phone, // new
      verificationToken: token,
      verificationTokenExpiry: Date.now() + 15 * 60 * 1000,
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
  if (!user) return res.status(400).json({ error: "User not found" });

  if (!user.isVerified)
    return res.status(403).json({
      error: "Please verify your email before login",
    });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  console.log("token  is", token);

  res.json({ token });
});

router.get("/users", async (req, res) => {
  let users;

  try {
    users = await User.find().sort({ name: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/verify-email/:token", async (req, res) => {
  const { token } = req.params;
  console.log("inside verify email");

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
    console.log("Inside forgot password, the user object has", user);

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
    console.log("token is ", token);

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
    console.log("password reset successful");

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
  // Add this header to skip ngrok warning page
  res.setHeader("ngrok-skip-browser-warning", "69420"); // any value works
  return res.redirect(`lecca://reset-password/${token}`);
});

module.exports = router;
