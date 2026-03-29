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
        { msg: "Unauthorized: Only admins can fetch managers" },
        { status: 403 }
      );
    }

    // Fetch all managers
    const managers = await prisma.user.findMany({
      where: {
        role: Role.MANAGER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        msg: "Managers fetched successfully",
        managers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching managers:", error);
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    );
  }
};
