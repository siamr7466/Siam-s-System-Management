import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function GET() {
    try {
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const posts = await prisma.blogPost.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                files: true,
                likes: true,
                dislikes: true,
                category: true
            }
        });

        return NextResponse.json(posts);
    } catch (error) {
        console.error("[BLOG_GET]", error);
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
        const { title, content, published, tags, categoryId } = body;

        if (!title || !content) {
            return new NextResponse("Title and content are required", { status: 400 });
        }

        const post = await prisma.blogPost.create({
            data: {
                userId,
                title,
                content,
                published: published || false,
                tags: tags || [],
                categoryId: categoryId === "none" || !categoryId ? null : categoryId
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("[BLOG_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
