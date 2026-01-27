import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Await params as it is a promise in Next.js 15+ (and 16 potentially?) 
        // Wait, in Next 15+ params is a promise. The project is 16.1.5.
        // The user's metadata says Next 16.1.5.
        const { habitId } = await params;

        const body = await req.json();
        const { date } = body; // Expect ISO string for the specific day

        if (!date) {
            return new NextResponse("Date is required", { status: 400 });
        }

        // Normalize date to start of day to avoid time issues
        // Actually, trust the client to send a comparable date, or store as provided.
        // Best practice: Store as T00:00:00.000Z
        const checkDate = new Date(date);

        // Check if log exists
        const existingLog = await prisma.habitLog.findFirst({
            where: {
                habitId: habitId,
                date: checkDate
            }
        });

        if (existingLog) {
            // Toggle OFF: Delete
            await prisma.habitLog.delete({
                where: {
                    id: existingLog.id
                }
            });
            return NextResponse.json({ completed: false });
        } else {
            // Toggle ON: Create
            await prisma.habitLog.create({
                data: {
                    habitId: habitId,
                    date: checkDate,
                    completed: true,
                    score: 1
                }
            });
            return NextResponse.json({ completed: true });
        }

    } catch (error) {
        console.error("[HABIT_CHECK]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
