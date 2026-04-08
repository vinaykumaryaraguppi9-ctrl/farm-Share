const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Register user
  router.post('/register', (req, res) => {
    const { email, password, name, location, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO users (email, password, name, location, phone)
                   VALUES (?, ?, ?, ?, ?)`;
    
    db.run(query, [email, password, name, location, phone], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Email already registered' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: this.lastID, message: 'User registered successfully' });
    });
  });

  // Login user
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const query = `SELECT id, email, name, location, phone FROM users WHERE email = ? AND password = ?`;
    
    db.get(query, [email, password], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: 'Invalid credentials' });
      res.json(row);
    });
  });

  // Get user profile
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT id, email, name, location, phone, created_at FROM users WHERE id = ?`;
    
    db.get(query, [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'User not found' });
      res.json(row);
    });
  });

  // Get user's equipment
  router.get('/:id/equipment', (req, res) => {
    const { id } = req.params;
    const query = `SELECT * FROM equipment WHERE owner_id = ?`;
    
    db.all(query, [id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Update user profile
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, location, phone } = req.body;
    
    const query = `UPDATE users SET name = ?, location = ?, phone = ? WHERE id = ?`;
    
    db.run(query, [name, location, phone, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Profile updated' });
    });
  });

  return router;
};
