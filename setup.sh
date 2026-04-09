#!/bin/bash

# Farm Equipment Sharing Platform - Next.js Setup Script
# This script initializes all dependencies and database

echo "🚜 Farm Equipment Sharing Platform - Setup"
echo "=========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Step 2: Generate Prisma client
echo "⚙️  Generating Prisma client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ Prisma generate failed"
  exit 1
fi
echo "✅ Prisma client generated"
echo ""

# Step 3: Setup database
echo "🗄️  Setting up database..."
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
  echo "❌ Prisma migrate failed"
  exit 1
fi
echo "✅ Database created"
echo ""

# Step 4: Seed sample data
echo "🌱 Seeding sample data..."
npm run prisma:seed
if [ $? -ne 0 ]; then
  echo "⚠️  Seeding failed (optional)"
fi
echo "✅ Sample data added"
echo ""

# Step 5: Summary
echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Test signup at /register"
echo "4. Test login and explore features"
echo ""
echo "For more info, see NEXTJS_MIGRATION_COMPLETE.md"
