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

        // Check if already disliked
        const existingDislike = await prisma.dislike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingDislike) {
            // Remove dislike
            await prisma.dislike.delete({
                where: {
                    id: existingDislike.id,
                },
            });
            return NextResponse.json({ disliked: false });
        }

        // Remove like if exists
        await prisma.like.deleteMany({
            where: {
                userId,
                postId,
            },
        });

        // Add dislike
        await prisma.dislike.create({
            data: {
                userId,
                postId,
            },
        });

        return NextResponse.json({ disliked: true });
    } catch (error) {
        console.error("[BLOG_DISLIKE_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
