require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Seed database with sample data
async function seedDatabase() {
  try {
    // Insert sample users
    const users = [
      ['john@farm.com', 'password123', 'John Smith', 'Iowa', '555-0101'],
      ['jane@farm.com', 'password456', 'Jane Doe', 'Nebraska', '555-0102'],
      ['bob@farm.com', 'password789', 'Bob Johnson', 'Illinois', '555-0103']
    ];

    for (const user of users) {
      await pool.query(
        `INSERT INTO users (email, password, name, location, phone) VALUES ($1, $2, $3, $4, $5)`,
        user
      );
    }

    // Insert sample equipment
    const equipment = [
      [1, 'Tractor John Deere', 'Powerful tractor for heavy lifting', 'Tractors', 150.00],
      [1, 'Plow', 'Heavy duty plow', 'Plows', 75.00],
      [2, 'Combine Harvester', 'Modern combine for harvesting', 'Harvesters', 250.00],
      [2, 'Baler', 'Hay baler in excellent condition', 'Balers', 100.00],
      [3, 'Sprayer', 'Precision spray system', 'Sprayers', 80.00]
    ];

    for (const item of equipment) {
      await pool.query(
        `INSERT INTO equipment (owner_id, name, description, category, daily_rate) VALUES ($1, $2, $3, $4, $5)`,
        item
      );
    }

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seedDatabase();
