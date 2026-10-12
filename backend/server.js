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


// PORT=5000
// DATABASE_URL=postgresql://postgres.tajilgwjlskncnuakgsw:S9323673405s@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres
// JWT_SECRET=proplead-local-jwt-secret
// NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api



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
