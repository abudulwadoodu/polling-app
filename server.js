// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const connectDB = require("./config/db");
require('dotenv').config();

const app = express();
const port = 3000;

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const pollRoutes = require("./routes/pollRoutes");
app.use("/", pollRoutes);

// Catch-all for SPA (must be last, after static and API routes)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});