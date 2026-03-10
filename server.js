// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const templateRoutes = require("./routes/templates");
const countRouter = require('./routes/count');
const authMiddleware = require("./middleware/authMiddleware");

const app = express();

/* ✅ ENABLE CORS FIRST */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

/* ✅ BODY PARSER MUST COME FIRST */
app.use(express.json());
app.use("/images", express.static("public/images"));

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use('/api/count', countRouter);
// app.use("/api/protected", authMiddleware, (req, res) => {
//   res.json({ message: "This is a protected route", user: req.user });
// });
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server started on 5000"));


