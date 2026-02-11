/**
 * Keys Backend Routes
 * Express router with visibility filtering and sharing support
 */

const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { logAction } = require("../../models/init-db");

// Get all keys
router.get("/", (req, res) => {
  const { company_id, status } = req.query;
  let sql = "SELECT k.*, c.name as company_name FROM keys k LEFT JOIN companies c ON k.company_id = c.id WHERE 1=1";
  const params = [];
  
  if (company_id) {
    sql += " AND k.company_id = ?";
    params.push(company_id);
  }
  if (status) {
    sql += " AND k.status = ?";
    params.push(status);
  }
  sql += " ORDER BY k.created_at DESC";
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching keys:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get visible keys for a company (includes hierarchy and shares)
router.get("/visible", (req, res) => {
  const { company_id } = req.query;
  
  if (!company_id) {
    return res.status(400).json({ error: "company_id required" });
  }
  
  // Get company info to determine type
  const getCompanySql = "SELECT * FROM companies WHERE id = ?";
  
  db.query(getCompanySql, [company_id], (err, companies) => {
    if (err) {
      console.error("Error fetching company:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (companies.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    
    const company = companies[0];
    let visibleKeys = [];
    
    // Get keys owned by the company
    const ownedKeysSql = `
      SELECT k.*, c.name as company_name, 'owned' as visibility_type
      FROM keys k 
      LEFT JOIN companies c ON k.company_id = c.id 
      WHERE k.company_id = ?
      ORDER BY k.created_at DESC
    `;
    
    db.query(ownedKeysSql, [company_id], (err, ownedKeys) => {
      if (err) {
        console.error("Error fetching owned keys:", err);
        return res.status(500).json({ error: "Database error" });
      }
      
      visibleKeys = ownedKeys;
      
      // Get keys shared with this company
      const sharedKeysSql = `
        SELECT k.*, c.name as company_name, 'shared' as visibility_type, 
               ks.permissions, ks.created_at as shared_at
        FROM key_shares ks
        JOIN keys k ON ks.key_id = k.id
        LEFT JOIN companies c ON k.company_id = c.id
        WHERE ks.shared_with_company_id = ?
        ORDER BY ks.created_at DESC
      `;
      
      db.query(sharedKeysSql, [company_id], (err, sharedKeys) => {
        if (err) {
          console.error("Error fetching shared keys:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        visibleKeys = [...visibleKeys, ...sharedKeys];
        
        // If company is an agency, also get keys from child conciergeries
        if (company.type === 'agence_imobiliere') {
          const childKeysSql = `
            SELECT k.*, c.name as company_name, 'hierarchy' as visibility_type
            FROM keys k 
            LEFT JOIN companies c ON k.company_id = c.id
            WHERE c.parent_id = ?
            ORDER BY k.created_at DESC
          `;
          
          db.query(childKeysSql, [company_id], (err, childKeys) => {
            if (err) {
              console.error("Error fetching child keys:", err);
              return res.status(500).json({ error: "Database error" });
            }
            
            visibleKeys = [...visibleKeys, ...childKeys];
            res.json(visibleKeys);
          });
        } else {
          res.json(visibleKeys);
        }
      });
    });
  });
});

// Get keys shared with a company
router.get("/shared-with/:companyId", (req, res) => {
  const sql = `
    SELECT k.*, c.name as company_name, ks.permissions, ks.created_at as shared_at
    FROM key_shares ks
    JOIN keys k ON ks.key_id = k.id
    LEFT JOIN companies c ON k.company_id = c.id
    WHERE ks.shared_with_company_id = ?
    ORDER BY ks.created_at DESC
  `;
  
  db.query(sql, [req.params.companyId], (err, results) => {
    if (err) {
      console.error("Error fetching shared keys:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get key by ID
router.get("/:id", (req, res) => {
  const sql = `
    SELECT k.*, c.name as company_name 
    FROM keys k 
    LEFT JOIN companies c ON k.company_id = c.id 
    WHERE k.id = ?
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching key:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Key not found" });
    }
    res.json(results[0]);
  });
});

// Get shares for a key
router.get("/:id/shares", (req, res) => {
  const sql = `
    SELECT ks.*, c.name as company_name
    FROM key_shares ks
    LEFT JOIN companies c ON ks.shared_with_company_id = c.id
    WHERE ks.key_id = ?
    ORDER BY ks.created_at DESC
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching key shares:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get companies a key is shared with
router.get("/:id/shared-with", (req, res) => {
  const sql = `
    SELECT c.*, ks.permissions, ks.created_at as shared_at
    FROM key_shares ks
    JOIN companies c ON ks.shared_with_company_id = c.id
    WHERE ks.key_id = ?
    ORDER BY c.name
  `;
  
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      console.error("Error fetching shared companies:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Create key
router.post("/", (req, res) => {
  const { 
    entreprise_origine_id, 
    company_id, 
    manager_id, 
    address, 
    owner_name, 
    owner_contact,
    house_manager_name,
    house_manager_contact,
    key_location,
    status,
    notes 
  } = req.body;
  
  const sql = `
    INSERT INTO keys 
    (entreprise_origine_id, company_id, manager_id, address, owner_name, owner_contact, 
     house_manager_name, house_manager_contact, key_location, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(sql, [
    entreprise_origine_id, 
    company_id, 
    manager_id, 
    address, 
    owner_name, 
    owner_contact,
    house_manager_name,
    house_manager_contact,
    key_location,
    status || 'available',
    notes
  ], (err, result) => {
    if (err) {
      console.error("Error creating key:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("KEY_CREATE", { key_id: result.insertId, address, company_id });
    
    res.status(201).json({ 
      id: result.insertId, 
      message: "Key created successfully",
      address
    });
  });
});

// Update key
router.put("/:id", (req, res) => {
  const { 
    company_id, 
    manager_id, 
    address, 
    owner_name, 
    owner_contact,
    house_manager_name,
    house_manager_contact,
    key_location,
    status,
    notes 
  } = req.body;
  const keyId = req.params.id;
  
  const sql = `
    UPDATE keys 
    SET company_id = ?, manager_id = ?, address = ?, owner_name = ?, owner_contact = ?,
        house_manager_name = ?, house_manager_contact = ?, key_location = ?, status = ?, notes = ?
    WHERE id = ?
  `;
  
  db.query(sql, [
    company_id, 
    manager_id, 
    address, 
    owner_name, 
    owner_contact,
    house_manager_name,
    house_manager_contact,
    key_location,
    status,
    notes,
    keyId
  ], (err, result) => {
    if (err) {
      console.error("Error updating key:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("KEY_UPDATE", { key_id: keyId, address });
    
    res.json({ message: "Key updated successfully" });
  });
});

// Update key status
router.patch("/:id/status", (req, res) => {
  const { status } = req.body;
  const keyId = req.params.id;
  
  const sql = "UPDATE keys SET status = ? WHERE id = ?";
  
  db.query(sql, [status, keyId], (err, result) => {
    if (err) {
      console.error("Error updating key status:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("KEY_STATUS_CHANGE", { key_id: keyId, status });
    
    res.json({ message: "Status updated successfully" });
  });
});

// Delete key
router.delete("/:id", (req, res) => {
  const sql = "DELETE FROM keys WHERE id = ?";
  
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      console.error("Error deleting key:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("KEY_DELETE", { key_id: req.params.id });
    
    res.json({ message: "Key deleted successfully" });
  });
});

// ============ SHARING ROUTES ============

// Share a key with a company
router.post("/:id/share", (req, res) => {
  const keyId = req.params.id;
  const { shared_with_company_id, permissions } = req.body;
  
  // Check if share already exists
  const checkSql = "SELECT * FROM key_shares WHERE key_id = ? AND shared_with_company_id = ?";
  
  db.query(checkSql, [keyId, shared_with_company_id], (err, existing) => {
    if (err) {
      console.error("Error checking existing share:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    if (existing.length > 0) {
      // Update existing share
      const updateSql = "UPDATE key_shares SET permissions = ? WHERE key_id = ? AND shared_with_company_id = ?";
      db.query(updateSql, [permissions || 'view', keyId, shared_with_company_id], (err) => {
        if (err) {
          console.error("Error updating share:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        logAction("KEY_SHARE_UPDATE", { key_id: keyId, shared_with_company_id, permissions });
        
        res.json({ message: "Share updated successfully" });
      });
    } else {
      // Create new share
      const insertSql = `
        INSERT INTO key_shares (key_id, shared_with_company_id, permissions)
        VALUES (?, ?, ?)
      `;
      
      db.query(insertSql, [keyId, shared_with_company_id, permissions || 'view'], (err, result) => {
        if (err) {
          console.error("Error creating share:", err);
          return res.status(500).json({ error: "Database error" });
        }
        
        logAction("KEY_SHARE_CREATE", { key_id: keyId, shared_with_company_id, permissions });
        
        res.status(201).json({ 
          id: result.insertId, 
          message: "Key shared successfully" 
        });
      });
    }
  });
});

// Unshare a key from a company
router.delete("/:id/share/:companyId", (req, res) => {
  const keyId = req.params.id;
  const companyId = req.params.companyId;
  
  const sql = "DELETE FROM key_shares WHERE key_id = ? AND shared_with_company_id = ?";
  
  db.query(sql, [keyId, companyId], (err, result) => {
    if (err) {
      console.error("Error removing share:", err);
      return res.status(500).json({ error: "Database error" });
    }
    
    logAction("KEY_SHARE_DELETE", { key_id: keyId, shared_with_company_id: companyId });
    
    res.json({ message: "Share removed successfully" });
  });
});

// Get key statistics
router.get("/stats/summary", (req, res) => {
  const { company_id } = req.query;
  
  let sql = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'borrowed' THEN 1 ELSE 0 END) as borrowed,
      SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as lost
    FROM keys
  `;
  
  const params = [];
  if (company_id) {
    sql += " WHERE company_id = ?";
    params.push(company_id);
  }
  
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching key stats:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0]);
  });
});

module.exports = router;
