const express = require("express");
const bodyParser = require("body-parser");
const db = require("./src/config/db");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: "http://localhost:3000", // Autorise uniquement les requêtes provenant de cette origine
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Middleware pour le débogage (affiché uniquement en mode développement)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    next();
  });
}

// Route pour la connexion
app.post("/api/users/login", (req, res) => {
  res.status(200).json({ message: "Accès autorisé à tout le monde" });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur Node.js démarré sur le port ${PORT}`);
});