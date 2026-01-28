import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = await getSessionUserId();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { status, title, description, priority, dueDate, tags } = body;

        const task = await prisma.task.update({
            where: {
                id: params.id,
                userId: userId
            },
            data: {
                status,
                title,
                description,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                tags
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASK_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = await getSessionUserId();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        await prisma.task.delete({
            where: {
                id: params.id,
                userId: userId
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[TASK_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
