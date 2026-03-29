import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/index";
import bcrypt from "bcrypt";
import z from "zod";

const resetPasswordSchema = z.object({
  tempPassword: z.string().min(1, "Temporary password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const parsedBody = resetPasswordSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { msg: "Invalid request data" },
        { status: 400 }
      );
    }

    const { tempPassword, newPassword } = parsedBody.data;

    const forgotPasswordRecord = await prisma.forgotPassword.findFirst({
      where: {
        tempPassword: tempPassword,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!forgotPasswordRecord) {
      return NextResponse.json(
        { msg: "Invalid or expired temporary password" },
        { status: 401 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: forgotPasswordRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.forgotPassword.update({
        where: { id: forgotPasswordRecord.id },
        data: { isUsed: true },
      }),
    ]);

    return NextResponse.json(
      { msg: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json(
      { msg: "Failed to reset password" },
      { status: 500 }
    );
  }
};
