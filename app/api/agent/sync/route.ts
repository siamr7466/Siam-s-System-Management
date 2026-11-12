import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";
import { isSameDay, startOfDay } from "date-fns";

export async function GET(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const [tasks, habits, incomes, expenses, savings] = await Promise.all([
            prisma.task.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.habit.findMany({
                where: { userId },
                include: { logs: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.income.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
            prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
            prisma.saving.findMany({ where: { userId }, orderBy: { date: 'desc' } })
        ]);

        const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);
        const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
        const totalSaved = savings.reduce((acc, s) => acc + s.amount, 0);
        const netBalance = totalIncome - totalExpense;

        const today = new Date();
        const habitsSummary = habits.map(h => ({
            id: h.id,
            name: h.name,
            frequency: h.frequency,
            color: h.color,
            isCompletedToday: h.logs.some(l => isSameDay(new Date(l.date), today) && l.completed),
            totalLogs: h.logs.length
        }));

        return NextResponse.json({
            success: true,
            syncedAt: new Date().toISOString(),
            agent: "Hermes Agent (Coal Reeds)",
            stats: {
                totalTasks: tasks.length,
                pendingTasks: tasks.filter(t => t.status !== "DONE").length,
                completedTasks: tasks.filter(t => t.status === "DONE").length,
                netBalanceBDT: netBalance,
                totalIncomeBDT: totalIncome,
                totalExpenseBDT: totalExpense,
                totalSavingsBDT: totalSaved
            },
            tasks,
            habits: habitsSummary
        });
    } catch (error: any) {
        console.error("[AGENT_SYNC_GET]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { action, payload } = body;

        if (action === "create_task") {
            const task = await prisma.task.create({
                data: {
                    userId,
                    title: payload.title,
                    description: payload.description || "",
                    status: payload.status || "PENDING",
                    priority: payload.priority || "MEDIUM",
                    tags: payload.tags || ["Hermes-Synced"],
                    dueDate: payload.dueDate ? new Date(payload.dueDate) : null
                }
            });
            return NextResponse.json({ success: true, message: "Task created by Hermes Agent", task });
        }

        if (action === "update_task") {
            const task = await prisma.task.update({
                where: { id: payload.id },
                data: {
                    status: payload.status,
                    priority: payload.priority,
                    title: payload.title,
                    description: payload.description
                }
            });
            return NextResponse.json({ success: true, message: "Task updated by Hermes Agent", task });
        }

        if (action === "delete_task") {
            await prisma.task.delete({
                where: { id: payload.id }
            });
            return NextResponse.json({ success: true, message: "Task deleted by Hermes Agent" });
        }

        if (action === "add_finance") {
            let res;
            if (payload.type === "income") {
                res = await prisma.income.create({
                    data: {
                        userId,
                        amount: parseFloat(payload.amount),
                        source: payload.category || "Agency Revenue",
                        date: payload.date ? new Date(payload.date) : new Date()
                    }
                });
            } else if (payload.type === "saving") {
                res = await prisma.saving.create({
                    data: {
                        userId,
                        amount: parseFloat(payload.amount),
                        purpose: payload.category || "Reserve",
                        date: payload.date ? new Date(payload.date) : new Date()
                    }
                });
            } else {
                res = await prisma.expense.create({
                    data: {
                        userId,
                        amount: parseFloat(payload.amount),
                        category: payload.category || "General Expense",
                        description: payload.description || "",
                        date: payload.date ? new Date(payload.date) : new Date()
                    }
                });
            }
            return NextResponse.json({ success: true, message: "Finance logged by Hermes Agent", record: res });
        }

        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    } catch (error: any) {
        console.error("[AGENT_SYNC_POST]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
