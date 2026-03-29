import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import prisma from "@/prisma/index";
import jwt from "jsonwebtoken";

const ApprovalStepSchema = z.object({
  approverType: z.enum(["MANAGER", "FINANCE", "DIRECTOR"]),
  specificApproverId: z.string().uuid().optional(),
  order: z.number().min(1),
  isRequired: z.boolean().default(true),
});

const CreateApprovalSequenceSchema = z.object({
  name: z.string().min(1, "Sequence name is required"),
  description: z.string().optional(),
  steps: z.array(ApprovalStepSchema).min(1, "At least one step is required"),
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
    const parsedBody = CreateApprovalSequenceSchema.safeParse(body);
    
    if (!parsedBody.success) {
      return NextResponse.json(
        { message: "Invalid input", details: parsedBody.error.issues },
        { status: 400 }
      );
    }

    const { name, description, steps } = parsedBody.data;

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    // Validate steps
    const stepOrders = steps.map(step => step.order);
    const uniqueOrders = new Set(stepOrders);
    if (stepOrders.length !== uniqueOrders.size) {
      return NextResponse.json(
        { message: "Step orders must be unique" },
        { status: 400 }
      );
    }

    // Validate specific approvers exist and belong to same company
    for (const step of steps) {
      if (step.specificApproverId) {
        const specificApprover = await prisma.user.findFirst({
          where: {
            id: step.specificApproverId,
            companyId: user.company.id
          }
        });

        if (!specificApprover) {
          return NextResponse.json(
            { message: `Specific approver not found or not in the same company for step ${step.order}` },
            { status: 404 }
          );
        }
      }
    }

    // Create approval sequence with steps
    const approvalSequence = await prisma.approvalSequence.create({
      data: {
        name,
        description,
        companyId: user.company.id,
        steps: {
          create: steps
        }
      },
      include: {
        steps: {
          include: {
            specificApprover: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return NextResponse.json(
      { message: "Approval sequence created successfully", approvalSequence },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating approval sequence:", error);
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

    const approvalSequences = await prisma.approvalSequence.findMany({
      where: {
        companyId: user.company.id
      },
      include: {
        steps: {
          include: {
            specificApprover: {
              select: { id: true, name: true, email: true, role: true }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ approvalSequences }, { status: 200 });

  } catch (error) {
    console.error("Error fetching approval sequences:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
