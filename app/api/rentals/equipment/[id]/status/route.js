import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/rentals/equipment/[id]/status
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const activeRental = await prisma.rental.findFirst({
      where: {
        equipmentId: parseInt(id),
        status: { in: ['approved', 'active'] },
      },
    });

    return NextResponse.json({
      isRented: !!activeRental,
      rental: activeRental || null,
    });
  } catch (error) {
    console.error('Rental status error:', error);
    return NextResponse.json(
      { error: 'Failed to check rental status' },
      { status: 500 }
    );
  }
}
