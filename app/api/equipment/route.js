import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/equipment - Get all equipment or filter by category/owner
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const ownerId = searchParams.get('owner_id');

    let where = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (ownerId) {
      where.ownerId = parseInt(ownerId);
    }

    const equipment = await prisma.equipment.findMany({
      where,
      include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Equipment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Create new equipment
export async function POST(request) {
  try {
    const body = await request.json();
    const { ownerId, name, description, category, dailyRate, imageUrl } = body;

    // Validate input
    if (!ownerId || !name || !category || !dailyRate) {
      return NextResponse.json(
        { error: 'Owner ID, name, category, and daily rate are required' },
        { status: 400 }
      );
    }

    const equipment = await prisma.equipment.create({
      data: {
        ownerId: parseInt(ownerId),
        name,
        description: description || null,
        category,
        dailyRate: parseFloat(dailyRate),
        imageUrl: imageUrl || null,
      },
      include: { owner: { select: { id: true, name: true, email: true, phone: true,location: true } } },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Equipment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}
