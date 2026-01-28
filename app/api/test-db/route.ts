import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth-helper";

export async function GET() {
    const report: any = {
        timestamp: new Date().toISOString(),
        database: "testing...",
        userSession: "testing...",
    };

    try {
        // Test 1: Simple DB Query
        await prisma.$queryRaw`SELECT 1`;
        report.database = "Connected successfully!";
    } catch (e: any) {
        report.database = "FAILED: " + e.message;
        report.db_error_details = e.stack;
    }

    try {
        // Test 2: User Lookup
        const userId = await getSessionUserId();
        report.userSession = "Found User ID: " + userId;

        const userCount = await prisma.user.count();
        report.totalUsersInDb = userCount;
    } catch (e: any) {
        report.userSession = "FAILED: " + e.message;
    }

    return NextResponse.json(report);
}
