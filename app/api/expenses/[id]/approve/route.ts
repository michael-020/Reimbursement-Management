import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/actions/authAction';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    
    console.log('Approval request:', { status, expenseId: (await params).id });
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      console.log('Invalid status received:', status);
      return NextResponse.json(
        { message: 'Invalid status. Must be APPROVED or REJECTED' },
        { status: 400 }
      );
    }

    // Check if user can approve this expense
    const expense = await prisma.receipt.findUnique({
      where: { id: (await params).id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
            managerId: true,
          }
        },
        approvals: true
      }
    });

    console.log('Found expense:', expense);
    console.log('User role:', authUser.role);
    console.log('User ID:', authUser.id);
    console.log('Expense createdBy:', expense?.createdBy);

    if (!expense) {
      console.log('Expense not found');
      return NextResponse.json(
        { message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (authUser.role === 'EMPLOYEE') {
      console.log('Employee cannot approve expenses');
      return NextResponse.json(
        { message: 'Employees cannot approve expenses' },
        { status: 403 }
      );
    }

    if (authUser.role === 'MANAGER') {
      // Managers can only approve expenses from their direct reports
      if (expense.createdBy.managerId !== authUser.id) {
        console.log('Manager cannot approve - not direct report:', { managerId: expense.createdBy.managerId, userId: authUser.id });
        return NextResponse.json(
          { message: 'You can only approve expenses from your direct reports' },
          { status: 403 }
        );
      }
    }

    // Check if already approved/rejected by checking manager's specific approval
    const managerApproval = expense.approvals.find(a => a.approverId === authUser.id);
    
    if (managerApproval) {
      if (managerApproval.status !== 'PENDING') {
        console.log('Manager has already acted on this expense:', managerApproval.status);
        return NextResponse.json(
          { message: 'You have already processed this expense' },
          { status: 400 }
        );
      }
      
      // Update existing pending approval
      const updatedApproval = await prisma.approval.update({
        where: { id: managerApproval.id },
        data: {
          status: status,
          comments: status === 'REJECTED' ? 'Rejected by manager' : 'Approved by manager',
        }
      });
      
      return NextResponse.json({
        message: `Expense ${status.toLowerCase()} successfully`,
        approval: updatedApproval
      });
    }

    const approval = await prisma.approval.create({
      data: {
        receiptId: (await params).id,
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
