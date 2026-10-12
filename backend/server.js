const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const userRoutes = require("./src/routes/userRoutes");
const { authenticateToken } = require("./src/middlewares/authMiddleware");
const pool = require("./src/db/db");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", authRoutes);
app.use("/api", authenticateToken);
app.use("/api", leadRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", userRoutes);

pool
  .query("SELECT NOW()")
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection failed:", error.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
