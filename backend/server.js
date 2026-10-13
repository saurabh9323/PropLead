const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const leadRoutes = require("./src/routes/leadRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const userRoutes = require("./src/routes/userRoutes");
const { authenticateToken } = require("./src/middlewares/authMiddleware");
const { callValue } = require("./src/db/routines");
const handleControllerError = require("./src/utils/controllerError");
const AppError = require("./src/utils/appError");
const apiResponse = require("./src/utils/apiResponse");

if (!process.env.JWT_SECRET) throw new Error("Set JWT_SECRET in backend/.env before starting the server");

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use((req, res, next) => {
  if (["POST", "PUT"].includes(req.method) && (!req.is("application/json") || !req.body || Array.isArray(req.body) || typeof req.body !== "object")) {
    return handleControllerError(res, new AppError("Send an application/json object body", 400));
  }
  next();
});

app.get("/api/health", (req, res) => {
  res.json(apiResponse(200, "Service healthy", { status: "ok" }));
});





app.use("/api", authRoutes);
app.use("/api", authenticateToken);
app.use("/api", leadRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", userRoutes);
app.use((req, res) => handleControllerError(res, new AppError("Endpoint not found", 404)));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  handleControllerError(res, error);
});

callValue("crm_health")
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection failed:", error.message));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
