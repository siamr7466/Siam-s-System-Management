import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function POST(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { title, date, color, description } = await req.json();

        if (!title || !date) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                userId,
                title,
                date: new Date(date),
                color: color || "#3b82f6",
                description
            }
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error("[EVENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return new NextResponse("Event ID missing", { status: 400 });
        }

        await prisma.event.delete({
            where: { id, userId }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[EVENTS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
