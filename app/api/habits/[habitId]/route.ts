import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ habitId: string }> }
) {
    const params = await props.params;
    const userId = await getSessionUserId();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, frequency, color } = body;

        const habit = await prisma.habit.update({
            where: {
                id: params.habitId,
                userId: userId,
            },
            data: {
                name,
                description,
                frequency,
                color,
            },
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error("[HABIT_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ habitId: string }> }
) {
    const params = await props.params;
    const userId = await getSessionUserId();

    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.habit.delete({
            where: {
                id: params.habitId,
                userId: userId,
            },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[HABIT_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
