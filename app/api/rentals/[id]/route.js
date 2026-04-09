import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/rentals/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const rental = await prisma.rental.findUnique({
      where: { id: parseInt(id) },
      include: {
        equipment: { include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } } },
        renter: { select: { id: true, name: true, email: true, phone: true, location: true } },
        owner: { select: { id: true, name: true, email: true, phone: true, location: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true } } } },
      },
    });

    if (!rental) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Rental fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental' },
      { status: 500 }
    );
  }
}

// PUT /api/rentals/[id] - Update rental status
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const rental = await prisma.rental.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        equipment: { include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } } },
        renter: { select: { id: true, name: true, email: true, phone: true, location: true } },
        owner: { select: { id: true, name: true, email: true, phone: true, location: true } },
      },
    });

    return NextResponse.json(rental);
  } catch (error) {
    console.error('Rental update error:', error);
    return NextResponse.json(
      { error: 'Failed to update rental' },
      { status: 500 }
    );
  }
}

// DELETE /api/rentals/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.rental.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Rental deleted successfully' });
  } catch (error) {
    console.error('Rental delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete rental' },
      { status: 500 }
    );
  }
}
