import { NextResponse } from "next/server";
import prisma from "@/prisma/index";
import { auth } from "@/actions/authAction";
import { Role } from "@/app/generated/prisma/enums";

export const POST = async (req: Request) => {
  try {
    // Verify admin
    const authData = await auth();
    const adminUser = await prisma.user.findUnique({
      where: { id: authData.id },
    });

    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { msg: "Unauthorized: Only admins can assign managers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId, managerId } = body;

    // Validate inputs
    if (!userId || !managerId) {
      return NextResponse.json(
        { msg: "userId and managerId are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    // Verify manager exists
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) {
      return NextResponse.json(
        { msg: "Manager not found" },
        { status: 404 }
      );
    }

    // Update user with manager
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        managerId: managerId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        msg: "Manager assigned successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning manager:", error);
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    );
  }
};
