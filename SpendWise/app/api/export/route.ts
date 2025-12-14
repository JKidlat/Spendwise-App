// API route for exporting expense reports as PDF
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET - Generate PDF report for expenses in date range
export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Get user and expenses
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, currency: true },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate totals
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Format data for PDF generation (client-side will handle PDF generation)
    return NextResponse.json({
      expenses,
      total,
      currency: user?.currency || 'USD',
      startDate,
      endDate,
      userName: user?.name || user?.email,
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
