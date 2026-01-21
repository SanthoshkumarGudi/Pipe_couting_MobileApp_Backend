const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
name: { type: String, required: true },
phone: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },

  isVerified: { type: Boolean, default: false },

  verificationToken: String,
  verificationTokenExpiry: Date,
  resetPasswordToken: String,
resetPasswordExpiry: Date,

});

module.exports = mongoose.model("User", UserSchema);
