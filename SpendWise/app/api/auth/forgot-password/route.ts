// API Route: POST /api/auth/forgot-password
// Handles password reset request
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json(
        { message: 'If the email exists, a password reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token (delete old ones first)
    await prisma.passwordResetToken.deleteMany({
      where: { email: validatedData.email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: validatedData.email,
        token: resetToken,
        expiresAt,
      },
    });

    // In production, send email with reset link
    // For now, we'll just return the token (remove this in production!)
    // TODO: Send email with reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}

    return NextResponse.json(
      {
        message: 'If the email exists, a password reset link has been sent',
        // Remove this in production!
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
