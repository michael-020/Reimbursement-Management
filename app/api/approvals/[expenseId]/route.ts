import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/index";
import { Role } from "@/app/generated/prisma/enums";

// Helper function to get user from token
async function getUserFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    return decoded;
  } catch {
    return null;
  }
}

export const POST = async (req: NextRequest, { params }: { params: Promise<{ expenseId: string }> }) => {
  try {
    // Redirect to the new approval endpoint
    const { expenseId } = await params;
    
    return NextResponse.redirect(307, `/api/expenses/${expenseId}/approve`);
    
  } catch (error) {
    console.error("Error redirecting approval:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
