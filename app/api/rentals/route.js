import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/rentals - Get rentals for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const rentals = await prisma.rental.findMany({
      where: {
        OR: [
          { renterId: parseInt(userId) },
          { ownerId: parseInt(userId) },
        ],
      },
      include: {
        equipment: { include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } } },
        renter: { select: { id: true, name: true, email: true, phone: true, location: true } },
        owner: { select: { id: true, name: true, email: true, phone: true, location: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rentals);
  } catch (error) {
    console.error('Rentals fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

// POST /api/rentals - Create new rental
export async function POST(request) {
  try {
    const body = await request.json();
    const { equipmentId, renterId, ownerId, startDate, endDate, totalCost } = body;

    // Validate input
    if (!equipmentId || !renterId || !ownerId || !startDate || !endDate || !totalCost) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check for overlapping rentals
    const existing = await prisma.rental.findFirst({
      where: {
        equipmentId: parseInt(equipmentId),
        status: { in: ['approved', 'active'] },
        OR: [
          { AND: [{ startDate: { lte: startDate } }, { endDate: { gte: startDate } }] },
          { AND: [{ startDate: { lte: endDate } }, { endDate: { gte: endDate } }] },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Equipment is not available for selected dates' },
        { status: 400 }
      );
    }

    const rental = await prisma.rental.create({
      data: {
        equipmentId: parseInt(equipmentId),
        renterId: parseInt(renterId),
        ownerId: parseInt(ownerId),
        startDate,
        endDate,
        totalCost: parseFloat(totalCost),
        status: 'pending',
      },
      include: {
        equipment: { include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } } },
        renter: { select: { id: true, name: true, email: true, phone: true, location: true } },
        owner: { select: { id: true, name: true, email: true, phone: true, location: true } },
      },
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Rental creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    );
  }
}
