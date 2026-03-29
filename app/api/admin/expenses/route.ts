import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/actions/authAction';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Authenticate user
    const authUser = await auth();
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    // Fetch all expenses with related data
    const expenses = await prisma.receipt.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
          }
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            currency: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format the response
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      employeeName: expense.createdBy.name,
      employeeEmail: expense.createdBy.email,
      employeeRole: expense.createdBy.role,
      amount: `$${expense.amountConverted.toLocaleString()}`,
      currency: expense.currencyCompany,
      category: expense.category,
      description: expense.description,
      date: expense.expenseDate.toLocaleDateString(),
      status: expense.approvals.length > 0 
        ? expense.approvals.some(a => a.status === 'REJECTED') 
          ? 'rejected' 
          : expense.approvals.some(a => a.status === 'APPROVED')
            ? 'approved'
            : 'pending'
        : 'pending',
      receiptUrl: expense.receiptUrl,
      createdAt: expense.createdAt.toLocaleDateString(),
      approvals: expense.approvals.map(approval => ({
        id: approval.id,
        status: approval.status,
        approverName: approval.approver.name,
        approverEmail: approval.approver.email,
        approverRole: approval.approver.role,
        createdAt: approval.createdAt.toLocaleDateString()
      })),
      company: expense.company
    }));

    return NextResponse.json({
      message: 'Expenses fetched successfully',
      expenses: formattedExpenses
    });

  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}
