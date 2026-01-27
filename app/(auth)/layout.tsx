import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication",
    description: "Login or Register to access your productivity dashboard.",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 px-4">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}
