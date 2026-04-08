const express = require('express');

module.exports = (db) => {
  const router = express.Router();

  // Get all rentals for a user
  router.get('/user/:user_id', (req, res) => {
    const { user_id } = req.params;
    const query = `SELECT r.*, 
                   e.name as equipment_name, 
                   e.daily_rate,
                   u.name as owner_name, u.phone as owner_phone, u.location as owner_location,
                   renter.name as renter_name, renter.phone as renter_phone, renter.location as renter_location
                   FROM rentals r
                   JOIN equipment e ON r.equipment_id = e.id
                   JOIN users u ON r.owner_id = u.id
                   JOIN users renter ON r.renter_id = renter.id
                   WHERE r.renter_id = ? OR r.owner_id = ?`;
    
    db.all(query, [user_id, user_id], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  // Check if equipment is currently rented (Under Use)
  router.get('/equipment/:equipment_id/active', (req, res) => {
    const { equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const query = `SELECT r.*, u.name as renter_name 
                   FROM rentals r
                   JOIN users u ON r.renter_id = u.id
                   WHERE r.equipment_id = ? AND r.status = 'approved' 
                   AND r.start_date <= ? AND r.end_date >= ?
                   LIMIT 1`;
    
    db.get(query, [equipment_id, today, today], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || null);
    });
  });

  // Get active rental by equipment if rented today
  router.get('/equipment/:equipment_id/status', (req, res) => {
    const { equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const query = `SELECT r.id, r.equipment_id, r.start_date, r.end_date, r.renter_id, r.total_cost, u.name as renter_name
                   FROM rentals r
                   JOIN users u ON r.renter_id = u.id
                   WHERE r.equipment_id = ? AND r.status = 'approved'
                   AND r.start_date <= ? AND r.end_date >= ?
                   ORDER BY r.end_date DESC
                   LIMIT 1`;
    
    db.get(query, [equipment_id, today, today], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ isRented: row ? true : false, rental: row || null });
    });
  });

  // Get user's active rental for specific equipment
  router.get('/user/:user_id/equipment/:equipment_id', (req, res) => {
    const { user_id, equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    const query = `SELECT r.* 
                   FROM rentals r
                   WHERE r.equipment_id = ? AND r.renter_id = ? AND r.status = 'approved'
                   AND r.start_date <= ? AND r.end_date >= ?
                   ORDER BY r.end_date DESC
                   LIMIT 1`;
    
    db.get(query, [equipment_id, user_id, today, today], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || null);
    });
  });

  // Create rental
  router.post('/', (req, res) => {
    const { equipment_id, renter_id, owner_id, start_date, end_date, total_cost } = req.body;
    
    if (!equipment_id || !renter_id || !owner_id || !start_date || !end_date || !total_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO rentals (equipment_id, renter_id, owner_id, start_date, end_date, total_cost)
                   VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [equipment_id, renter_id, owner_id, start_date, end_date, total_cost], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, message: 'Rental created' });
    });
  });

  // Extend rental
  router.post('/:id/extend', (req, res) => {
    const { id } = req.params;
    const { new_end_date, additional_cost } = req.body;
    
    if (!new_end_date || additional_cost === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First get the current rental
    const getRentalQuery = `SELECT * FROM rentals WHERE id = ?`;
    
    db.get(getRentalQuery, [id], (err, rental) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rental) return res.status(404).json({ error: 'Rental not found' });

      // Calculate new total cost
      const newTotalCost = rental.total_cost + additional_cost;
      
      // Update the rental with new end date and total cost
      const updateQuery = `UPDATE rentals SET end_date = ?, total_cost = ? WHERE id = ?`;
      
      db.run(updateQuery, [new_end_date, newTotalCost, id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
          message: 'Rental extended successfully',
          new_end_date,
          new_total_cost: newTotalCost,
          additional_cost
        });
      });
    });
  });

  // Update rental status
  router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const query = `UPDATE rentals SET status = ? WHERE id = ?`;
    
    db.run(query, [status, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Rental updated' });
    });
  });

  // Get rental details
  router.get('/:id', (req, res) => {
    const { id } = req.params;
    const query = `SELECT r.*, e.name as equipment_name, e.daily_rate, u.name as renter_name, o.name as owner_name
                   FROM rentals r
                   JOIN equipment e ON r.equipment_id = e.id
                   JOIN users u ON r.renter_id = u.id
                   JOIN users o ON r.owner_id = o.id
                   WHERE r.id = ?`;
    
    db.get(query, [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Rental not found' });
      res.json(row);
    });
  });

  return router;
};

