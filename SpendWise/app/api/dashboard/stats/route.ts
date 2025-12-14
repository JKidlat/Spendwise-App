// API Route: GET /api/dashboard/stats
// Returns dashboard statistics (monthly totals, category breakdown, etc.)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { getMonthRange } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'month' or 'week'

    let startDate: Date;
    let endDate: Date;

    if (period === 'week') {
      const weekRange = getWeekRange(new Date());
      startDate = weekRange.start;
      endDate = weekRange.end;
    } else {
      const monthRange = getMonthRange(new Date());
      startDate = monthRange.start;
      endDate = monthRange.end;
    }

    // Get user's currency preference
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { currency: true },
    });

    // Get total expenses for the period
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category breakdown
    const categoryBreakdown = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category details
    const categoriesWithAmounts = await Promise.all(
      categoryBreakdown.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          category,
          amount: item._sum.amount || 0,
        };
      })
    );

    // Get daily expenses for chart (last 7 days or last 30 days)
    const daysToShow = period === 'week' ? 7 : 30;
    const dailyExpenses = await prisma.expense.groupBy({
      by: ['date'],
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - daysToShow * 24 * 60 * 60 * 1000),
          lte: new Date(),
        },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(
      {
        totalExpenses: totalExpenses._sum.amount || 0,
        currency: user?.currency || 'USD',
        categoryBreakdown: categoriesWithAmounts,
        dailyExpenses,
        period,
        startDate,
        endDate,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
