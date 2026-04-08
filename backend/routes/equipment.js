const express = require('express');

module.exports = (db, upload) => {
  const router = express.Router();

  // Get all available equipment
  router.get('/', (req, res) => {
    const query = `SELECT e.*, u.name as owner_name, u.location 
                   FROM equipment e 
                   JOIN users u ON e.owner_id = u.id 
                   WHERE e.availability = 1`;
    
    db.all(query, (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Get equipment by category
  router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    const query = `SELECT e.*, u.name as owner_name 
                   FROM equipment e 
                   JOIN users u ON e.owner_id = u.id 
                   WHERE e.category = ? AND e.availability = 1`;
    
    db.all(query, [category], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Get single equipment
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT e.*, u.name as owner_name, u.email, u.phone, u.location
                   FROM equipment e 
                   JOIN users u ON e.owner_id = u.id 
                   WHERE e.id = ?`;
    
    db.get(query, [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Equipment not found' });
      res.json(row);
    });
  });

  // Add new equipment with image upload
  router.post('/', upload.single('image'), (req, res) => {
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
      
      const query = `INSERT INTO equipment (owner_id, name, description, category, daily_rate, image_url) 
                     VALUES (?, ?, ?, ?, ?, ?)`;
      
      const values = [owner_id_num, name.trim(), description || '', category.trim(), daily_rate_num, image_url];
      console.log('Inserting into DB:', { query, values });
      
      db.run(query, values, function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }
        console.log('Equipment added successfully with ID:', this.lastID);
        res.json({ id: this.lastID, message: 'Equipment added successfully', image_url });
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Server error: ' + error.message });
    }
  });

  // Update equipment
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description, daily_rate, availability } = req.body;
    
    const query = `UPDATE equipment SET name = ?, description = ?, daily_rate = ?, availability = ? WHERE id = ?`;
    
    db.run(query, [name, description, daily_rate, availability, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Equipment updated' });
    });
  });

  // Delete equipment
  router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM equipment WHERE id = ?`;
    
    db.run(query, [id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Equipment deleted' });
    });
  });

  return router;
};
