@echo off
setlocal enabledelayedexpansion

echo.
echo 🚜 Farm Equipment Sharing Platform - Setup
echo ==========================================
echo.

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install
if !errorlevel! neq 0 (
  echo ❌ npm install failed
  exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Step 2: Generate Prisma client
echo ⚙️  Generating Prisma client...
call npx prisma generate
if !errorlevel! neq 0 (
  echo ❌ Prisma generate failed
  exit /b 1
)
echo ✅ Prisma client generated
echo.

REM Step 3: Setup database
echo 🗄️  Setting up database...
call npx prisma migrate dev --name init
if !errorlevel! neq 0 (
  echo ❌ Prisma migrate failed
  exit /b 1
)
echo ✅ Database created
echo.

REM Step 4: Seed sample data
echo 🌱 Seeding sample data...
call npm run prisma:seed
if !errorlevel! neq 0 (
  echo ⚠️  Seeding failed - optional, can continue
)
echo ✅ Sample data added
echo.

REM Step 5: Summary
echo.
echo ✅ Setup Complete!
echo.
echo Next steps:
echo 1. Start dev server: npm run dev
echo 2. Open http://localhost:3000
echo 3. Test signup at /register
echo 4. Test login and explore features
echo.
echo For more info, see NEXTJS_MIGRATION_COMPLETE.md
echo.

pause
