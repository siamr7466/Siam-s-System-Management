import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";

export async function getUserId() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            return session.user.id;
        }
    } catch (error) {
        console.error("Session error:", error);
    }

    // Fallback: Use the first user in the database
    try {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) return firstUser.id;
    } catch (error) {
        console.error("Fallback user error:", error);
    }

    return "guest-user-id";
}
