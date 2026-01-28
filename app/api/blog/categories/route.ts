import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function GET() {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const categories = await prisma.blogCategory.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error("[CATEGORIES_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, color } = body;

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const category = await prisma.blogCategory.create({
            data: {
                userId,
                name,
                color: color || "#3b82f6"
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORIES_POST]", error);
        if ((error as any).code === 'P2002') {
            return new NextResponse("Category already exists", { status: 400 });
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}
