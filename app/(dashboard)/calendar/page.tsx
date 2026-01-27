"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, ListTodo, LucideIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, addDays, parseISO, startOfDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Mock Data representing "Deep Sync" with other modules
const mockTasks = [
    { id: "1", title: "Complete design review", dueDate: new Date() }, // Today
    { id: "2", title: "Board meeting prep", dueDate: addDays(new Date(), 1) }, // Tomorrow
    { id: "3", title: "Refactor DB layer", dueDate: addDays(new Date(), 3) },
    { id: "5", title: "Update Docs", dueDate: addDays(new Date(), -2) },
];

const mockHabits = [
    { id: "h1", name: "Morning Meditation", frequency: "Daily" },
    { id: "h2", name: "Gym", frequency: "Daily" },
];

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    interface CalendarEvent {
        id: string;
        title: string;
        type: "task" | "habit";
        color: string;
        icon: LucideIcon;
    }

    // Function to generate events for a specific day based on Tasks and Habits
    const getEventsForDay = (day: Date) => {
        const events: CalendarEvent[] = [];

        // 1. Sync Tasks (Todos)
        const dayTasks = mockTasks.filter(task => isSameDay(task.dueDate, day));
        dayTasks.forEach(task => {
            events.push({
                id: task.id,
                title: task.title,
                type: "task",
                color: "bg-pink-500",
                icon: ListTodo
            });
        });

        // 2. Sync Habits (Simulated Daily)
        // Only show habits for current month views to keep it clean, or maybe just today/future?
        // Let's show habits for "Today" specifically to avoid cluttering the entire month with repeated text
        if (isSameDay(day, new Date())) {
            mockHabits.forEach(habit => {
                events.push({
                    id: habit.id,
                    title: habit.name,
                    type: "habit",
                    color: "bg-violet-500",
                    icon: CheckCircle2
                });
            });
        }

        return events;
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{format(currentMonth, "MMMM yyyy")}</h2>
                <p className="text-muted-foreground">Unified view of your tasks, habits, and schedule.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4 text-xs font-medium">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-pink-500" /> Task</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-500" /> Habit</div>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <Button className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
                    <Plus className="mr-2 h-4 w-4" /> New Event
                </Button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day) => (
                    <div key={day} className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const events = getEventsForDay(day);

                days.push(
                    <div
                        key={day.toString()}
                        className={`min-h-[120px] p-2 border-t border-r last:border-r-0 dark:border-zinc-800 transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 ${!isSameMonth(day, monthStart) ? "bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-300 dark:text-zinc-600" : ""
                            } ${isSameDay(day, new Date()) ? "bg-zinc-50 dark:bg-zinc-900/50" : ""}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? "bg-black text-white dark:bg-white dark:text-black" : ""
                                }`}>
                                {format(day, "d")}
                            </span>
                            {events.length > 0 && (
                                <span className="text-[10px] text-muted-foreground font-medium">{events.length} items</span>
                            )}
                        </div>
                        <div className="space-y-1">
                            {events.map((event, idx) => (
                                <div key={idx} className={`${event.color} text-[10px] text-white px-1.5 py-1 rounded truncate font-medium flex items-center gap-1 shadow-sm`}>
                                    <event.icon className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{event.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 border-l dark:border-zinc-800" key={day.toString()}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-b border-r dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">{rows}</div>;
    };

    return (
        <div className="py-8">
            {renderHeader()}
            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900/50">
                <CardContent className="p-6">
                    {renderDays()}
                    {renderCells()}
                </CardContent>
            </Card>
        </div>
    );
}
