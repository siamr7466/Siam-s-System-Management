import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const habits = await prisma.habit.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                logs: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 7)) // Last 7 days for efficiency
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(habits);
    } catch (error) {
        console.error("[HABITS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description, frequency, color } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const habit = await prisma.habit.create({
            data: {
                userId: session.user.id,
                name,
                description,
                frequency: frequency || "DAILY",
                color: color || "#a855f7", // Default purple
            },
        });

        return NextResponse.json(habit);
    } catch (error) {
        console.error("[HABITS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
