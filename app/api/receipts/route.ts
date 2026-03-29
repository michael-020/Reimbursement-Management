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

export const GET = async (req: NextRequest) => {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    let whereClause: any = {};

    // Employees can only see their own receipts
    if (user.role === "EMPLOYEE") {
      whereClause.createdById = user.id;
    }
    // Managers can see receipts of their employees
    else if (user.role === "MANAGER") {
      const employees = await prisma.user.findMany({
        where: { managerId: user.id },
        select: { id: true }
      });
      whereClause.createdById = {
        in: [user.id, ...employees.map(e => e.id)]
      };
    }
    // Admin and Finance/Director can see all receipts
    // (no additional filtering needed)

    // Apply status filter if provided
    if (status && status !== "all") {
      whereClause.approvals = {
        some: {
          status: status.toUpperCase()
        }
      };
    }

    // Apply category filter if provided
    if (category && category !== "all") {
      whereClause.category = category;
    }

    const receipts = await prisma.receipt.findMany({
      where: whereClause,
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const total = await prisma.receipt.count({
      where: whereClause
    });

    // Transform data to match frontend format
    const formattedReceipts = receipts.map(receipt => {
      const latestApproval = receipt.approvals[receipt.approvals.length - 1];
      const status = latestApproval?.status?.toLowerCase() || "pending";
      
      return {
        id: `EXP-${receipt.id.slice(-6).toUpperCase()}`,
        employee: receipt.createdBy.name,
        employeeId: receipt.createdBy.id,
        category: receipt.category,
        amount: `$${receipt.amountConverted.toLocaleString()}`,
        date: receipt.expenseDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        status: status as "pending" | "approved" | "rejected",
        description: receipt.description,
        manager: receipt.approvals.find(a => a.approver.role === "MANAGER")?.approver.name || "Unassigned",
        receiptUrl: receipt.receiptUrl,
        createdAt: receipt.createdAt
      };
    });

    return NextResponse.json({
      receipts: formattedReceipts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching receipts:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getUserFromToken();
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      amountOriginal,
      currencyOriginal = "USD",
      amountConverted,
      currencyCompany = "USD",
      conversionRate = 1,
      category,
      description,
      expenseDate,
      receiptUrl
    } = body;

    // Validate required fields
    if (!amountConverted || !category || !description || !expenseDate) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const receipt = await prisma.receipt.create({
      data: {
        amountOriginal,
        currencyOriginal,
        amountConverted,
        currencyCompany,
        conversionRate,
        category,
        description,
        expenseDate: new Date(expenseDate),
        receiptUrl,
        createdById: user.id
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Create initial approval if needed based on company rules
    // For now, we'll skip this as it requires complex approval logic

    return NextResponse.json({
      message: "Receipt created successfully",
      receipt: {
        id: `EXP-${receipt.id.slice(-6).toUpperCase()}`,
        employee: receipt.createdBy.name,
        category: receipt.category,
        amount: `$${receipt.amountConverted.toLocaleString()}`,
        date: receipt.expenseDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        status: "pending",
        description: receipt.description,
        receiptUrl: receipt.receiptUrl,
        createdAt: receipt.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating receipt:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
