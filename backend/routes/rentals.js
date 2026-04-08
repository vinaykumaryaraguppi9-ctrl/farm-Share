const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  // Get all rentals for a user
  router.get('/user/:user_id', async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(
        `SELECT r.*,
         e.name as equipment_name,
         e.daily_rate,
         u.name as owner_name, u.phone as owner_phone, u.location as owner_location,
         renter.name as renter_name, renter.phone as renter_phone, renter.location as renter_location
         FROM rentals r
         JOIN equipment e ON r.equipment_id = e.id
         JOIN users u ON r.owner_id = u.id
         JOIN users renter ON r.renter_id = renter.id
         WHERE r.renter_id = $1 OR r.owner_id = $1`,
        [user_id]
      );
      res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Check if equipment is currently rented (Under Use)
  router.get('/equipment/:equipment_id/active', async (req, res) => {
    const { equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    try {
      const result = await pool.query(
        `SELECT r.*, u.name as renter_name
         FROM rentals r
         JOIN users u ON r.renter_id = u.id
         WHERE r.equipment_id = $1 AND r.status = 'approved'
         AND r.start_date <= $2 AND r.end_date >= $2
         LIMIT 1`,
        [equipment_id, today]
      );
      res.json(result.rows[0] || null);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get active rental by equipment if rented today
  router.get('/equipment/:equipment_id/status', async (req, res) => {
    const { equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const result = await pool.query(
        `SELECT r.id, r.equipment_id, r.start_date, r.end_date, r.renter_id, r.total_cost, u.name as renter_name
         FROM rentals r
         JOIN users u ON r.renter_id = u.id
         WHERE r.equipment_id = $1 AND r.status = 'approved'
         AND r.start_date <= $2 AND r.end_date >= $2
         ORDER BY r.end_date DESC
         LIMIT 1`,
        [equipment_id, today]
      );
      res.json({ isRented: result.rows.length > 0, rental: result.rows[0] || null });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
});

  // Get user's active rental for specific equipment
  router.get('/user/:user_id/equipment/:equipment_id', async (req, res) => {
    const { user_id, equipment_id } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const result = await pool.query(
        `SELECT r.*
         FROM rentals r
         WHERE r.equipment_id = $1 AND r.renter_id = $2 AND r.status = 'approved'
         AND r.start_date <= $3 AND r.end_date >= $3
         ORDER BY r.end_date DESC
         LIMIT 1`,
        [equipment_id, user_id, today]
      );
      res.json(result.rows[0] || null);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Create rental
  router.post('/', async (req, res) => {
    const { equipment_id, renter_id, owner_id, start_date, end_date, total_cost } = req.body;
    
    if (!equipment_id || !renter_id || !owner_id || !start_date || !end_date || !total_cost) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const result = await pool.query(
        `INSERT INTO rentals (equipment_id, renter_id, owner_id, start_date, end_date, total_cost)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [equipment_id, renter_id, owner_id, start_date, end_date, total_cost]
      );
      res.json({ id: result.rows[0].id, message: 'Rental created' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Extend rental
  router.post('/:id/extend', async (req, res) => {
    const { id } = req.params;
    const { new_end_date, additional_cost } = req.body;
    
    if (!new_end_date || additional_cost === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      // First get the current rental
      const rentalResult = await pool.query(
        `SELECT * FROM rentals WHERE id = $1`,
        [id]
      );
      
      if (rentalResult.rows.length === 0) {
        return res.status(404).json({ error: 'Rental not found' });
      }
      
      const rental = rentalResult.rows[0];
      
      // Update the rental
      await pool.query(
        `UPDATE rentals SET end_date = $1, total_cost = total_cost + $2 WHERE id = $3`,
        [new_end_date, additional_cost, id]
      );
      
      res.json({ message: 'Rental extended successfully' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Update rental status
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    try {
      await pool.query(
        `UPDATE rentals SET status = $1 WHERE id = $2`,
        [status, id]
      );
      res.json({ message: 'Rental updated' });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Get rental details
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `SELECT r.*, e.name as equipment_name, e.daily_rate, u.name as renter_name, o.name as owner_name
         FROM rentals r
         JOIN equipment e ON r.equipment_id = e.id
         JOIN users u ON r.renter_id = u.id
         JOIN users o ON r.owner_id = o.id
         WHERE r.id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Rental not found' });
      }
      res.json(result.rows[0]);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });

  return router;
};

