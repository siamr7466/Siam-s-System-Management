"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    CheckCircle2,
    ListTodo,
    Wallet,
    CalendarDays,
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
        color: "text-pink-500",
    },
    {
        label: "Budget",
        icon: Wallet,
        href: "/budget",
        color: "text-amber-500",
    },
    {
        label: "Calendar",
        icon: CalendarDays,
        href: "/calendar",
        color: "text-emerald-500",
    },
    {
        label: "Blog",
        icon: BookOpen,
        href: "/blog",
        color: "text-green-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-zinc-400"
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-6 flex flex-col h-full bg-zinc-950 text-white border-r border-white/10">
            <div className="px-4 flex-1">
                <Link href="/dashboard" className="flex items-center pl-3 mb-12 group cursor-pointer">
                    <div className="relative w-9 h-9 mr-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                        <div className="absolute bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl w-full h-full flex items-center justify-center font-extrabold text-white shadow-lg shadow-violet-500/20">
                            S
                        </div>
                    </div>
                    <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                        Siam's App
                    </h1>
                </Link>
                <div className="space-y-2">
                    {routes.map((route) => {
                        const isActive = pathname === route.href;
                        
                        return (
                            <Link href={route.href} key={route.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        "relative flex items-center p-3 w-full font-semibold rounded-xl transition-all duration-300 group cursor-pointer",
                                        isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-nav"
                                            className="absolute inset-0 bg-white/10 rounded-xl"
                                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                    <div className="relative flex items-center">
                                        <route.icon className={cn(
                                            "h-5 w-5 mr-4 transition-all duration-300", 
                                            route.color,
                                            isActive ? "scale-110" : "opacity-80 group-hover:scale-110 group-hover:opacity-100"
                                        )} />
                                        {route.label}
                                    </div>
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="px-4 py-4 mt-auto border-t border-white/10">
                <Button
                    onClick={() => signOut()}
                    variant="ghost"
                    className="w-full justify-start text-zinc-400 hover:text-white hover:bg-white/10 font-semibold rounded-xl transition-all duration-300 h-12"
                >
                    <LogOut className="h-5 w-5 mr-4 text-rose-500" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
