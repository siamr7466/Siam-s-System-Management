import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const post = await prisma.blogPost.findUnique({
            where: {
                id: params.id,
            },
            include: {
                files: true,
                likes: true,
                dislikes: true,
                category: true,
            },
        });

        if (!post) {
            return new NextResponse("Not Found", { status: 404 });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error("[BLOG_ITEM_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, content, published, tags, categoryId } = body;

        const post = await prisma.blogPost.update({
            where: {
                id: params.id,
                userId: userId
            },
            data: {
                title,
                content,
                published,
                tags,
                categoryId: categoryId === "none" || !categoryId ? null : categoryId
            }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error("[BLOG_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const userId = await getSessionUserId();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        await prisma.blogPost.delete({
            where: {
                id: params.id,
                userId: userId
            }
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[BLOG_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
