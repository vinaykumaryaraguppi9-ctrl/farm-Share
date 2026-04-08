# Farm Equipment Sharing Platform

A full-stack web application for farmers to share and rent agricultural equipment.

## Project Structure

```
Farm equipment sharing platform/
├── backend/
│   ├── routes/
│   │   ├── equipment.js
│   │   ├── rentals.js
│   │   └── users.js
│   ├── index.js
│   ├── seed.js
│   ├── package.json
│   ├── .env
│   └── equipment.db (created after running)
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── HomePage.js
    │   │   ├── EquipmentDetailPage.js
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   └── DashboardPage.js
    │   ├── App.js
    │   ├── index.js
    │   └── [CSS files]
    ├── public/
    │   └── index.html
    └── package.json
```

## Features

- **User Authentication**: Register and login functionality
- **Browse Equipment**: Search and filter farm equipment by category
- **Equipment Rental**: Request rental of equipment with date selection
- **Equipment Management**: Owners can add and manage their equipment
- **Rental Management**: View and manage rental requests
- **User Dashboard**: Track rentals and equipment listings
- **Rating System**: Leave reviews for rentals

## Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite3** Database
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

### Frontend
- **React 18**
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** for styling

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Equipment Table
```sql
CREATE TABLE equipment (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  daily_rate REAL NOT NULL,
  availability INTEGER DEFAULT 1,
  image_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(owner_id) REFERENCES users(id)
)
```

### Rentals Table
```sql
CREATE TABLE rentals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  equipment_id INTEGER NOT NULL,
  renter_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_cost REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(equipment_id) REFERENCES equipment(id),
  FOREIGN KEY(renter_id) REFERENCES users(id),
  FOREIGN KEY(owner_id) REFERENCES users(id)
)
```

### Reviews Table
```sql
CREATE TABLE reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rental_id INTEGER NOT NULL,
  reviewer_id INTEGER NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(rental_id) REFERENCES rentals(id),
  FOREIGN KEY(reviewer_id) REFERENCES users(id)
)
```

## API Endpoints

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/:id` - Get user profile
- `GET /api/users/:id/equipment` - Get user's equipment
- `PUT /api/users/:id` - Update user profile

### Equipment
- `GET /api/equipment` - Get all available equipment
- `GET /api/equipment/category/:category` - Get equipment by category
- `GET /api/equipment/:id` - Get equipment details
- `POST /api/equipment` - Add new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Rentals
- `GET /api/rentals/user/:user_id` - Get user's rentals
- `GET /api/rentals/:id` - Get rental details
- `POST /api/rentals` - Create rental request
- `PUT /api/rentals/:id` - Update rental status

## Installation & Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created) with:
```
PORT=5000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm start
```

5. Seed the database with sample data (optional):
```bash
npm run seed
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open at `http://localhost:3000` and the backend API runs on `http://localhost:5000`.

## Sample Login Credentials

After running the seed script, use these credentials to login:

- **User 1**: john@farm.com / password123
- **User 2**: jane@farm.com / password456
- **User 3**: bob@farm.com / password789

## Features in Detail

### Homepage
- Browse all available equipment
- Filter by category (Tractors, Plows, Harvesters, Balers, Sprayers)
- View equipment name, description, owner, location, and daily rate

### Equipment Detail Page
- View full equipment details
- View owner contact information
- Select rental dates
- Calculate total rental cost
- Submit rental request (requires login)

### User Registration
- Create new account with email, password, name, location, and phone

### User Login
- Authenticate with email and password
- Session maintained in localStorage

### Dashboard
- **My Rentals Tab**: View all rental requests made and received
- **My Equipment Tab**: View owned equipment, add new equipment
- **Rental Management**: Approve or reject rental requests
- **Equipment Management**: Add new equipment to share

## Future Enhancements

1. Payment integration (Stripe/PayPal)
2. Real-time notifications
3. Advanced search with filters
4. Equipment availability calendar
5. Review and rating system
6. Insurance options
7. Mobile app version
8. Email notifications
9. Equipment condition reporting
10. Damage claims system

## Security Considerations

- Implement JWT authentication instead of localStorage
- Add password hashing (bcrypt)
- Add input validation and sanitization
- Add HTTPS
- Implement rate limiting
- Add user role management (admin, owner, renter)

## Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Ensure all dependencies are installed: `npm install`
- Check .env file exists

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS is enabled in backend
- Verify API URLs match in frontend code

### Database errors
- Delete existing `equipment.db` file
- Run seed script to recreate database: `npm run seed`

## Support

For issues or questions, please create an issue in the repository.

---

**Version**: 1.0.0  
**Last Updated**: April 2026
