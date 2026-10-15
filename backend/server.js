const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const os = require("os");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const serverName = () => process.env.SERVER_NAME || os.hostname();
app.use((req, res, next) => {
  res.set("X-Server", serverName());
  next();
});


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", server: serverName() });
});
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/headsets", require("./routes/headsetRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Export the app object
if (require.main === module) {
  connectDB();
  // start the server
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
