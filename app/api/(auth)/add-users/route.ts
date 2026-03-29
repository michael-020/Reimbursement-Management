import { NextRequest, NextResponse } from 'next/server';
import z from "zod"
import prisma from "@/prisma/index"
import { auth } from '../../../../actions/authAction';
import { Role } from '../../../generated/prisma/enums';
import bcrypt from "bcrypt"

const AddUsersSchema = z.object({
  email: z.email(),
  password: z.string(),
  name: z.string(),
  role: z.enum(["EMPLOYEE", "MANAGER", "FINANCE", "DIRECTOR"]),
  managerId: z.string().optional()
}) 

export const POST = async (req: NextRequest) => {
  try {
    const [authAdmin, body] = await Promise.all ([auth(), req.json()])
    const admin = await prisma.user.findUnique({
      where: {
        id: authAdmin.id,
        role: Role.ADMIN
      }
    });
    if (!admin) {
      return NextResponse.json({
        message: "Admin not found"
      }, {status: 400})
    }
    
    const parsedBody = AddUsersSchema.safeParse(body)
    if (!parsedBody.success) {
      return NextResponse.json({
        message: parsedBody.error.cause
      }, {status: 411})
    }
    const { email, password, name, role, managerId } = parsedBody.data
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        managerId,
        companyId: admin.companyId
      }
    })
    return NextResponse.json({ message: "User created", user}, { status: 201 });

  } catch (error) {
    console.error(error)
    return NextResponse.json({
      message: "Internal server error"
    }, {
      status: 500
    })
  }
}