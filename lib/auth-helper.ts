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
            // Create a default user for production if DB is empty
            firstUser = await prisma.user.create({
                data: {
                    email: "siamrahman7466@gmail.com",
                    name: "Siam Rahman",
                }
            });
        }

        return firstUser.id;
    } catch (error) {
        console.error("Failed to fetch or create fallback user:", error);
        return "guest-user-id";
    }
}
