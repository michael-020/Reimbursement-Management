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

const UpdateApprovalSequenceSchema = z.object({
  name: z.string().min(1, "Sequence name is required").optional(),
  description: z.string().optional(),
  steps: z.array(ApprovalStepSchema).optional(),
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
      return NextResponse.json({ message: "Sequence ID is required" }, { status: 400 });
    }

    const body = await req.json();
    const parsedBody = UpdateApprovalSequenceSchema.safeParse(body);
    
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

    // Check if the sequence exists and belongs to the user's company
    const existingSequence = await prisma.approvalSequence.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    });

    if (!existingSequence) {
      return NextResponse.json({ message: "Approval sequence not found" }, { status: 404 });
    }

    // Validate steps if provided
    if (updateData.steps) {
      const stepOrders = updateData.steps.map(step => step.order);
      const uniqueOrders = new Set(stepOrders);
      if (stepOrders.length !== uniqueOrders.size) {
        return NextResponse.json(
          { message: "Step orders must be unique" },
          { status: 400 }
        );
      }

      // Validate specific approvers exist and belong to same company
      for (const step of updateData.steps) {
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
    }

    // Update sequence and steps if provided
    let updatedSequence;
    if (updateData.steps) {
      // Delete existing steps and create new ones
      await prisma.approvalStep.deleteMany({
        where: { sequenceId: id }
      });

      updatedSequence = await prisma.approvalSequence.update({
        where: { id },
        data: {
          name: updateData.name,
          description: updateData.description,
          isActive: updateData.isActive,
          steps: {
            create: updateData.steps
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
    } else {
      // Update only sequence fields
      updatedSequence = await prisma.approvalSequence.update({
        where: { id },
        data: {
          name: updateData.name,
          description: updateData.description,
          isActive: updateData.isActive,
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
    }

    return NextResponse.json(
      { message: "Approval sequence updated successfully", approvalSequence: updatedSequence },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating approval sequence:", error);
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
      return NextResponse.json({ message: "Sequence ID is required" }, { status: 400 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    // Check if the sequence exists and belongs to the user's company
    const existingSequence = await prisma.approvalSequence.findFirst({
      where: {
        id,
        companyId: user.company.id
      }
    });

    if (!existingSequence) {
      return NextResponse.json({ message: "Approval sequence not found" }, { status: 404 });
    }

    // Delete the sequence (steps will be deleted due to cascade)
    await prisma.approvalSequence.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "Approval sequence deleted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting approval sequence:", error);
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
      return NextResponse.json({ message: "Sequence ID is required" }, { status: 400 });
    }

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { company: true }
    });

    if (!user || !user.company) {
      return NextResponse.json({ message: "User not associated with a company" }, { status: 404 });
    }

    const approvalSequence = await prisma.approvalSequence.findFirst({
      where: {
        id,
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
      }
    });

    if (!approvalSequence) {
      return NextResponse.json({ message: "Approval sequence not found" }, { status: 404 });
    }

    return NextResponse.json({ approvalSequence }, { status: 200 });

  } catch (error) {
    console.error("Error fetching approval sequence:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
};
