# Farm Equipment Sharing Platform - Next.js Full Stack

This is a complete conversion of the Farm Equipment Sharing Platform from a separate React frontend + Express backend architecture to a unified **Next.js 14 full-stack application** that is **Vercel-compatible**.

## 🎯 What Changed

### Architecture
- **Before**: React SPA (port 3000) + Express backend (port 5001)
- **After**: Next.js app (single codebase, both frontend & backend)

### Key Improvements
- ✅ Single deployment instead of two separate services
- ✅ API routes in `/app/api/` instead of separate Node.js server
- ✅ Prisma ORM for type-safe database access
- ✅ Native Next.js authentication support
- ✅ Better SEO with Server Components
- ✅ Vercel deployment ready
- ✅ SQLite for local development, PostgreSQL for production

## 📁 Project Structure

```
app/
├── (equipment)/
│   └── [id]/
│       ├── page.js
│       └── page.css
├── api/
│   ├── users/
│   │   ├── login/route.js
│   │   └── register/route.js
│   ├── equipment/
│   │   ├── route.js (GET all, POST new)
│   │   └── [id]/route.js (GET, PUT, DELETE)
│   ├── rentals/
│   │   ├── route.js (GET, POST)
│   │   ├── [id]/route.js (GET, PUT, DELETE)
│   │   └── equipment/[id]/status/route.js
│   └── reviews/
│       └── route.js (GET, POST)
├── dashboard/
│   ├── page.js
│   └── page.css
├── login/
│   ├── page.js
│   └── page.css
├── register/
│   ├── page.js
│   └── page.css
├── layout.js
├── page.js (Home)
├── globals.css
└── HomePage.css

lib/
├── auth.js (Password hashing, JWT tokens)
├── db/
│   └── prisma.js (Database connector)

components/
└── Navbar.js

prisma/
├── schema.prisma (Database schema)
└── equipment.db (SQLite - development)

public/
└── uploads/ (Equipment images)

.env.local (Local environment variables)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Basic knowledge of Next.js

### 1. Installation

```bash
cd "Farm equipment sharing platform"
npm install
```

### 2. Setup Database

The project uses **Prisma ORM** with **SQLite** (local) and **PostgreSQL** (production).

#### Option A: SQLite (Development - Recommended)
```bash
# Already configured in .env.local
npx prisma migrate dev --name init
npx prisma generate
```

#### Option B: PostgreSQL (Production)
```bash
# Update .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/farm_db"
npx prisma migrate deploy
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 API Endpoints

All API routes are located in `/app/api/`

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user

### Equipment
- `GET /api/equipment` - Get all equipment (supports `?category=X` & `?owner_id=X`)
- `GET /api/equipment/[id]` - Get single equipment
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/[id]` - Update equipment
- `DELETE /api/equipment/[id]` - Delete equipment

### Rentals
- `GET /api/rentals?user_id=X` - Get user's rentals
- `GET /api/rentals/[id]` - Get rental details
- `POST /api/rentals` - Create rental request
- `PUT /api/rentals/[id]` - Update rental status
- `GET /api/rentals/equipment/[id]/status` - Check if equipment is rented

### Reviews
- `GET /api/reviews?equipment_id=X` - Get equipment reviews
- `POST /api/reviews` - Submit review

## 🗄️ Database Schema

### Users
```prisma
- id (PK)
- email (UNIQUE)
- password
- name
- location
- phone
- createdAt
```

### Equipment
```prisma
- id (PK)
- ownerId (FK → Users)
- name
- description
- category
- dailyRate
- imageUrl
- availability
- createdAt
```

### Rentals
```prisma
- id (PK)
- equipmentId (FK → Equipment)
- renterId (FK → Users)
- ownerId (FK → Users)
- startDate
- endDate
- totalCost
- status (pending, approved, rejected, active, completed)
- createdAt
```

### Reviews
```prisma
- id (PK)
- rentalId (FK → Rentals)
- reviewerId (FK → Users)
- rating (1-5)
- comment
- createdAt
```

## 🎨 Pages

### Home (`/`)
- Browse equipment by category
- Equipment cards with rental status
- Filter by category (Tractors, Plows, Harvesters, etc.)

### Login (`/login`)
- Email & password authentication
- Auto-redirect to dashboard on success
- Link to registration

### Register (`/register`)
- Multi-step form with validation
- Form completion progress bar
- Password strength indicator
- Auto-login after registration

### Equipment Detail (`/equipment/[id]`)
- Equipment image, description, owner info
- Booking calendar (date range selection)
- Cost calculation
- Leave reviews & ratings
- View existing reviews

### Dashboard (`/dashboard`)
- **Profile Tab**: View user information
- **Rental Requests Tab**: Manage incoming rental requests
- **Browse Equipment Tab**: See all available equipment
- **My Rentals Tab**: View active and past rentals
- **My Equipment Tab**: Manage equipment listings

## 🔐 Authentication

### System
- JWT tokens stored in localStorage
- Passwords hashed with bcryptjs
- Token verification on API routes (optional)

### How It Works
1. User registers/logs in
2. Server returns JWT token
3. Token stored in `localStorage.userToken`
4. User object stored in `localStorage.user`
5. Tokens included in API requests (future enhancement)

### Session Persistence
- User session persists across page refreshes
- `useEffect` in layout checks localStorage on mount
- Auto-redirect to login if no token found

## 📝 Environment Variables

### Development (`.env.local`)
```bash
DATABASE_URL="file:./prisma/equipment.db"
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Production (Vercel)
```bash
DATABASE_URL="postgresql://..."  # Your Postgres URL
NEXTAUTH_SECRET="<generate-secure-key>"
NEXTAUTH_URL="https://yourdomain.com"
NODE_ENV="production"
```

## 🚢 Deployment to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Convert to Next.js"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Set environment variables (DATABASE_URL, NEXTAUTH_SECRET)
4. Deploy!

### 3. Run Database Migrations
```bash
vercel env pull  # Get environment variables locally
npx prisma migrate deploy
```

## 🛠️ Common Tasks

### Add New Equipment Field
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_field_name`
3. Update API routes to handle new field

### Create New API Route
1. Create file: `app/api/[resource]/[action]/route.js`
2. Export `GET`, `POST`, `PUT`, `DELETE` functions
3. Return `NextResponse.json(data)`

### Seed Database
```bash
# Create seed file at prisma/seed.js
npx prisma db seed
```

## 📦 Dependencies

### Core
- `next` - React framework
- `react` & `react-dom` - UI library
- `@prisma/client` - Database ORM

### Authentication & Security
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `next-auth` - Optional: Advanced auth (future)

### Utilities
- `axios` - HTTP client
- `lucide-react` - Icons
- `dotenv` - Environment variables

## ✨ Best Practices Included

✅ Environment variable management
✅ Password hashing with bcryptjs
✅ Database connection pooling
✅ Error handling on all routes
✅ Input validation
✅ CORS headers support
✅ Responsive design
✅ Accessible form inputs
✅ Loading states
✅ Error boundaries

## 🐛 Troubleshooting

### Database Error: "SQLITE_CANTOPEN"
```bash
# Ensure prisma directory exists
mkdir -p prisma
npx prisma migrate dev --name init
```

### Port 3000 Already in Use
```bash
npm run dev -- -p 3001
```

### Module Not Found Errors
```bash
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Changes Not Showing
- Clear cache: `rm -rf .next`
- Restart server: Ctrl+C then `npm run dev`

## 📸 Migration Summary

### Removed Files
- `/backend/` directory
- `/frontend/` directory  
- Separate package.json files
- `vercel.json` (replaced with Next.js config)

### New Files
- `app/` - All pages and API routes
- `prisma/schema.prisma` - Database schema
- `lib/` - Utilities and helpers
- `next.config.js` - Next.js configuration
- `jsconfig.json` - JavaScript config

### Renamed/Moved
- React pages → Next.js pages (moved to `app/`)
- API routes → Next.js API routes (`app/api/`)
- Styles → Kept as `.css` files in respective directories

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma ORM Guide](https://www.prisma.io/docs/)
- [Vercel Deployment](https://vercel.com/docs)
- [RTK Query for Data Fetching](https://redux-toolkit.js.org/rtk-query)

## 💡 Future Enhancements

- [ ] Add image upload to Cloudinary
- [ ] Implement real authentication with NextAuth.js
- [ ] Add email notifications
- [ ] Payment integration (Razorpay/Stripe)
- [ ] Advanced search & filters
- [ ] Equipment condition tracking
- [ ] Insurance/damage liability system
- [ ] Real-time messaging
- [ ] User ratings system
- [ ] Mobile app (React Native)

## 📄 License

Private project for Farm Equipment Sharing Platform

---

**Questions?** Check the [Next.js docs](https://nextjs.org/docs) or reach out to the development team.
