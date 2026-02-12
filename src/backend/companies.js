/**
 * Companies Backend Routes
 * Express router with hierarchy support (parent/child)
 */

const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { logAction } = require("../models/init-db");

// Get all companies
router.get("/", (req, res) => {
  const { type, status } = req.query;
  let sql = "SELECT * FROM companies WHERE 1=1";
  const params = [];
  
  if (type) {
    sql += " AND type = ?";
    params.push(type);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  sql += " ORDER BY name";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching companies:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get parent companies (agencies that can have conciergeries)
router.get("/parents", (req, res) => {
  const sql = "SELECT * FROM companies WHERE type = 'agence_imobiliere' AND status = 'active' ORDER BY name";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching parent companies:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get child companies for a parent
router.get("/:parentId/children", (req, res) => {
  const sql = "SELECT * FROM companies WHERE parent_id = ? ORDER BY name";
  
  db.query(sql, [req.params.parentId], (err, results) => {
    if (err) {
      console.error("Error fetching child companies:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get hierarchy tree
router.get("/hierarchy", (req, res) => {
  const sql = `
    SELECT c.*, p.name as parent_name 
    FROM companies c 
    LEFT JOIN companies p ON c.parent_id = p.id 
    ORDER BY c.type, c.name
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching hierarchy:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    // Group by parent
    const hierarchy = {
      agencies: results.filter(c => c.type === 'agence_imobiliere'),
      conciergeries: results.filter(c => c.type === 'conciergerie')
    };
    
    res.json(hierarchy);
  });
});

// Get company by ID
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM companies WHERE id = ?";
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching company:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(results[0]);
  });
});

// Create company
router.post("/", (req, res) => {
  const { name, type, parent_id, siret, address, phone, email, status } = req.body;
  
  const sql = `
    INSERT INTO companies (name, type, parent_id, siret, address, phone, email, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [name, type, parent_id || null, siret, address, phone, email, status || 'active'], (err, result) => {
    if (err) {
      console.error("Error creating company:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("COMPANY_CREATE", { company_id: result.insertId, name, type, parent_id });
    
    res.status(201).json({ 
      id: result.insertId, 
      message: "Company created successfully",
      name, type, parent_id
    });
  });
});

// Update company
router.put("/:id", (req, res) => {
  const { name, type, parent_id, siret, address, phone, email, status } = req.body;
  const companyId = req.params.id;
  
  const sql = `
    UPDATE companies 
    SET name = ?, type = ?, parent_id = ?, siret = ?, address = ?, phone = ?, email = ?, status = ?
    WHERE id = ?
  `;
  
  db.query(sql, [name, type, parent_id || null, siret, address, phone, email, status, companyId], (err, result) => {
    if (err) {
      console.error("Error updating company:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("COMPANY_UPDATE", { company_id: companyId, name, type, parent_id });
    
    res.json({ message: "Company updated successfully" });
  });
});

// Delete company
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM companies WHERE id = ?";
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error deleting company:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("COMPANY_DELETE", { company_id: req.params.id });
    
    res.json({ message: "Company deleted successfully" });
  });
});

module.exports = router;
