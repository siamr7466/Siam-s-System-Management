"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CheckCircle2,
    ListTodo,
    Wallet,
    CalendarDays,
    FolderOpen,
    BookOpen,
    Settings,
    LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const routes = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
        color: "text-sky-500",
    },
    {
        label: "Habits",
        icon: CheckCircle2,
        href: "/habits",
        color: "text-violet-500",
    },
    {
        label: "Todos",
        icon: ListTodo,
        href: "/todos",
        color: "text-pink-700",
    },
    {
        label: "Budget",
        icon: Wallet,
        href: "/budget",
        color: "text-orange-700",
    },
    {
        label: "Calendar",
        icon: CalendarDays,
        href: "/calendar",
        color: "text-emerald-500",
    },
    {
        label: "Files",
        icon: FolderOpen,
        href: "/files",
        color: "text-blue-700",
    },
    {
        label: "Blog",
        icon: BookOpen,
        href: "/blog",
        color: "text-green-700",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder */}
                        <div className="absolute bg-white rounded-full w-full h-full flex items-center justify-center font-bold text-black border-2 border-primary">
                            S
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">
                        Siam&apos;s App
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="px-3 py-2">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
