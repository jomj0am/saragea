// app/api/expenses/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// ... import session logic ...

// GET all expenses
export async function GET() {
    // ... (admin protection logic) ...
    const expenses = await prisma.expense.findMany({
        include: { property: { select: { name: true } } },
        orderBy: { expenseDate: 'desc' },
    });
    return NextResponse.json(expenses);
}

// CREATE a new expense
export async function POST(req: Request) {
    // ... (admin protection logic) ...
    const body = await req.json();
    const { propertyId, category, description, amount, expenseDate } = body;

    const newExpense = await prisma.expense.create({
        data: {
            propertyId: propertyId || null,
            category,
            description,
            amount: parseFloat(amount),
            expenseDate: new Date(expenseDate),
        },
    });
    return NextResponse.json(newExpense, { status: 201 });
}