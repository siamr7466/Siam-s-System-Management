import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUserId() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) return session.user.id;
    } catch (sessionErr) {
        // Fall through to database lookup
    }

    // "No Auth" Fallback: Use the first user in the database or create one
    try {
        let firstUser = await prisma.user.findFirst();

        if (!firstUser) {
            console.log("DB_DIAGNOSTIC: No users found. Creating default...");
            firstUser = await prisma.user.create({
                data: {
                    id: "default-user-id",
                    email: "siamrahman7466@gmail.com",
                    name: "Siam Rahman",
                }
            });
            console.log("DB_DIAGNOSTIC: Default user created with ID:", firstUser.id);
        }

        return firstUser.id;
    } catch (error: any) {
        console.error("DB_CRITICAL_ERROR: Connection failed!", error.message);
        return "default-user-id";
    }
}
