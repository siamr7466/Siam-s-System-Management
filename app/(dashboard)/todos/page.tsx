"use client";

import * as React from "react";
import { Plus, Search, Filter, MoreHorizontal, Calendar, Tag, CheckCircle2, Clock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const mockTasks = [
    { id: "1", title: "Complete design review", status: "In Progress", priority: "High", dueDate: "Today", tags: ["Design", "Work"] },
    { id: "2", title: "Prepare for board meeting", status: "Todo", priority: "High", dueDate: "Tomorrow", tags: ["Admin"] },
    { id: "3", title: "Refactor database layer", status: "Todo", priority: "Medium", dueDate: "Jan 30", tags: ["Dev"] },
    { id: "4", title: "Buy groceries", status: "Done", priority: "Low", dueDate: "Yesterday", tags: ["Personal"] },
    { id: "5", title: "Update documentation", status: "In Progress", priority: "Low", dueDate: "Jan 28", tags: ["Docs"] },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case "Done": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
        case "In Progress": return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
        default: return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400";
    }
};

const getPriorityIcon = (priority: string) => {
    switch (priority) {
        case "High": return <AlertCircle className="h-4 w-4 text-rose-500" />;
        case "Medium": return <Clock className="h-4 w-4 text-amber-500" />;
        default: return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    }
};

export default function TodosPage() {
    return (
        <div className="flex flex-col gap-y-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tasks & Todos</h2>
                    <p className="text-muted-foreground">Organize your life, one task at a time.</p>
                </div>
                <Button className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> New Task
                </Button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks..."
                        className="pl-9 bg-white dark:bg-zinc-900 border-none shadow-sm focus-visible:ring-zinc-400"
                    />
                </div>
                <Button variant="outline" className="w-full md:w-auto">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            <div className="grid gap-4">
                {mockTasks.map((task) => (
                    <Card key={task.id} className="border-none shadow-sm bg-white dark:bg-zinc-900/50 hover:shadow-md transition-all group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center p-4 gap-4">
                                <button className="h-6 w-6 rounded-full border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:border-zinc-400 transition-colors">
                                    {task.status === "Done" && <div className="h-3 w-3 rounded-full bg-zinc-400" />}
                                </button>

                                <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                                    <div className="flex-1">
                                        <h3 className={`font-semibold ${task.status === "Done" ? "line-through text-muted-foreground" : ""}`}>
                                            {task.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1 min-w-[100px]">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {task.dueDate}
                                        </div>

                                        <div className="flex items-center gap-1 min-w-[80px]">
                                            {getPriorityIcon(task.priority)}
                                            {task.priority}
                                        </div>

                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                            {task.status}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="hidden md:flex items-center gap-1">
                                        {task.tags.map(tag => (
                                            <span key={tag} className="text-[10px] uppercase tracking-wider font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-muted-foreground">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit Task</DropdownMenuItem>
                                            <DropdownMenuItem>Move to...</DropdownMenuItem>
                                            <DropdownMenuItem className="text-rose-500">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Quick Insights</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-sky-500 p-6 rounded-2xl text-white shadow-lg shadow-sky-500/20">
                        <h4 className="text-sky-100 text-sm font-medium mb-1">Focus Time</h4>
                        <p className="text-3xl font-bold">4.2h</p>
                        <p className="text-xs text-sky-200 mt-2">+15% from avg</p>
                    </div>
                    <div className="bg-violet-500 p-6 rounded-2xl text-white shadow-lg shadow-violet-500/20">
                        <h4 className="text-violet-100 text-sm font-medium mb-1">Weekly Goal</h4>
                        <p className="text-3xl font-bold">12/15</p>
                        <div className="w-full bg-white/20 h-1.5 rounded-full mt-3">
                            <div className="bg-white h-1.5 rounded-full" style={{ width: '80%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
