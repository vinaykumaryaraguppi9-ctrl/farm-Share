import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/equipment/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const equipment = await prisma.equipment.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, location: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true } } } },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Equipment fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

// PUT /api/equipment/[id] - Update equipment
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, category, dailyRate, imageUrl } = body;

    const equipment = await prisma.equipment.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(dailyRate && { dailyRate: parseFloat(dailyRate) }),
        ...(imageUrl && { imageUrl }),
      },
      include: { owner: { select: { id: true, name: true, email: true, phone: true, location: true } } },
    });

    return NextResponse.json(equipment);
  } catch (error) {
    console.error('Equipment update error:', error);
    return NextResponse.json(
      { error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

// DELETE /api/equipment/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    await prisma.equipment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Equipment delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}
