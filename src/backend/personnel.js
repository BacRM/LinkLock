/**
 * Personnel Backend Routes
 * Express router with Bcrypt password hashing
 */

const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { hashPassword, verifyPassword, logAction } = require("../../models/init-db");

// Get all personnel
router.get("/", (req, res) => {
  const { company_id, role, status } = req.query;
  let sql = `
    SELECT p.*, c.name as company_name 
    FROM personnel p 
    LEFT JOIN companies c ON p.company_id = c.id 
    WHERE 1=1
  `;
  const params = [];
  
  if (company_id) {
    sql += " AND p.company_id = ?";
    params.push(company_id);
  }
  if (role) {
    sql += " AND p.role = ?";
    params.push(role);
  }
  if (status) {
    sql += " AND p.status = ?";
    params.push(status);
  }
  sql += " ORDER BY p.last_name, p.first_name";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching personnel:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get personnel by company (for dropdowns)
router.get("/by-company/:companyId", (req, res) => {
  const sql = `
    SELECT id, first_name, last_name, email, role 
    FROM personnel 
    WHERE company_id = ? AND status = 'active'
    ORDER BY last_name, first_name
  `;
  
  db.query(sql, [req.params.companyId], (err, results) => {
    if (err) {
      console.error("Error fetching personnel:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get personnel by ID
router.get("/:id", (req, res) => {
  const sql = `
    SELECT p.*, c.name as company_name 
    FROM personnel p 
    LEFT JOIN companies c ON p.company_id = c.id 
    WHERE p.id = ?
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching personnel:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Personnel not found" });
    }
    res.json(results[0]);
  });
});

// Create personnel with Bcrypt password hashing
router.post("/", async (req, res) => {
  const { 
    company_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    role, 
    access_level,
    password,
    status 
  } = req.body;
  
  try {
    // Hash password with Bcrypt (10 rounds as per S-Directive)
    const password_hash = await hashPassword(password || "password123");
    
    const sql = `
      INSERT INTO personnel 
      (company_id, first_name, last_name, email, phone, role, access_level, password_hash, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(sql, [
      company_id, 
      first_name, 
      last_name, 
      email, 
      phone, 
      role || 'employee', 
      access_level || 'limited',
      password_hash,
      status || 'active'
    ], (err, result) => {
      if (err) {
        console.error("Error creating personnel:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      logAction("PERSONNEL_CREATE", { 
        personnel_id: result.insertId, 
        email, 
        role, 
        company_id 
      });
      
      res.status(201).json({ 
        id: result.insertId, 
        message: "Personnel created successfully",
        email,
        role
      });
    });
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(500).json({ error: "Password hashing failed" });
  }
});

// Update personnel
router.put("/:id", async (req, res) => {
  const { 
    company_id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    role, 
    access_level,
    password,
    status 
  } = req.body;
  const personnelId = req.params.id;
  
  try {
    let sql = `
      UPDATE personnel 
      SET company_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, 
          role = ?, access_level = ?, status = ?
    `;
    const params = [
      company_id, 
      first_name, 
      last_name, 
      email, 
      phone, 
      role, 
      access_level,
      status
    ];
    
    // Update password if provided
    if (password) {
      const password_hash = await hashPassword(password);
      sql += ", password_hash = ?";
      params.push(password_hash);
    }
    
    sql += " WHERE id = ?";
    params.push(personnelId);
    
    db.query(sql, params, (err, result) => {
      if (err) {
        console.error("Error updating personnel:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      logAction("PERSONNEL_UPDATE", { 
        personnel_id: personnelId, 
        email, 
        role 
      });
      
      res.json({ message: "Personnel updated successfully" });
    });
  } catch (err) {
    console.error("Error hashing password:", err);
    res.status(500).json({ error: "Password hashing failed" });
  }
});

// Delete personnel
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM personnel WHERE id = ?";
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error deleting personnel:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("PERSONNEL_DELETE", { personnel_id: req.params.id });
    
    res.json({ message: "Personnel deleted successfully" });
  });
});

// Login endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const sql = "SELECT * FROM personnel WHERE email = ? AND status = 'active'";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = results[0];
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    logAction("PERSONNEL_LOGIN", { 
      personnel_id: user.id, 
      email: user.email,
      role: user.role
    });
    
    res.json({
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      company_id: user.company_id,
      access_level: user.access_level
    });
  });
});

module.exports = router;
