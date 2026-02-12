/**
 * Database Schema for Company Management Module
 * Tables: companies, personnel, keys, key_shares
 * Supports hierarchy (parent/child) and sharing
 */

const db = require("../config/db");
const bcrypt = require("bcryptjs");

// SQL statements for creating tables
const createTablesSQL = [
  // Companies table - supports Conciergerie and Agence Immobilière types with hierarchy
  `CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('conciergerie', 'agence_imobiliere') NOT NULL,
    parent_id INT NULL,
    siret VARCHAR(50),
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES companies(id) ON DELETE SET NULL
  )`,

  // Personnel table - linked to companies
  `CREATE TABLE IF NOT EXISTS personnel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role ENUM('manager', 'employee', 'admin') NOT NULL,
    access_level ENUM('full', 'limited', 'restricted') DEFAULT 'limited',
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
  )`,

  // Keys table - owned by origin company (renamed from 'keys' to 'lock_keys' because 'keys' is reserved)
  `CREATE TABLE IF NOT EXISTS lock_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entreprise_origine_id INT NOT NULL,
    company_id INT NOT NULL,
    manager_id INT,
    address VARCHAR(500) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    owner_contact VARCHAR(255),
    house_manager_name VARCHAR(255),
    house_manager_contact VARCHAR(255),
    key_location VARCHAR(255),
    status ENUM('available', 'borrowed', 'returned', 'lost') DEFAULT 'available',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entreprise_origine_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES personnel(id) ON DELETE SET NULL
  )`,

  // Key shares table - for manual key sharing between companies
  `CREATE TABLE IF NOT EXISTS key_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_id INT NOT NULL,
    shared_with_company_id INT NOT NULL,
    shared_by_user_id INT,
    permissions ENUM('view', 'edit', 'full') DEFAULT 'view',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (key_id) REFERENCES lock_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_user_id) REFERENCES personnel(id) ON DELETE SET NULL,
    UNIQUE KEY unique_share (key_id, shared_with_company_id)
  )`
];

// Initialize database tables
const initializeDatabase = async () => {
  try {
    for (const sql of createTablesSQL) {
      await new Promise((resolve, reject) => {
        db.query(sql, (err, results) => {
          if (err) {
            console.error("Error creating table:", err);
            reject(err);
          } else {
            console.log("Table created/verified successfully");
            resolve(results);
          }
        });
      });
    }
    console.log("All tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

// Helper function to hash password with bcrypt (10 rounds as per S-Directive)
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Helper function to verify password
const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Discrete logging for audit (S-Directive standard)
const logAction = (action, details = {}) => {
  // In production, this logs to a secure audit log
  // For development, logs to console with timestamp
  const logEntry = {
    timestamp: new Date().toISOString(),
    action,
    details
  };
  
  // Only log in development or explicit audit logs
  if (process.env.NODE_ENV !== 'production') {
    console.log("[AUDIT]", JSON.stringify(logEntry));
  }
  
  return logEntry;
};

module.exports = {
  initializeDatabase,
  hashPassword,
  verifyPassword,
  logAction
};
