import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/index";

export const GET = async (req: NextRequest) => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        employees: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Format the user data to match the frontend mock structure
    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
      avatar: user.name.split(" ").map((n) => n[0]).join(""),
      manager: user.manager,
      employees: user.employees
    };

    return NextResponse.json({ user: formattedUser });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
