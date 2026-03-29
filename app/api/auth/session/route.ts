import { NextResponse } from "next/server";
import { auth } from "@/actions/authAction";
import prisma from "@/prisma/index";

export const GET = async () => {
  try {
    // Get user ID from JWT token
    const authData = await auth();
    
    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: {
        id: authData.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { msg: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user, msg: "User fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { msg: "Failed to fetch user data" },
      { status: 401 }
    );
  }
};
