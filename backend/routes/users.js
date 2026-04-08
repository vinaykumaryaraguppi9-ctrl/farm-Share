const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Register user
  router.post('/register', async (req, res) => {
    const { email, password, name, location, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, name, location, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, password, name, location, phone]
      );
      res.json({ id: result.rows[0].id, message: 'User registered successfully' });
    } catch (err) {
      if (err.code === '23505') { // unique violation
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(500).json({ error: err.message });
    }
  });

  // Login user
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    try {
      const result = await pool.query(
        `SELECT id, email, name, location, phone FROM users WHERE email = $1 AND password = $2`,
        [email, password]
      );
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get user profile
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT id, email, name, location, phone, created_at FROM users WHERE id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get user's equipment
  router.get('/:id/equipment', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT * FROM equipment WHERE owner_id = $1`,
        [id]
      );
      res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Update user profile
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, location, phone } = req.body;
    
    try {
      await pool.query(
        `UPDATE users SET name = $1, location = $2, phone = $3 WHERE id = $4`,
        [name, location, phone, id]
      );
      res.json({ message: 'Profile updated' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
};
