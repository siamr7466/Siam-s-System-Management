"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";
import { cn } from "@/lib/utils";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
    const { collapsed } = useSidebar();

    return (
        <div className="h-full relative bg-zinc-50 dark:bg-zinc-950">
            <div
                className={cn(
                    "hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 z-[80] transition-all duration-300 ease-in-out bg-[#0f0f12] text-white", // Updated bg to match image darker tone
                    collapsed ? "md:w-20" : "md:w-72"
                )}
            >
                <Sidebar />
            </div>
            <main
                className={cn(
                    "transition-all duration-300 ease-in-out h-full",
                    collapsed ? "md:pl-20" : "md:pl-72"
                )}
            >
                <Navbar />
                <div className="p-8 pt-0 h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
