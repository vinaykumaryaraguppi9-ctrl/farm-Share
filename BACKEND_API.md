# Backend API Documentation

## Overview
The Farm Equipment Sharing Platform backend is built with Node.js and Express, providing RESTful API endpoints for managing users, equipment, and rentals.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently uses localStorage for client-side session management. Future versions should implement JWT tokens.

---

## USER ENDPOINTS

### 1. Register User
**POST** `/users/register`

Register a new user account.

**Request Body:**
```json
{
  "email": "john@farm.com",
  "password": "password123",
  "name": "John Smith",
  "location": "Iowa",
  "phone": "555-0101"
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "User registered successfully"
}
```

**Error (409):**
```json
{
  "error": "Email already registered"
}
```

---

### 2. Login User
**POST** `/users/login`

Authenticate user with credentials.

**Request Body:**
```json
{
  "email": "john@farm.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "john@farm.com",
  "name": "John Smith",
  "location": "Iowa",
  "phone": "555-0101"
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 3. Get User Profile
**GET** `/users/:id`

Retrieve user profile information.

**Response (200):**
```json
{
  "id": 1,
  "email": "john@farm.com",
  "name": "John Smith",
  "location": "Iowa",
  "phone": "555-0101",
  "created_at": "2026-04-07 10:30:00"
}
```

---

### 4. Get User's Equipment
**GET** `/users/:id/equipment`

Get all equipment owned by a specific user.

**Response (200):**
```json
[
  {
    "id": 1,
    "owner_id": 1,
    "name": "Tractor John Deere",
    "description": "Powerful tractor for heavy lifting",
    "category": "Tractors",
    "daily_rate": 150.00,
    "availability": 1,
    "image_url": null,
    "created_at": "2026-04-07 10:30:00"
  }
]
```

---

### 5. Update User Profile
**PUT** `/users/:id`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Smith Updated",
  "location": "Nebraska",
  "phone": "555-0999"
}
```

**Response (200):**
```json
{
  "message": "Profile updated"
}
```

---

## EQUIPMENT ENDPOINTS

### 1. Get All Equipment
**GET** `/equipment`

Retrieve all available equipment.

**Query Parameters:**
- None

**Response (200):**
```json
[
  {
    "id": 1,
    "owner_id": 1,
    "name": "Tractor John Deere",
    "description": "Powerful tractor for heavy lifting",
    "category": "Tractors",
    "daily_rate": 150.00,
    "availability": 1,
    "image_url": null,
    "created_at": "2026-04-07 10:30:00",
    "owner_name": "John Smith",
    "location": "Iowa"
  }
]
```

---

### 2. Get Equipment by Category
**GET** `/equipment/category/:category`

Filter equipment by category.

**Parameters:**
- `category` (string): Equipment category (Tractors, Plows, Harvesters, Balers, Sprayers)

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Tractor John Deere",
    "daily_rate": 150.00,
    "owner_name": "John Smith",
    ...
  }
]
```

---

### 3. Get Equipment Details
**GET** `/equipment/:id`

Get detailed information about a specific equipment.

**Parameters:**
- `id` (number): Equipment ID

**Response (200):**
```json
{
  "id": 1,
  "owner_id": 1,
  "name": "Tractor John Deere",
  "description": "Powerful tractor for heavy lifting",
  "category": "Tractors",
  "daily_rate": 150.00,
  "availability": 1,
  "image_url": null,
  "created_at": "2026-04-07 10:30:00",
  "owner_name": "John Smith",
  "email": "john@farm.com",
  "phone": "555-0101",
  "location": "Iowa"
}
```

---

### 4. Add New Equipment
**POST** `/equipment`

List new equipment for sharing.

**Request Body:**
```json
{
  "owner_id": 1,
  "name": "New Tractor",
  "description": "Excellent condition",
  "category": "Tractors",
  "daily_rate": 200.00,
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "id": 6,
  "message": "Equipment added successfully"
}
```

---

### 5. Update Equipment
**PUT** `/equipment/:id`

Update equipment details.

**Request Body:**
```json
{
  "name": "Updated Tractor",
  "description": "Updated description",
  "daily_rate": 175.00,
  "availability": 1
}
```

**Response (200):**
```json
{
  "message": "Equipment updated"
}
```

---

### 6. Delete Equipment
**DELETE** `/equipment/:id`

Remove equipment from listing.

**Response (200):**
```json
{
  "message": "Equipment deleted"
}
```

---

## RENTAL ENDPOINTS

### 1. Get User's Rentals
**GET** `/rentals/user/:user_id`

Get all rentals (made or received) for a user.

**Parameters:**
- `user_id` (number): User ID

**Response (200):**
```json
[
  {
    "id": 1,
    "equipment_id": 1,
    "renter_id": 2,
    "owner_id": 1,
    "start_date": "2026-04-15",
    "end_date": "2026-04-20",
    "total_cost": 750.00,
    "status": "pending",
    "created_at": "2026-04-07 11:00:00",
    "equipment_name": "Tractor John Deere",
    "owner_name": "John Smith"
  }
]
```

---

### 2. Get Rental Details
**GET** `/rentals/:id`

Get detailed information about a specific rental.

**Parameters:**
- `id` (number): Rental ID

**Response (200):**
```json
{
  "id": 1,
  "equipment_id": 1,
  "renter_id": 2,
  "owner_id": 1,
  "start_date": "2026-04-15",
  "end_date": "2026-04-20",
  "total_cost": 750.00,
  "status": "pending",
  "created_at": "2026-04-07 11:00:00",
  "equipment_name": "Tractor John Deere",
  "renter_name": "Jane Doe",
  "owner_name": "John Smith"
}
```

---

### 3. Create Rental Request
**POST** `/rentals`

Create a new rental request.

**Request Body:**
```json
{
  "equipment_id": 1,
  "renter_id": 2,
  "owner_id": 1,
  "start_date": "2026-04-15",
  "end_date": "2026-04-20",
  "total_cost": 750.00
}
```

**Response (201):**
```json
{
  "id": 1,
  "message": "Rental created"
}
```

---

### 4. Update Rental Status
**PUT** `/rentals/:id`

Update the status of a rental (approve, reject, complete, etc.).

**Request Body:**
```json
{
  "status": "approved"
}
```

Valid statuses:
- `pending` - Initial status
- `approved` - Approved by owner
- `rejected` - Rejected by owner
- `active` - Currently renting
- `completed` - Rental finished

**Response (200):**
```json
{
  "message": "Rental updated"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "error": "Equipment not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication failed |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## Rate Limiting

Currently no rate limiting implemented. Recommended for production:
- Implement rate limiting (e.g., express-rate-limit)
- Limit to 100 requests per 15 minutes per IP

---

## Data Validation

### Equipment Categories
- Tractors
- Plows
- Harvesters
- Balers
- Sprayers

### Required Fields

**User Registration:**
- email (unique, valid format)
- password (minimum 6 characters)
- name (not empty)

**Equipment:**
- owner_id (valid user)
- name (not empty)
- category (from allowed list)
- daily_rate (positive number)

**Rental:**
- equipment_id
- renter_id
- owner_id
- start_date
- end_date
- total_cost

