import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function getSessionUserId() {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;

    // "No Auth" Fallback: Use the first user in the database or create one
    try {
        let firstUser = await prisma.user.findFirst();

        if (!firstUser) {
            console.log("DB_DIAGNOSTIC: No users found. Creating default...");
            firstUser = await prisma.user.create({
                data: {
                    email: "siamrahman7466@gmail.com",
                    name: "Siam Rahman",
                }
            });
            console.log("DB_DIAGNOSTIC: Default user created with ID:", firstUser.id);
        }

        return firstUser.id;
    } catch (error: any) {
        console.error("DB_CRITICAL_ERROR: Connection failed!", error.message);
        console.error("DB_CRITICAL_STACK:", error.stack);
        // If we can't even reach the DB, we return a fallback string
        // but this will likely cause foreign key errors in subsequent calls
        return "guest-user-id";
    }
}
