import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/actions/authAction';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authUser = await auth();
    if (!authUser) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const { status } = await request.json();
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Check if user can approve this expense
    const expense = await prisma.receipt.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            id: true,
            role: true,
            managerId: true,
          }
        },
        approvals: true
      }
    });

    if (!expense) {
      return NextResponse.json(
        { message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authUser.role === 'EMPLOYEE') {
      return NextResponse.json(
        { message: 'Employees cannot approve expenses' },
        { status: 403 }
      );
    }

    if (authUser.role === 'MANAGER') {
      // Managers can only approve expenses from their direct reports
      if (expense.createdBy.managerId !== authUser.id) {
        return NextResponse.json(
          { message: 'You can only approve expenses from your direct reports' },
          { status: 403 }
        );
      }
    }

    // Check if already approved/rejected
    if (expense.approvals.length > 0) {
      return NextResponse.json(
        { message: 'Expense has already been processed' },
        { status: 400 }
      );
    }

    const approval = await prisma.approval.create({
      data: {
        receiptId: params.id,
        approverId: authUser.id,
        status: status,
        order: 1,
      }
    });

    return NextResponse.json({
      message: `Expense ${status.toLowerCase()} successfully`,
      approval
    });

  } catch (error) {
    console.error('Error approving expense:', error);
    return NextResponse.json(
      { message: 'Failed to process expense' },
      { status: 500 }
    );
  }
}
