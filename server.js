// server.js
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const port = 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const pollRoutes = require("./routes/pollRoutes");
app.use("/", pollRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
