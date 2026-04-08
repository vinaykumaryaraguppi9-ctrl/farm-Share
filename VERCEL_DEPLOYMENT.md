# Farm Equipment Sharing Platform - Vercel Deployment

This project is configured for deployment on Vercel with a PostgreSQL database.

## Prerequisites

1. Vercel account
2. Vercel Postgres database

## Setup

1. **Clone the repository** to your local machine.

2. **Set up Vercel Postgres:**
   - Go to your Vercel dashboard
   - Create a new project
   - Add Vercel Postgres integration
   - Copy the `DATABASE_URL` from the integration

3. **Deploy to Vercel:**
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the `vercel.json` configuration
   - Set the environment variable `DATABASE_URL` in Vercel project settings

4. **Seed the database:**
   - After deployment, run the seed script:
     ```
     npm run seed
     ```
   - You can do this via Vercel's function logs or by calling the seed endpoint if you add one.

## Environment Variables

Set the following in your Vercel project settings:

- `DATABASE_URL`: Your Vercel Postgres connection string
- `NODE_ENV`: production

## API Endpoints

The backend API will be available at `/api/*` routes.

## Frontend

The React frontend will be served from the root domain.

## File Uploads

Images are uploaded to `/uploads/` and served from the backend.

## Notes

- The backend uses PostgreSQL instead of SQLite for cloud deployment.
- All API calls in the frontend use relative URLs for Vercel compatibility.
- Database initialization happens automatically on first run.