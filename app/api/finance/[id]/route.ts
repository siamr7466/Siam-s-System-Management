import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'income' or 'expense'

    if (!type) {
        return new NextResponse("Type is required", { status: 400 });
    }

    try {
        if (type === 'income') {
            await prisma.income.delete({
                where: {
                    id: params.id,
                    userId: session.user.id
                }
            });
        } else if (type === 'saving') {
            await prisma.saving.delete({
                where: {
                    id: params.id,
                    userId: session.user.id
                }
            });
        } else {
            await prisma.expense.delete({
                where: {
                    id: params.id,
                    userId: session.user.id
                }
            });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[FINANCE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
