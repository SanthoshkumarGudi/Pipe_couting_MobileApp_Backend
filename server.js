// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");

const app = express();

/* ✅ BODY PARSER MUST COME FIRST */
app.use(express.json());

app.use("/api/auth", authRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server started on 5000"));
