import { NextRequest, NextResponse } from "next/server";
import z from "zod";


const SignupSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
  country: z.string(),
  currency: z.string()
});

export const POST = async (req: NextRequest, res: NextResponse) => {
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
  
  
  
};
