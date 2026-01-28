import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";
import { startOfDay, endOfDay } from "date-fns";

export async function POST(
    req: Request,
    props: { params: Promise<{ habitId: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getSessionUserId();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { habitId } = params;
        const body = await req.json();
        const { date } = body;

        const checkDate = new Date(date);
        const dayStart = startOfDay(checkDate);
        const dayEnd = endOfDay(checkDate);

        const existingLog = await prisma.habitLog.findFirst({
            where: {
                habitId: habitId,
                date: {
                    gte: dayStart,
                    lte: dayEnd
                }
            }
        });

        if (existingLog) {
            await prisma.habitLog.delete({
                where: { id: existingLog.id }
            });
            return NextResponse.json({ completed: false });
        } else {
            await prisma.habitLog.create({
                data: {
                    habitId: habitId,
                    date: checkDate,
                    completed: true
                }
            });
            return NextResponse.json({ completed: true });
        }
    } catch (error) {
        console.error("[HABIT_CHECK_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
