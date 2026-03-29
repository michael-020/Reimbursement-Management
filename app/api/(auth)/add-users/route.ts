import { NextResponse } from "next/server";
import prisma from "@/prisma/index";
import { auth } from "@/actions/authAction";
import { Role } from "@/app/generated/prisma/enums";
import bcrypt from "bcrypt";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([Role.ADMIN, Role.EMPLOYEE, Role.MANAGER, Role.FINANCE, Role.DIRECTOR]),
  managerId: z.string().optional(),
});

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

    // Validate input
    const validatedData = createUserSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { msg: "Email already exists" },
        { status: 400 }
      );
    }

    // Verify manager exists if provided
    if (validatedData.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: validatedData.managerId },
      });

      if (!manager) {
        return NextResponse.json(
          { msg: "Manager not found" },
          { status: 404 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        role: validatedData.role,
        managerId: validatedData.managerId || null,
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

    return NextResponse.json(
      {
        msg: "User created successfully",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues[0];
      return NextResponse.json(
        { msg: fieldError.message },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { msg: "Internal server error" },
      { status: 500 }
    );
  }
};