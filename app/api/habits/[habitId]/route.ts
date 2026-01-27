import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ habitId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { habitId } = await params;

        await prisma.habit.delete({
            where: {
                id: habitId,
                userId: session.user.id, // Security: Ensure user owns the habit
            },
        });

        return NextResponse.json({ message: "Habit deleted" });

    } catch (error) {
        console.error("[HABIT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
