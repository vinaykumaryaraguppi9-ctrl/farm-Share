// Seed script to populate initial data
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const farmer1 = await prisma.user.create({
    data: {
      email: 'farmer1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Rajesh Kumar',
      location: 'Punjab',
      phone: '9876543210',
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      email: 'farmer2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Sunita Singh',
      location: 'Haryana',
      phone: '9876543211',
    },
  });

  console.log('✓ Created users:', farmer1.name, farmer2.name);

  // Create equipment
  const equipment = await prisma.equipment.createMany({
    data: [
      {
        ownerId: farmer1.id,
        name: 'John Deere Tractor',
        description: 'Heavy-duty tractor for farm work',
        category: 'Tractors',
        dailyRate: 5000,
        imageUrl: null,
      },
      {
        ownerId: farmer1.id,
        name: 'Moldboard Plow',
        description: 'Deep soil turning plow',
        category: 'Plows',
        dailyRate: 2000,
        imageUrl: null,
      },
      {
        ownerId: farmer2.id,
        name: 'Combine Harvester',
        description: 'Modern harvesting equipment',
        category: 'Harvesters',
        dailyRate: 8000,
        imageUrl: null,
      },
      {
        ownerId: farmer2.id,
        name: 'Round Baler',
        description: 'Automatic hay baler',
        category: 'Balers',
        dailyRate: 3000,
        imageUrl: null,
      },
    ],
  });

  console.log('✓ Created', equipment.count, 'equipment items');

  // Create sample rental
  const rental = await prisma.rental.create({
    data: {
      equipmentId: 1,
      renterId: farmer2.id,
      ownerId: farmer1.id,
      startDate: '2024-04-15',
      endDate: '2024-04-20',
      totalCost: 25000,
      status: 'approved',
    },
  });

  console.log('✓ Created sample rental');

  console.log('✅ Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
