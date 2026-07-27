const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

// ADD THIS LINE TO DEBUG:
console.log("👀 CHECKING ENV FILE: ", process.env.MONGO_URI);
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/games", require("./routes/games"));
app.use("/api/retrospectives", require("./routes/retrospectives"));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
