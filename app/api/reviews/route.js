import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

// GET /api/reviews/equipment/[id] - Get reviews for equipment
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const reviews = await prisma.review.findMany({
      where: {
        rental: { equipmentId: parseInt(id) },
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        rental: { select: { id: true, startDate: true, endDate: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rentalId, reviewerId, rating, comment } = body;

    // Validate input
    if (!rentalId || !reviewerId || !rating) {
      return NextResponse.json(
        { error: 'Rental ID, reviewer ID, and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        rentalId: parseInt(rentalId),
        reviewerId: parseInt(reviewerId),
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        reviewer: { select: { id: true, name: true } },
        rental: { select: { id: true, startDate: true, endDate: true } },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
