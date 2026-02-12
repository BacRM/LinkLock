const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "rootATsmart_btp",
  password: "allah@smart_btp",
  database: "Linklock",
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données :", err);
    return;
  }
  console.log("Connecté à la base de données MariaDB.");
});

module.exports = connection;