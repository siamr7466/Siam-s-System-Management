import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";
import { startOfMonth, endOfMonth, parseISO, startOfWeek, endOfWeek, subDays, addDays } from "date-fns";

export async function GET(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const monthStr = searchParams.get("month");

        let targetDate;
        if (monthStr) {
            targetDate = parseISO(`${monthStr}-01`);
        } else {
            targetDate = new Date();
        }

        // Expand range by 1 day to catch entries that might shift across boundaries due to timezone offsets
        const startDate = subDays(startOfWeek(startOfMonth(targetDate)), 1);
        const endDate = addDays(endOfWeek(endOfMonth(targetDate)), 1);

        // Fetch custom events
        const events = await prisma.event.findMany({
            where: { userId, date: { gte: startDate, lte: endDate } }
        });

        // Fetch todos (tasks) with due dates in range
        const tasks = await prisma.task.findMany({
            where: { userId, dueDate: { gte: startDate, lte: endDate } }
        });

        // Fetch habit logs in range
        const habitLogs = await prisma.habitLog.findMany({
            where: {
                habit: { userId },
                date: { gte: startDate, lte: endDate },
                completed: true
            },
            include: { habit: true }
        });

        // Fetch Financial Data
        const incomes = await prisma.income.findMany({
            where: { userId, date: { gte: startDate, lte: endDate } }
        });

        const expenses = await prisma.expense.findMany({
            where: { userId, date: { gte: startDate, lte: endDate } }
        });

        const savings = await prisma.saving.findMany({
            where: { userId, date: { gte: startDate, lte: endDate } }
        });

        return NextResponse.json({
            events,
            tasks,
            habitLogs,
            incomes,
            expenses,
            savings
        });

    } catch (error) {
        console.error("[CALENDAR_GET] Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
