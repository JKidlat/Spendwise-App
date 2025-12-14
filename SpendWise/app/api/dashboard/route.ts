// API route for dashboard statistics
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// GET - Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // 'week' or 'month'

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    if (period === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
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
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get expenses grouped by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get category details
    const categoryBreakdown = await Promise.all(
      expensesByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        });
        return {
          category: category
            ? {
                id: category.id,
                name: category.name,
                color: category.color,
              }
            : null,
          amount: item._sum.amount || 0,
        };
      })
    );

    // Get daily expenses for the period (for chart)
    const dailyExpenses = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
        },
      },
      select: {
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Group by date
    const dailyData: { [key: string]: number } = {};
    dailyExpenses.forEach((expense) => {
      const dateKey = expense.date.toISOString().split('T')[0];
      dailyData[dateKey] = (dailyData[dateKey] || 0) + expense.amount;
    });

    return NextResponse.json({
      totalExpenses: totalExpenses._sum.amount || 0,
      currency: user?.currency || 'USD',
      categoryBreakdown,
      dailyData,
      period,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
