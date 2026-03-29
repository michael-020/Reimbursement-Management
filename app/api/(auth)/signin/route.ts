import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/prisma/index";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

const SigninSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const parsedBody = SigninSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: parsedBody.error.cause,
      },
      { status: 411 },
    );
  }

  const { email, password } = parsedBody.data;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return NextResponse.json(
      {
        message: "Could not find account with this email",
      },
      {
        status: 404,
      },
    );
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    return NextResponse.json(
      {
        message: "Invalid Password or Email",
      },
      {
        status: 401,
      },
    );
  }
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET!,
  );

  const cookieStore = await cookies();
  cookieStore.set("authToken", token, {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax", 
    maxAge: 60 * 60 * 24 * 7, 
    path: "/",
  });

  return NextResponse.json(
    { message: "Signed in successfully" },
    { status: 200 },
  );
};
