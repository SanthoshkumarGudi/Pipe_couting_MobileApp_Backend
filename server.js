// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./routes/auth");
const templateRoutes = require("./routes/templates");
const countRouter = require('./routes/count');

const app = express();

/* ✅ ENABLE CORS FIRST */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

/* ✅ BODY PARSER MUST COME FIRST */
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use('/api/count', countRouter);
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => console.log("Server started on 5000"));
