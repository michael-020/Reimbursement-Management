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
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { expenseId } = await params;
    const body = await req.json();
    const { action, comment } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // Get the expense/receipt
    const receipt = await prisma.receipt.findUnique({
      where: { id: expenseId },
      include: {
        createdBy: {
          select: { id: true, managerId: true }
        },
        approvals: {
          include: {
            approver: {
              select: { id: true, role: true }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!receipt) {
      return NextResponse.json({ message: "Expense not found" }, { status: 404 });
    }

    // Check if user has permission to approve
    let canApprove = false;
    
    // Managers can approve their direct reports
    if (user.role === "MANAGER" && receipt.createdBy.managerId === user.id) {
      canApprove = true;
    }
    
    // Finance and Director can approve any expense
    if (["FINANCE", "DIRECTOR"].includes(user.role)) {
      canApprove = true;
    }

    // Admin can approve any expense
    if (user.role === "ADMIN") {
      canApprove = true;
    }

    if (!canApprove) {
      return NextResponse.json({ message: "You don't have permission to approve this expense" }, { status: 403 });
    }

    // Check if user has already approved/rejected this expense
    const existingApproval = receipt.approvals.find(a => a.approverId === user.id);
    if (existingApproval) {
      return NextResponse.json({ message: "You have already acted on this expense" }, { status: 400 });
    }

    // Get the next order number for this approval
    const nextOrder = receipt.approvals.length + 1;

    // Create the approval record
    const approval = await prisma.approval.create({
      data: {
        receiptId: expenseId,
        approverId: user.id,
        status: action.toUpperCase() as "APPROVED" | "REJECTED",
        order: nextOrder
      },
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Check if expense should be auto-approved based on approval rules
    const company = await prisma.user.findUnique({
      where: { id: receipt.createdById },
      select: { companyId: true }
    });

    if (company?.companyId) {
      const approvalRules = await prisma.approvalRule.findMany({
        where: { companyId: company.companyId }
      });

      const allApprovals = await prisma.approval.findMany({
        where: { receiptId: expenseId },
        include: {
          approver: {
            select: { role: true }
          }
        }
      });

      const approvedCount = allApprovals.filter(a => a.status === "APPROVED").length;
      const totalCount = allApprovals.length;

      // Check percentage rules
      for (const rule of approvalRules) {
        if (rule.ruleType === "PERCENTAGE" && rule.percentageThreshold) {
          if (totalCount > 0 && (approvedCount / totalCount) * 100 >= rule.percentageThreshold) {
            await prisma.receipt.update({
              where: { id: expenseId },
              data: { status:  }
            });
            break;
          }
        }

        // Check specific approver rules
        if (rule.ruleType === "SPECIFIC_APPROVER" && rule.specificApproverId) {
          const specificApproval = allApprovals.find(a => 
            a.approverId === rule.specificApproverId && a.status === "APPROVED"
          );
          if (specificApproval) {
            await prisma.receipt.update({
              where: { id: expenseId },
              data: { status: "APPROVED" }
            });
            break;
          }
        }

        // Check hybrid rules
        if (rule.ruleType === "HYBRID") {
          const percentageMet = rule.percentageThreshold && 
            totalCount > 0 && (approvedCount / totalCount) * 100 >= rule.percentageThreshold;
          const specificApproverApproved = rule.specificApproverId &&
            allApprovals.some(a => a.approverId === rule.specificApproverId && a.status === "APPROVED");
          
          if (percentageMet || specificApproverApproved) {
            await prisma.receipt.update({
              where: { id: expenseId },
              data: { status: "APPROVED" }
            });
            break;
          }
        }
      }
    }

    // If rejected, mark expense as rejected
    if (action === "reject") {
      await prisma.receipt.update({
        where: { id: expenseId },
        data: { status: "REJECTED" }
      });
    }

    const pastTense = action === 'approve' ? 'approved' : 'rejected';

    return NextResponse.json({
      message: `Expense ${pastTense} successfully`,
      approval
    });

  } catch (error) {
    console.error("Error processing approval:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
