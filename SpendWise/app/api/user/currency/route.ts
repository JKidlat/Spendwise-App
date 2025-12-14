// API route for updating user currency preference
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const currencySchema = z.object({
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
});

// PUT - Update user's currency preference
export async function PUT(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currency } = currencySchema.parse(body);

    // Update user currency
    const user = await prisma.user.update({
      where: { id: userId },
      data: { currency },
      select: {
        id: true,
        email: true,
        currency: true,
      },
    });

    return NextResponse.json({
      message: 'Currency updated successfully',
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update currency error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
