import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(tasks);
    } catch (error) {
        console.error("[TASKS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { title, description, priority, dueDate, tags } = body;

        const task = await prisma.task.create({
            data: {
                userId: session.user.id,
                title,
                description,
                status: "PENDING",
                priority: priority || "MEDIUM",
                dueDate: dueDate ? new Date(dueDate) : null,
                tags: tags || []
            }
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("[TASKS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
