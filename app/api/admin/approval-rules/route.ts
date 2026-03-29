import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/prisma/index";
import jwt from "jsonwebtoken";

const CreateApprovalRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  description: z.string().optional(),
  ruleType: z.enum(["PERCENTAGE", "SPECIFIC_APPROVER", "HYBRID"]),
  percentageThreshold: z.number().min(1).max(100).optional(),
  specificApproverId: z.string().uuid().optional(),
});

export const POST = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parsedBody = CreateApprovalRuleSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Invalid input", details: parsedBody.error.issues },
        { status: 400 }
      );
    }

    const { name, description, ruleType, percentageThreshold, specificApproverId } = parsedBody.data;

    // Validate rule-specific requirements
    if (ruleType === "PERCENTAGE" && !percentageThreshold) {
      return NextResponse.json(
        { message: "Percentage threshold is required for percentage rules" },
        { status: 400 }
      );
    }

    if (ruleType === "SPECIFIC_APPROVER" && !specificApproverId) {
      return NextResponse.json(
        { message: "Specific approver ID is required for specific approver rules" },
        { status: 400 }
      );
    }

    if (ruleType === "HYBRID" && (!percentageThreshold || !specificApproverId)) {
      return NextResponse.json(
        { message: "Both percentage threshold and specific approver ID are required for hybrid rules" },
        { status: 400 }
      );
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    // Validate specific approver exists and belongs to same company if provided
    if (specificApproverId) {
      const specificApprover = await prisma.user.findFirst({
        where: {
          id: specificApproverId,
          companyId: user.company.id
        }
      });

      if (!specificApprover) {
        return NextResponse.json(
          { message: "Specific approver not found or not in the same company" },
          { status: 404 }
        );
      }
    }

    const approvalRule = await prisma.approvalRule.create({
      data: {
        name,
        description,
        ruleType,
        percentageThreshold,
        specificApproverId,
        companyId: user.company.id,
      },
      include: {
        company: true,
        specificApprover: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json(
      { message: "Approval rule created successfully", approvalRule },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating approval rule:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    const approvalRules = await prisma.approvalRule.findMany({
      where: {
        companyId: user.company.id
      },
      include: {
        specificApprover: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ approvalRules }, { status: 200 });

  } catch (error) {
    console.error("Error fetching approval rules:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
