const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/db");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { initializeDatabase } = require("./src/models/init-db");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware pour le débogage (affiché uniquement en mode développement)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    next();
  });
}

// Import Backend API routes (Express routers)
const companiesRouter = require("./src/backend/companies");
const personnelRouter = require("./src/backend/personnel");
const keysRouter = require("./src/backend/keys");
const logger = require("./src/api/logger");

// Use API routes
app.use("/api/companies", companiesRouter);
app.use("/api/personnel", personnelRouter);
app.use("/api/keys", keysRouter);

// Initialize database tables on startup
initializeDatabase().then(() => {
  console.log("Database tables initialized");
}).catch((err) => {
  console.error("Failed to initialize database:", err);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur Node.js démarré sur le port ${PORT}`);
  logger.info("Server started", { port: PORT });
});
