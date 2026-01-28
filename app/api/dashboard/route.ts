import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";
import { startOfDay, endOfDay, subDays, subHours, format, isSameDay } from "date-fns";

export async function GET(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const today = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

        // 1. Habit Data
        const allHabits = await prisma.habit.findMany({
            where: { userId },
            include: { logs: true }
        });

        const habitData = last7Days.map(day => {
            const dayStr = format(day, "EEE"); // Mon, Tue...
            // Total persistence
            const activeCount = allHabits.length; // Assuming all habits active
            const completedCount = allHabits.filter((h: any) =>
                h.logs.some((l: any) => isSameDay(new Date(l.date), day))
            ).length;

            const percentage = activeCount > 0 ? Math.round((completedCount / activeCount) * 100) : 0;

            // Specific Habits (Pick top 3 or specific names if available)
            // We'll map dynamic keys like "Habit 1", "Habit 2" if we can't find specific categories
            const specificHabits: any = {};
            allHabits.slice(0, 3).forEach((h: any, i: number) => {
                const isDone = h.logs.some((l: any) => isSameDay(new Date(l.date), day));
                // Sanitize name for key
                const key = h.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                specificHabits[key] = isDone ? 100 : 0; // Binary 0/100 for line? Or accumulated?
                // Actually, for a daily graph, 0 or 100 is jagged.
                // Let's just pass 0 or 100 for now, or maybe smooth it over weeks? 
                // The prompt "Live Habit Persistence" implies consistency. 
                // Let's stick to 100 if done, 0 if not.
            });

            return {
                name: dayStr,
                total: percentage,
                ...specificHabits
            };
        });

        // 2. Todo Data
        // We need "completed" tasks per day.
        const completedTasksLast7Days = await prisma.task.findMany({
            where: {
                userId: userId,
                status: "DONE",
                updatedAt: {
                    gte: startOfDay(subDays(today, 7))
                }
            }
        });

        const todoData = last7Days.map(day => {
            const dayStr = format(day, "EEE");
            const tasksDoneOnDay = completedTasksLast7Days.filter((t: any) => isSameDay(new Date(t.updatedAt), day));

            const highCount = tasksDoneOnDay.filter((t: any) => t.priority === "HIGH").length;
            const mediumCount = tasksDoneOnDay.filter((t: any) => t.priority === "MEDIUM").length;

            const count = tasksDoneOnDay.length;
            const rate = Math.min(count * 20, 100); // Mock efficiency: 5 tasks = 100%

            return {
                name: dayStr,
                rate: rate,
                high: highCount,
                medium: mediumCount
            };
        });

        // 3. Budget Data (with range support)
        const { searchParams } = new URL(req.url);
        const range = searchParams.get("range") || "week"; // week, month, year

        let startDate;
        let dateFormatStr = "EEE";
        let segmentCount = 7;

        if (range === "day") {
            startDate = startOfDay(today);
            segmentCount = 24; // Hours
            dateFormatStr = "HH:00";
        } else if (range === "month") {
            startDate = subDays(today, 30);
            segmentCount = 30;
            dateFormatStr = "MMM d";
        } else {
            // default to week
            startDate = subDays(today, 7);
            segmentCount = 7;
            dateFormatStr = "EEE";
        }

        const rangeIncomes = await prisma.income.findMany({
            where: { userId, date: { gte: startDate } }
        });
        const rangeExpenses = await prisma.expense.findMany({
            where: { userId, date: { gte: startDate } }
        });

        const budgetData = Array.from({ length: segmentCount }).map((_, i) => {
            let unitDate: Date;
            let filterFn: (d: Date) => boolean;

            if (range === "day") {
                unitDate = subHours(new Date(), segmentCount - 1 - i);
                filterFn = (txDate: Date) => isSameDay(txDate, unitDate) && txDate.getHours() === unitDate.getHours();
            } else {
                unitDate = subDays(today, segmentCount - 1 - i);
                filterFn = (txDate: Date) => isSameDay(txDate, unitDate);
            }

            const dayStr = format(unitDate, dateFormatStr);
            const inc = rangeIncomes.filter((i: any) => filterFn(new Date(i.date))).reduce((sum: number, i: any) => sum + i.amount, 0);
            const exp = rangeExpenses.filter((e: any) => filterFn(new Date(e.date))).reduce((sum: number, e: any) => sum + e.amount, 0);

            return {
                name: dayStr,
                income: inc,
                expense: exp,
                saved: inc - exp
            };
        });

        // 4. Summary Stats
        const pendingTasksCount = await prisma.task.count({
            where: { userId, status: { not: "DONE" } }
        });

        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthIncomes = await prisma.income.aggregate({
            where: { userId, date: { gte: monthStart } },
            _sum: { amount: true }
        });
        const monthExpenses = await prisma.expense.aggregate({
            where: { userId, date: { gte: monthStart } },
            _sum: { amount: true }
        });
        const monthlySavings = (monthIncomes._sum.amount || 0) - (monthExpenses._sum.amount || 0);

        const habitCompletionToday = Math.round((allHabits.filter((h: any) =>
            h.logs.some((l: any) => isSameDay(new Date(l.date), today))
        ).length / (allHabits.length || 1)) * 100);

        const upcomingTasks = await prisma.task.findMany({
            where: { userId, status: { not: "DONE" } },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return NextResponse.json({
            habitData,
            todoData,
            budgetData,
            stats: {
                habitCompletion: `${habitCompletionToday}%`,
                pendingTasks: pendingTasksCount,
                monthlySavings: monthlySavings,
                focusScore: 85
            },
            topHabits: allHabits.slice(0, 3).map((h: any) => ({ name: h.name, key: h.name.toLowerCase().replace(/[^a-z0-9]/g, '') })),
            upcomingTasks
        });

    } catch (error) {
        console.error("[DASHBOARD_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
