import { NextRequest } from 'next/server';
import { auth } from '../../../../actions/authAction';
import prisma from "@/prisma/index"
import { v4 as uuidv4 } from "uuid"

export const POST = async (req: NextRequest) => {
  const { id } = await auth()
  const forgotId = uuidv4()
  try {
    const forgotPassword = await prisma.forgotPassword.create({
      data: {
        id: forgotId
      }
    });
    
    await prisma.user.update({
      where: {
        id
      },
      data: {
        forgotPasswordId: forgotPassword.id
      }
    })
  } catch (error) {
    console.error(error)
  }
}