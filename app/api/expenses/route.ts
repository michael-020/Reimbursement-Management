import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/actions/authAction';
import { prisma } from '@/lib/prisma';
import { convertCurrency } from '@/lib/currency';

export async function GET() {
  try {
    // Authenticate user
    const authUser = await auth();
    if (!authUser) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    let expenses;

    if (authUser.role === 'MANAGER') {
      // For managers: fetch expenses where they are approvers or expenses from their direct reports
      expenses = await prisma.receipt.findMany({
        where: {
          OR: [
            // Expenses where they are approvers
            {
              approvals: {
                some: {
                  approverId: authUser.id
                }
              }
            },
            // Expenses from their direct reports (employees who have them as manager)
            {
              createdBy: {
                managerId: authUser.id
              }
            }
          ]
        },
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
    } else if (authUser.role === 'EMPLOYEE') {
      // For employees: fetch only their own expenses
      expenses = await prisma.receipt.findMany({
        where: {
          createdById: authUser.id
        },
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
    } else {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    // Format the response
    const formattedExpenses = expenses.map(expense => ({
      id: expense.id,
      employeeName: expense.createdBy.name,
      employeeEmail: expense.createdBy.email,
      employeeRole: expense.createdBy.role,
      amountOriginal: expense.amountOriginal,
      currencyOriginal: expense.currencyOriginal,
      amountConverted: expense.amountConverted,
      currencyCompany: expense.currencyCompany,
      conversionRate: expense.conversionRate,
      amount: `${expense.currencyCompany} ${expense.amountConverted.toLocaleString()}`,
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
      company: expense.company,
      canApprove: authUser.role === 'MANAGER' && 
        expense.approvals.length === 0 && 
        expense.createdBy.managerId === authUser.id
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

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authUser = await auth();
    if (!authUser) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      );
    }

    const {
      amountOriginal,
      currencyOriginal,
      category,
      description,
      expenseDate,
      receiptUrl
    } = await request.json();

    // Validate required fields
    if (!amountOriginal || !currencyOriginal || !category || !description || !expenseDate) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's company to determine base currency
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        { message: 'User is not associated with a company' },
        { status: 400 }
      );
    }

    // Convert currency from original to company's base currency
    const currencyCompany = user.company.currency;
    let amountConverted, conversionRate;

    try {
      const conversion = await convertCurrency(
        parseFloat(amountOriginal),
        currencyOriginal,
        currencyCompany
      );
      amountConverted = conversion.convertedAmount;
      conversionRate = conversion.rate;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return NextResponse.json(
        { message: 'Failed to convert currency. Please try again.' },
        { status: 500 }
      );
    }

    // Create expense
    const expense = await prisma.receipt.create({
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
        createdById: authUser.id,
        companyId: user.companyId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            currency: true,
          }
        }
      }
    });

    // Format response
    const formattedExpense = {
      id: expense.id,
      employeeName: expense.createdBy.name,
      employeeEmail: expense.createdBy.email,
      employeeRole: expense.createdBy.role,
      amountOriginal: expense.amountOriginal,
      currencyOriginal: expense.currencyOriginal,
      amountConverted: expense.amountConverted,
      currencyCompany: expense.currencyCompany,
      conversionRate: expense.conversionRate,
      amount: `${currencyCompany} ${expense.amountConverted.toLocaleString()}`,
      category: expense.category,
      description: expense.description,
      date: expense.expenseDate.toLocaleDateString(),
      status: 'pending',
      receiptUrl: expense.receiptUrl,
      createdAt: expense.createdAt.toLocaleDateString(),
      company: expense.company
    };

    return NextResponse.json({
      message: 'Expense created successfully',
      expense: formattedExpense
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { message: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
