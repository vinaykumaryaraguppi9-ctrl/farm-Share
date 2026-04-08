const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'equipment.db');
const db = new sqlite3.Database(DB_PATH);

// Seed database with sample data
db.serialize(() => {
  // Insert sample users
  const users = [
    ['john@farm.com', 'password123', 'John Smith', 'Iowa', '555-0101'],
    ['jane@farm.com', 'password456', 'Jane Doe', 'Nebraska', '555-0102'],
    ['bob@farm.com', 'password789', 'Bob Johnson', 'Illinois', '555-0103']
  ];

  users.forEach(user => {
    db.run(
      `INSERT INTO users (email, password, name, location, phone) VALUES (?, ?, ?, ?, ?)`,
      user
    );
  });

  // Insert sample equipment
  const equipment = [
    [1, 'Tractor John Deere', 'Powerful tractor for heavy lifting', 'Tractors', 150.00],
    [1, 'Plow', 'Heavy duty plow', 'Plows', 75.00],
    [2, 'Combine Harvester', 'Modern combine for harvesting', 'Harvesters', 250.00],
    [2, 'Baler', 'Hay baler in excellent condition', 'Balers', 100.00],
    [3, 'Sprayer', 'Precision spray system', 'Sprayers', 80.00]
  ];

  equipment.forEach(item => {
    db.run(
      `INSERT INTO equipment (owner_id, name, description, category, daily_rate) VALUES (?, ?, ?, ?, ?)`,
      item
    );
  });

  console.log('Database seeded successfully!');
});

db.close();
