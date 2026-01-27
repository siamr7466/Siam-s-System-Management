import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/habits/:path*",
        "/todos/:path*",
        "/budget/:path*",
        "/calendar/:path*",
        "/files/:path*",
        "/settings/:path*",
    ],
};
