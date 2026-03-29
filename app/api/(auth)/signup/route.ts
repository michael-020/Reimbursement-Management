import { NextRequest, NextResponse } from 'next/server';
import z from "zod"

const SignupSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  
})

export const POST = async (req: NextRequest, res: NextResponse) => {
  
}