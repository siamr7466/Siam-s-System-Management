import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUserId() {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;

    // "No Auth" Fallback: Use the first user in the database
    try {
        const firstUser = await prisma.user.findFirst();
        return firstUser?.id || "guest-user-id";
    } catch (error) {
        console.error("Failed to fetch fallback user (DB might be down):", error);
        return "guest-user-id";
    }
}
