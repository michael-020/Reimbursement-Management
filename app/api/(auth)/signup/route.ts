import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/prisma/index"
import { Role } from '../../../generated/prisma/enums';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt"

const SignupSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  company: z.string(),
  country: z.string(),
  currency: z.string()
});

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const parsedBody = SignupSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      {
        message: parsedBody.error.cause,
      },
      { status: 411 },
    );
  }
  const { name, email, password, confirmPassword, company, country, currency } = parsedBody.data
  if (password === confirmPassword) {
    return NextResponse.json({
      message: "Password and Confirm Password don't match"
    }, {
      status: 400
    })
  }
  const adminId = uuidv4();
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email
    }
  })
  
  if (existingAdmin) {
    return NextResponse.json({
      message: "Account with this email already exists"
    }, {
      status: 400
    })
  }
  const hashedPassword = await bcrypt.hash(password, 10)
  
  try {
    const [adminDb, companyDb] = await Promise.all([
      prisma.user.create({
        data: {
          id: adminId,
          email,
          password: hashedPassword,
          name,
          role: Role.ADMIN
        }
      }),
      prisma.company.create({
        data: {
          name: company,
          currency,
          country,
          adminId
        }
      })
    ])
    return NextResponse.json({
      message: "Admin Signup Success",
      adminDb,
      companyDb
    })
  } catch (error) {
    console.error("error creating admin or company"+ error)
    return NextResponse.json({
      message: "Database error"
    }, {
      status: 500
    })
  }
};
