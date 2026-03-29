import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/index";
import { auth } from "@/actions/authAction";
import { sendPasswordResetEmail } from "@/lib/server/emailService";

function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export const POST = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const authData = await auth();
    const adminUser = await prisma.user.findUnique({
      where: { id: authData.id },
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { msg: 'Unauthorized: Only admins can send passwords' },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { msg: 'User not found' },
        { status: 404 }
      );
    }

    const tempPassword = generateRandomPassword(12);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Expires in 24 hours

    const forgotPasswordRecord = await prisma.forgotPassword.create({
      data: {
        userId: targetUser.id,
        tempPassword,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(targetUser.email, targetUser.name, tempPassword);

    return NextResponse.json(
      {
        msg: `Password reset link sent to ${targetUser.email}`,
        forgotPasswordId: forgotPasswordRecord.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending password:', error);
    return NextResponse.json(
      { msg: 'Failed to send password' },
      { status: 500 }
    );
  }
};
