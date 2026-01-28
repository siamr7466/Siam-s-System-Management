import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, color } = body;

        const category = await prisma.blogCategory.update({
            where: {
                id: params.id,
                userId: userId
            },
            data: {
                name,
                color
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error("[CATEGORY_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await prisma.blogCategory.delete({
            where: {
                id: params.id,
                userId: userId
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[CATEGORY_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
