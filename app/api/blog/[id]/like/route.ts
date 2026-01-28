import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const postId = params.id;

        // Check if already liked
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            // Remove like (unlike)
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });
            return NextResponse.json({ liked: false });
        }

        // Remove dislike if exists
        await prisma.dislike.deleteMany({
            where: {
                userId,
                postId,
            },
        });

        // Add like
        await prisma.like.create({
            data: {
                userId,
                postId,
            },
        });

        return NextResponse.json({ liked: true });
    } catch (error) {
        console.error("[BLOG_LIKE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
