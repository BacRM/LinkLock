const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost", // Remplacez par l'adresse de votre serveur MariaDB si nécessaire
  user: "root",
  password: "allah",
  database: "Linklock", // Remplacez par le nom de votre base de données
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MariaDB.");
});

module.exports = connection;