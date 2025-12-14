// API route for individual category operations (DELETE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

// DELETE - Delete a custom category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if category exists and belongs to user (not a default category)
    const category = await prisma.category.findFirst({
      where: {
        id: params.id,
        userId,
        isDefault: false,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or cannot delete default category' },
        { status: 404 }
      );
    }

    // Check if category is being used by any expenses
    const expensesCount = await prisma.expense.count({
      where: {
        categoryId: params.id,
      },
    });

    if (expensesCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by expenses' },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
