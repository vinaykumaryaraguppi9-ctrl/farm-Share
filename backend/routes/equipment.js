const express = require('express');

module.exports = (pool, upload) => {
  const router = express.Router();

  // Get all available equipment
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT e.*, u.name as owner_name, u.location
         FROM equipment e
         JOIN users u ON e.owner_id = u.id
         WHERE e.availability = true`
      );
      res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get equipment by category
  router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const result = await pool.query(
        `SELECT e.*, u.name as owner_name
         FROM equipment e
         JOIN users u ON e.owner_id = u.id
         WHERE e.category = $1 AND e.availability = true`,
        [category]
      );
      res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get single equipment
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT e.*, u.name as owner_name, u.email, u.phone, u.location
         FROM equipment e
         JOIN users u ON e.owner_id = u.id
         WHERE e.id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Add new equipment with image upload
  router.post('/', upload.single('image'), async (req, res) => {
    try {
      console.log('=== EQUIPMENT POST REQUEST ===');
      console.log('Body:', req.body);
      console.log('File:', req.file ? { filename: req.file.filename, size: req.file.size } : 'No file');
      
      const { owner_id, name, description, category, daily_rate } = req.body;
      
      // Convert to numbers
      const owner_id_num = parseInt(owner_id);
      const daily_rate_num = parseFloat(daily_rate);
      
      console.log('Parsed values:', {
        owner_id_num,
        name,
        category,
        daily_rate_num
      });
      
      // Check for missing fields
      const errors = [];
      if (!owner_id_num || isNaN(owner_id_num)) errors.push(`owner_id is invalid: ${owner_id}`);
      if (!name || name.trim() === '') errors.push(`name is empty`);
      if (!category || category.trim() === '') errors.push(`category is empty`);
      if (!daily_rate_num || isNaN(daily_rate_num) || daily_rate_num <= 0) errors.push(`daily_rate is invalid: ${daily_rate}`);
      
      if (errors.length > 0) {
        console.error('Validation errors:', errors);
        if (req.file) {
          const fs = require('fs');
          fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting file:', err);
          });
        }
        return res.status(400).json({ error: errors.join('; ') });
      }

      const image_url = req.file ? `/uploads/${req.file.filename}` : null;
      
      const result = await pool.query(
        `INSERT INTO equipment (owner_id, name, description, category, daily_rate, image_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [owner_id_num, name.trim(), description || '', category.trim(), daily_rate_num, image_url]
      );
      
      console.log('Equipment added successfully with ID:', result.rows[0].id);
      res.json({ id: result.rows[0].id, message: 'Equipment added successfully', image_url });
    } catch (error) {
      console.error('Unexpected error:', error);
      if (req.file) {
        const fs = require('fs');
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      }
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  });

  // Update equipment
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, daily_rate, availability } = req.body;
    
    try {
      await pool.query(
        `UPDATE equipment SET name = $1, description = $2, daily_rate = $3, availability = $4 WHERE id = $5`,
        [name, description, daily_rate, availability, id]
      );
      res.json({ message: 'Equipment updated' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Delete equipment
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      await pool.query(
        `DELETE FROM equipment WHERE id = $1`,
        [id]
      );
      res.json({ message: 'Equipment deleted' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
};
