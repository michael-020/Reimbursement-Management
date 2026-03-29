import { NextResponse } from "next/server";
import prisma from "@/prisma/index";
import { auth } from "@/actions/authAction";
import { Role } from "@/app/generated/prisma/enums";

export const GET = async () => {
  try {
    // Verify admin
    const authData = await auth();
    const adminUser = await prisma.user.findUnique({
      where: { id: authData.id },
    });

    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { msg: "Unauthorized: Only admins can fetch users" },
        { status: 403 }
      );
    }

    // Fetch all users except admins
    const users = await prisma.user.findMany({
      where: {
        role: {
          not: Role.ADMIN,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        manager: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        msg: "Users fetched successfully",
        users,
        total: users.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { msg: "Failed to fetch users" },
      { status: 500 }
    );
  }
};
