const db = require("./config/db");
const bcrypt = require("bcryptjs");

const createAdmin = async () => {
  try {
    const password = "Azerty123";
    const hashedPassword = await bcrypt.hash(password, 10); // Hachage du mot de passe

    const adminData = {
      username: "Admin",
      password: hashedPassword, // Utilisation du mot de passe haché
      email: "admin@example.com", // Remplacez par un email valide si nécessaire
      role: "admin",
    };

    const query = `INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)`;
    db.query(query, [adminData.username, adminData.password, adminData.email, adminData.role], (err, results) => {
      if (err) {
        console.error("Error creating admin account:", err);
        return;
      }
      console.log("Admin account created successfully.");
    });
  } catch (error) {
    console.error("Error hashing password:", error);
  }
};

createAdmin();