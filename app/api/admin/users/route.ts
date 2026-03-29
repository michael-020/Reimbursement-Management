import { NextResponse } from "next/server";
import prisma from "@/prisma/index";
import { auth } from "@/actions/authAction";
import { Role } from "@/app/generated/prisma/enums";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

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

export const POST = async (req: Request) => {
  try {
    // Verify admin
    const authData = await auth();
    const adminUser = await prisma.user.findUnique({
      where: { id: authData.id },
    });

    if (!adminUser || adminUser.role !== Role.ADMIN) {
      return NextResponse.json(
        { msg: "Unauthorized: Only admins can create users" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, email, role, managerId, password } = body;

    // Validate required fields
    if (!name || !email || !role || !password) {
      return NextResponse.json(
        { msg: "Name, email, role, and password are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = [Role.EMPLOYEE, Role.MANAGER, Role.FINANCE, Role.DIRECTOR];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { msg: "Invalid role" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { msg: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { msg: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: managerId, role: Role.MANAGER },
      });

      if (!manager) {
        return NextResponse.json(
          { msg: "Invalid manager ID or manager not found" },
          { status: 400 }
        );
      }
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        managerId: role === Role.ADMIN ? null : managerId,
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
    });

    // User created successfully with provided password
    console.log(`User ${email} created with password provided by admin`);

    return NextResponse.json(
      {
        msg: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { msg: "Failed to create user" },
      { status: 500 }
    );
  }
};
