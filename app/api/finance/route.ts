import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function GET() {
    const userId = await getSessionUserId();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const [incomes, expenses, savings] = await Promise.all([
            prisma.income.findMany({
                where: { userId: userId },
                orderBy: { date: 'desc' }
            }),
            prisma.expense.findMany({
                where: { userId: userId },
                orderBy: { date: 'desc' }
            }),
            prisma.saving.findMany({
                where: { userId: userId },
                orderBy: { date: 'desc' }
            })
        ]);

        const transactions = [
            ...incomes.map(i => ({ ...i, type: 'income', category: i.source, title: i.source })),
            ...expenses.map(e => ({ ...e, type: 'expense', title: e.description || e.category })),
            ...savings.map(s => ({ ...s, type: 'saving', title: s.purpose, category: 'Savings' }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return NextResponse.json(transactions);
    } catch (error) {
        console.error("[FINANCE_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const userId = await getSessionUserId();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { type, amount, category, description, date } = body;

        let result;
        if (type === 'income') {
            result = await prisma.income.create({
                data: {
                    userId: userId,
                    amount: parseFloat(amount),
                    source: category,
                    date: new Date(date),
                    recurring: false
                }
            });
        } else if (type === 'saving') {
            result = await prisma.saving.create({
                data: {
                    userId: userId,
                    amount: parseFloat(amount),
                    purpose: category, // Using category as purpose
                    date: new Date(date)
                }
            });
        } else {
            result = await prisma.expense.create({
                data: {
                    userId: userId,
                    amount: parseFloat(amount),
                    category,
                    description,
                    date: new Date(date)
                }
            });
        }

        return NextResponse.json(result);
    } catch (error) {

        console.error("[FINANCE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
