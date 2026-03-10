const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const token = parts[1];

    const user = await User.findOne({ apiToken: token });

    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;

    next();

  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = authMiddleware;