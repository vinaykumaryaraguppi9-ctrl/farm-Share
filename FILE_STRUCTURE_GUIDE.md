# 📋 Next.js Migration - Complete File Structure Guide

## 📖 Overview

Your Farm Equipment Sharing Platform has been completely converted from a **separate React + Express** architecture to a **unified Next.js 14 Full-Stack** application. This document provides a complete guide to all files and their purposes.

## 📂 Project Structure

```
Farm equipment sharing platform/
├── app/                                 # Main Next.js application
│   ├── api/                            # Backend API routes
│   │   ├── users/
│   │   │   ├── login/route.js          # POST /api/users/login
│   │   │   └── register/route.js       # POST /api/users/register
│   │   ├── equipment/
│   │   │   ├── route.js                # GET /api/equipment (all, by category)
│   │   │   │                           # POST /api/equipment (create)
│   │   │   └── [id]/route.js           # GET, PUT, DELETE /api/equipment/:id
│   │   ├── rentals/
│   │   │   ├── route.js                # GET /api/rentals (user's rentals)
│   │   │   │                           # POST /api/rentals (create rental)
│   │   │   ├── [id]/route.js           # GET, PUT, DELETE /api/rentals/:id
│   │   │   └── equipment/[id]/status/route.js  # GET rental status
│   │   └── reviews/
│   │       ├── route.js                # GET, POST /api/reviews
│   │       └── equipment/route.js      # GET /api/reviews?equipment_id=X
│   ├── (equipment)/
│   │   └── [id]/
│   │       ├── page.js                 # Equipment detail page
│   │       └── page.css                # Equipment detail styling
│   ├── dashboard/
│   │   ├── page.js                     # User dashboard (profile, rentals, etc)
│   │   └── page.css                    # Dashboard styling
│   ├── login/
│   │   ├── page.js                     # Login form
│   │   └── page.css                    # Login styling
│   ├── register/
│   │   ├── page.js                     # Registration form
│   │   └── page.css                    # Registration styling
│   ├── globals.css                     # Global styles (CSS variables, resets)
│   ├── layout.js                       # Root layout (navbar, metadata)
│   ├── page.js                         # Home page (equipment listing)
│   └── HomePage.css                    # Home page styling
├── lib/
│   ├── auth.js                         # Authentication utilities
│   │                                   # - hashPassword()
│   │                                   # - comparePassword()
│   │                                   # - generateToken()
│   │                                   # - verifyToken()
│   └── db/
│       └── prisma.js                   # Prisma client singleton
├── components/
│   ├── Navbar.js                       # Navigation component
│   └── Navbar.css                      # Navigation styling
├── prisma/
│   ├── schema.prisma                   # Database schema (Prisma model definitions)
│   ├── equipment.db                    # SQLite database (local development)
│   ├── equipment.db-journal             # SQLite journal
│   └── seed.js                         # Sample data seeding script
├── public/
│   └── uploads/                        # Equipment images directory
├── node_modules/                       # Dependencies
├── styles/                             # Additional styles (empty by default)
├── .env.local                          # Local environment variables
├── .env.example                        # Example environment template
├── .gitignore                          # Git ignore rules
├── next.config.js                      # Next.js configuration
├── jsconfig.json                       # JavaScript config (path aliases)
├── package.json                        # Project dependencies & scripts
├── package-lock.json                   # Dependency lock file
├── NEXTJS_MIGRATION_COMPLETE.md        # Quick start guide
├── NEXTJS_SETUP_GUIDE.md               # Comprehensive setup guide
├── setup.bat                           # Windows setup script
├── setup.sh                            # Unix/Linux setup script
└── README files (from original)        # Original documentation
```

## 🔍 File-by-File Breakdown

### Core Application Files

#### `app/layout.js`
- **Purpose**: Root layout component for entire app
- **Contains**: 
  - Navbar component
  - Metadata configuration
  - HTML structure
  - CSS imports

#### `app/page.js`
- **Purpose**: Home page (/route)
- **Features**:
  - Equipment listing with filtering
  - Category buttons
  - Rental status checking
  - Equipment cards with images
  - "Book Now" links to detail page

#### `app/globals.css`
- **Purpose**: Global styling for entire application
- **Contains**:
  - CSS variables (colors, shadows, radii)
  - Reset styles
  - Base typography
  - Form styling
  - Responsive breakpoints

### Authentication Pages

#### `app/login/page.js`
- **Purpose**: User login form
- **Features**:
  - Email/password input
  - Password visibility toggle
  - Form validation
  - Error messaging
  - Redirect to dashboard on success

#### `app/register/page.js`
- **Purpose**: User registration form
- **Features**:
  - Multi-field form (name, email, password, etc)
  - Form completion progress bar
  - Password strength indicator
  - Real-time validation
  - Auto-login after registration

### Application Pages

#### `app/dashboard/page.js`
- **Purpose**: User dashboard with multiple tabs
- **Tabs**:
  1. Profile - View user information
  2. Rental Requests - Manage incoming rental requests
  3. Browse Equipment - View all available equipment
  4. My Rentals - View active and past rentals
  5. Equipment - Manage owned equipment
- **Features**:
  - Tab switching
  - Data fetching hooks
  - Equipment grid display
  - Rental status management

#### `app/(equipment)/[id]/page.js`
- **Purpose**: Equipment detail and booking page
- **Features**:
  - Equipment information display
  - Owner details
  - Date range booking
  - Cost calculation
  - Review submission form
  - Review display
  - Image display with placeholder

### API Routes

#### `app/api/users/register/route.js`
- **Method**: POST
- **Body**: { email, password, name, phone, location }
- **Returns**: { user, token, message }
- **Validates**: Email format, password length, unique email

#### `app/api/users/login/route.js`
- **Method**: POST
- **Body**: { email, password }
- **Returns**: { user, token, message }
- **Validates**: Credentials, password hash comparison

#### `app/api/equipment/route.js`
- **GET**: Returns all equipment (supports ?category=X, ?owner_id=X)
- **POST**: Creates new equipment
- **Returns**: Equipment array or single equipment object

#### `app/api/equipment/[id]/route.js`
- **GET**: Returns single equipment with reviews
- **PUT**: Updates equipment details
- **DELETE**: Deletes equipment
- **Returns**: Equipment object or success message

#### `app/api/rentals/route.js`
- **GET**: Returns rentals for user (?user_id=X)
- **POST**: Creates new rental request
- **Validates**: Date conflicts, required fields
- **Returns**: Rental object or error

#### `app/api/rentals/[id]/route.js`
- **GET**: Returns single rental details
- **PUT**: Updates rental status
- **DELETE**: Removes rental
- **Returns**: Rental object

#### `app/api/rentals/equipment/[id]/status/route.js`
- **GET**: Checks if equipment is currently rented
- **Returns**: { isRented: boolean, rental: object|null }

#### `app/api/reviews/route.js`
- **GET**: Returns reviews (?equipment_id=X)
- **POST**: Creates new review
- **Validates**: Rating 1-5, required fields
- **Returns**: Review object

### Utility Files

#### `lib/auth.js`
- **Purpose**: Authentication utilities
- **Functions**:
  - `hashPassword(password)` - bcryptjs hashing
  - `comparePassword(password, hash)` - Password verification
  - `generateToken(userId, email)` - JWT token creation
  - `verifyToken(token)` - JWT token validation
  - `getUserFromRequest(req)` - Extract user from headers

#### `lib/db/prisma.js`
- **Purpose**: Prisma client singleton
- **Ensures**: Single database connection across requests
- **Logging**: Query logs in development mode

#### `components/Navbar.js`
- **Purpose**: Navigation component
- **Features**:
  - Logo/branding
  - Navigation links (Home, Dashboard, etc)
  - Authentication buttons (Login/Register or Logout)
  - Responsive menu
  - Active route highlighting

### Database Files

#### `prisma/schema.prisma`
- **Purpose**: Database schema definition
- **Models**:
  - `User` - User accounts
  - `Equipment` - Farm equipment listings
  - `Rental` - Rental agreements
  - `Review` - Equipment reviews
- **Features**:
  - Relationships and foreign keys
  - Field validation
  - Indexes for performance

#### `prisma/seed.js`
- **Purpose**: Populate database with sample data
- **Creates**:
  - 2 test users
  - 4 equipment listings
  - 1 sample rental
- **Run**: `npm run prisma:seed`

### Configuration Files

#### `next.config.js`
```javascript
- Settings for image optimization
- API configuration
- Environment variable setup
- Build optimization
```

#### `jsconfig.json`
```javascript
- TypeScript/JavaScript settings
- Path aliases (@/* → root)
- Compiler options
```

#### `package.json`
```javascript
Scripts:
- npm run dev       - Start development server
- npm run build     - Build for production
- npm start         - Start production server
- npm run lint      - Run linter

Dependencies:
- next 14.0.0
- react 18.2.0
- @prisma/client 5.7.0
- bcryptjs 2.4.3
- jsonwebtoken 9.1.2
- And more...
```

#### `.env.local`
```
DATABASE_URL = SQLite/PostgreSQL connection string
NEXTAUTH_SECRET = Session encryption key
NEXTAUTH_URL = Base URL for auth callbacks
NODE_ENV = Environment (development/production)
```

### CSS Files

#### `app/globals.css`
- Global styles and CSS variables
- Base typography
- Form and button styling
- Responsive utilities

#### `app/HomePage.css`
- Hero section styling
- Equipment guide styling
- Filter buttons
- Equipment grid and cards

#### `app/login/page.css`
- Login card styling
- Form input styling
- Password toggle

#### `app/register/page.css`
- Registration card styling
- Progress bar
- Password strength indicator
- Form validation messages

#### `app/dashboard/page.css`
- Tab interface
- Profile cards
- Equipment grid
- Rental cards
- Request cards

#### `app/(equipment)/[id]/page.css`
- Detail page layout
- Equipment image
- Booking form
- Review section
- Star rating buttons

#### `components/Navbar.css`
- Navigation bar styling
- Logo styling
- Navigation links
- Authentication buttons

### Documentation Files

#### `NEXTJS_MIGRATION_COMPLETE.md`
- Quick start guide
- Directory structure overview
- 5-minute setup
- Feature list
- Common tasks

#### `NEXTJS_SETUP_GUIDE.md`
- Comprehensive setup instructions
- Detailed API documentation
- Database schema explanation
- Deployment guide
- Troubleshooting guide

## 🔄 Data Flow

```
User Browser
    ↓
Next.js Page (app/page.js, etc)
    ↓
API Route (app/api/*/route.js)
    ↓
Prisma ORM
    ↓
Database (SQLite or PostgreSQL)
    ↓
Response JSON
    ↓
User Browser
```

## 🚀 Getting Started

### Quick Setup (Windows)
```bash
cd "Farm equipment sharing platform"
setup.bat
npm run dev
# Open http://localhost:3000
```

### Quick Setup (Linux/Mac)
```bash
cd "Farm equipment sharing platform"
bash setup.sh
npm run dev
# Open http://localhost:3000
```

### Manual Setup
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

## 🔐 Authentication Flow

1. User fills registration form (`app/register/page.js`)
2. Submits to `POST /api/users/register`
3. Password hashed with bcryptjs
4. User created in database via Prisma
5. JWT token generated
6. Token + User stored in localStorage
7. Auto-redirect to dashboard
8. User stays logged in across refreshes

## 📊 Database Tables

### Users
```
id (PK) | email | password (hashed) | name | phone | location | createdAt
```

### Equipment
```
id (PK) | ownerId (FK) | name | description | category | dailyRate | 
imageUrl | availability | createdAt
```

### Rentals
```
id (PK) | equipmentId (FK) | renterId (FK) | ownerId (FK) | startDate | 
endDate | totalCost | status | createdAt
```

### Reviews
```
id (PK) | rentalId (FK) | reviewerId (FK) | rating | comment | createdAt
```

## 🎯 Key Features

- ✅ Full-stack Next.js 14
- ✅ Prisma ORM with SQLite/PostgreSQL
- ✅ User authentication with JWT
- ✅ Equipment management CRUD
- ✅ Rental request system
- ✅ Review and rating system
- ✅ Responsive design
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## 📚 Additional Resources

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- Vercel Docs: https://vercel.com/docs

---

**Your Next.js migration is complete!** Start with `npm run dev` and explore the features. 🎉
