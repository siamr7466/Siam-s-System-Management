import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getUserId() {
    try {
        const session = await getServerSession(authOptions);
        if (session?.user?.id) {
            return session.user.id;
        }
    } catch (error) {
        console.error("Session error:", error);
    }

    // Fallback: If no session, return a default user ID or just handle it as guest.
    // In "no-auth" mode, we'll return a constant ID or fetch the first user from the DB.
    // For now, let's return a placeholder that matches the first user in the system if exists.
    return "guest-user-id";
}
