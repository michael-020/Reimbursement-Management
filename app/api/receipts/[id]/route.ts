import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/prisma/index";

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

export const GET = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Extract the actual UUID from the EXP-XXXXXX format
    const receiptId = params.id.includes('EXP-') 
      ? params.id.replace('EXP-', '').toLowerCase()
      : params.id;

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: {
          contains: receiptId,
          mode: 'insensitive'
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!receipt) {
      return NextResponse.json({ message: "Receipt not found" }, { status: 404 });
    }

    // Check permissions
    if (user.role === "EMPLOYEE" && receipt.createdById !== user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Managers can see receipts of their employees
    if (user.role === "MANAGER") {
      const employees = await prisma.user.findMany({
        where: { managerId: user.id },
        select: { id: true }
      });
      const employeeIds = [user.id, ...employees.map(e => e.id)];
      
      if (!employeeIds.includes(receipt.createdById)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      }
    }

    const latestApproval = receipt.approvals[receipt.approvals.length - 1];
    const status = latestApproval?.status?.toLowerCase() || "pending";

    const formattedReceipt = {
      id: `EXP-${receipt.id.slice(-6).toUpperCase()}`,
      employee: receipt.createdBy.name,
      employeeId: receipt.createdById,
      category: receipt.category,
      amount: `$${receipt.amountConverted.toLocaleString()}`,
      amountOriginal: receipt.amountOriginal,
      currencyOriginal: receipt.currencyOriginal,
      amountConverted: receipt.amountConverted,
      currencyCompany: receipt.currencyCompany,
      conversionRate: receipt.conversionRate,
      date: receipt.expenseDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: status as "pending" | "approved" | "rejected",
      description: receipt.description,
      receiptUrl: receipt.receiptUrl,
      createdAt: receipt.createdAt,
      approvals: receipt.approvals.map(approval => ({
        id: approval.id,
        approver: approval.approver.name,
        approverRole: approval.approver.role,
        status: approval.status.toLowerCase(),
        order: approval.order,
        approvedAt: approval.approvedAt
      }))
    };

    return NextResponse.json({ receipt: formattedReceipt });

  } catch (error) {
    console.error("Error fetching receipt:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, comment } = body;

    if (!action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { message: "Invalid action" },
        { status: 400 }
      );
    }

    // Extract the actual UUID from the EXP-XXXXXX format
    const receiptId = params.id.includes('EXP-') 
      ? params.id.replace('EXP-', '').toLowerCase()
      : params.id;

    const receipt = await prisma.receipt.findFirst({
      where: {
        id: {
          contains: receiptId,
          mode: 'insensitive'
        }
      },
      include: {
        approvals: true
      }
    });

    if (!receipt) {
      return NextResponse.json({ message: "Receipt not found" }, { status: 404 });
    }

    // Check if user has permission to approve/reject
    const canApprove = user.role === "MANAGER" || user.role === "FINANCE" || user.role === "DIRECTOR" || user.role === "ADMIN";
    
    if (!canApprove) {
      return NextResponse.json({ message: "Unauthorized to perform this action" }, { status: 401 });
    }

    // Check if there's already an approval from this user
    const existingApproval = receipt.approvals.find(a => a.approverId === user.id);
    
    if (existingApproval) {
      // Update existing approval
      const updatedApproval = await prisma.approval.update({
        where: { id: existingApproval.id },
        data: {
          status: action === "approve" ? "APPROVED" : "REJECTED",
          approvedAt: new Date()
        },
        include: {
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        message: `Receipt ${action}d successfully`,
        approval: {
          id: updatedApproval.id,
          approver: updatedApproval.approver.name,
          status: updatedApproval.status.toLowerCase(),
          approvedAt: updatedApproval.approvedAt
        }
      });
    } else {
      // Create new approval
      const newApproval = await prisma.approval.create({
        data: {
          receiptId: receipt.id,
          approverId: user.id,
          status: action === "approve" ? "APPROVED" : "REJECTED",
          order: receipt.approvals.length + 1,
          approvedAt: new Date()
        },
        include: {
          approver: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        message: `Receipt ${action}d successfully`,
        approval: {
          id: newApproval.id,
          approver: newApproval.approver.name,
          status: newApproval.status.toLowerCase(),
          approvedAt: newApproval.approvedAt
        }
      });
    }

  } catch (error) {
    console.error("Error updating receipt:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
