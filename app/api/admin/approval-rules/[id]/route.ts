import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/prisma/index";
import jwt from "jsonwebtoken";

const UpdateApprovalRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required").optional(),
  description: z.string().optional(),
  ruleType: z.enum(["PERCENTAGE", "SPECIFIC_APPROVER", "HYBRID"]).optional(),
  percentageThreshold: z.number().min(1).max(100).optional(),
  specificApproverId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "Rule ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const parsedBody = UpdateApprovalRuleSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Invalid input", details: parsedBody.error.issues },
        { status: 400 }
      );
    }

    const updateData = parsedBody.data;

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    // Check if the rule exists and belongs to the user's company
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    });

    if (!existingRule) {
      return NextResponse.json({ message: "Approval rule not found" }, { status: 404 });
    }

    // Validate rule-specific requirements if ruleType is being updated
    if (updateData.ruleType) {
      if (updateData.ruleType === "PERCENTAGE" && !updateData.percentageThreshold) {
        return NextResponse.json(
          { message: "Percentage threshold is required for percentage rules" },
          { status: 400 }
        );
      }

      if (updateData.ruleType === "SPECIFIC_APPROVER" && !updateData.specificApproverId) {
        return NextResponse.json(
          { message: "Specific approver ID is required for specific approver rules" },
          { status: 400 }
        );
      }

      if (updateData.ruleType === "HYBRID" && (!updateData.percentageThreshold || !updateData.specificApproverId)) {
        return NextResponse.json(
          { message: "Both percentage threshold and specific approver ID are required for hybrid rules" },
          { status: 400 }
        );
      }
    }

    // Validate specific approver exists and belongs to same company if provided
    if (updateData.specificApproverId) {
      const specificApprover = await prisma.user.findFirst({
        where: {
          id: updateData.specificApproverId,
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

    const updatedRule = await prisma.approvalRule.update({
      where: { id },
      data: updateData,
      include: {
        company: true,
        specificApprover: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    return NextResponse.json(
      { message: "Approval rule updated successfully", approvalRule: updatedRule },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating approval rule:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "Rule ID is required" }, { status: 400 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    // Check if the rule exists and belongs to the user's company
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    });

    if (!existingRule) {
      return NextResponse.json({ message: "Approval rule not found" }, { status: 404 });
    }

    await prisma.approvalRule.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Approval rule deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting approval rule:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const token = req.cookies.get("authToken")?.value;
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ message: "Rule ID is required" }, { status: 400 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    const approvalRule = await prisma.approvalRule.findFirst({
      where: {
        id,
        companyId: user.company.id
      },
      include: {
        company: true,
        specificApprover: {
          select: { id: true, name: true, email: true, role: true }
        }
      }
    });

    if (!approvalRule) {
      return NextResponse.json({ message: "Approval rule not found" }, { status: 404 });
    }

    return NextResponse.json({ approvalRule }, { status: 200 });

  } catch (error) {
    console.error("Error fetching approval rule:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
