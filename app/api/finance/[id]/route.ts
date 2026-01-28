import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const userId = await getSessionUserId();
    if (!userId) {
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
                    userId: userId
                }
            });
        } else if (type === 'saving') {
            await prisma.saving.delete({
                where: {
                    id: params.id,
                    userId: userId
                }
            });
        } else {
            await prisma.expense.delete({
                where: {
                    id: params.id,
                    userId: userId
                }
            });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[FINANCE_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
