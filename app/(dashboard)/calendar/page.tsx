"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, ListTodo, LucideIcon, Calendar as CalendarIcon, X, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, addDays, parseISO, startOfDay } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = React.useState(new Date());
    const [events, setEvents] = React.useState<any[]>([]);
    const [tasks, setTasks] = React.useState<any[]>([]);
    const [habitLogs, setHabitLogs] = React.useState<any[]>([]);
    const [incomes, setIncomes] = React.useState<any[]>([]);
    const [expenses, setExpenses] = React.useState<any[]>([]);
    const [savings, setSavings] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    // New Event State
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [newTitle, setNewTitle] = React.useState("");
    const [newDate, setNewDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
    const [newColor, setNewColor] = React.useState("#3b82f6");
    const [isSaving, setIsSaving] = React.useState(false);

    const colors = [
        { name: "Blue", value: "#3b82f6" },
        { name: "Rose", value: "#f43f5e" },
        { name: "Emerald", value: "#10b981" },
        { name: "Violet", value: "#8b5cf6" },
        { name: "Amber", value: "#f59e0b" },
        { name: "Sky", value: "#0ea5e9" },
    ];

    const fetchCalendarData = async () => {
        setIsLoading(true);
        try {
            const monthStr = format(currentMonth, "yyyy-MM");
            const res = await fetch(`/api/calendar?month=${monthStr}`);
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setEvents(data.events);
            setTasks(data.tasks);
            setHabitLogs(data.habitLogs);
            setIncomes(data.incomes || []);
            setExpenses(data.expenses || []);
            setSavings(data.savings || []);
        } catch (error) {
            toast.error("Could not load calendar data");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchCalendarData();
    }, [currentMonth]);

    const handleCreateEvent = async () => {
        if (!newTitle || !newDate) {
            toast.error("Title and date are required");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                body: JSON.stringify({
                    title: newTitle,
                    date: newDate,
                    color: newColor,
                })
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("Event created");
            setIsDialogOpen(false);
            setNewTitle("");
            fetchCalendarData();
        } catch (error) {
            toast.error("Failed to create event");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteEvent = async (id: string) => {
        try {
            const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            toast.success("Event deleted");
            fetchCalendarData();
        } catch (error) {
            toast.error("Failed to delete event");
        }
    };

    // Helper to treat ISO dates as "Floating" wall-clock time
    const parseAsFloating = (dateStr: string) => {
        if (!dateStr) return new Date();
        return new Date(dateStr.replace(/Z$/, '').split('+')[0]);
    };

    const getItemsForDay = (day: Date) => {
        const items: any[] = [];

        // 1. Habits
        habitLogs.filter(log => isSameDay(parseAsFloating(log.date), day)).forEach(log => {
            items.push({
                id: log.id,
                title: log.habit.name,
                type: "habit",
                color: log.habit.color || "#8b5cf6",
                icon: CheckCircle2
            });
        });

        // 2. Tasks
        tasks.filter(task => task.dueDate && isSameDay(parseAsFloating(task.dueDate), day)).forEach(task => {
            items.push({
                id: task.id,
                title: task.title,
                type: "task",
                color: "#f43f5e",
                icon: ListTodo
            });
        });

        // 3. Custom Events
        events.filter(event => isSameDay(parseAsFloating(event.date), day)).forEach(event => {
            items.push({
                id: event.id,
                title: event.title,
                type: "event",
                color: event.color,
                icon: CalendarIcon,
                isDeletable: true
            });
        });

        // 4. Incomes
        incomes.filter(income => isSameDay(parseAsFloating(income.date), day)).forEach(income => {
            items.push({
                id: income.id,
                title: `${income.source}: +$${income.amount}`,
                type: "income",
                color: "#10b981", // Emerald
                icon: TrendingUp
            });
        });

        // 5. Expenses
        expenses.filter(expense => isSameDay(parseAsFloating(expense.date), day)).forEach(expense => {
            items.push({
                id: expense.id,
                title: `${expense.category}: -$${expense.amount}`,
                type: "expense",
                color: "#f43f5e", // Rose
                icon: TrendingDown
            });
        });

        // 6. Savings
        savings.filter(saving => isSameDay(parseAsFloating(saving.date), day)).forEach(saving => {
            items.push({
                id: saving.id,
                title: `Saving: $${saving.amount}`,
                type: "saving",
                color: "#8b5cf6", // Violet
                icon: PiggyBank
            });
        });

        return items;
    };

    const renderHeader = () => (
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Calendar</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                    {format(currentMonth, "MMMM yyyy")} • Unified Productivity Schedule
                </p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-8 px-3 text-xs font-bold" onClick={() => setCurrentMonth(new Date())}>
                        Today
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black shadow-lg rounded-full px-4 md:px-6 transition-all hover:scale-105">
                            <Plus className="md:mr-2 h-4 w-4" />
                            <span className="hidden md:inline">New Event</span>
                            <span className="md:hidden">New</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create Event</DialogTitle>
                            <DialogDescription>Add a custom reminder or schedule to your calendar.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="grid gap-2">
                                <Label>Event Title</Label>
                                <Input placeholder="Meeting, Anniversary, etc." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Color Code</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map(c => (
                                            <button
                                                key={c.value}
                                                className={cn(
                                                    "w-6 h-6 rounded-full transition-all hover:scale-125 ring-offset-2",
                                                    newColor === c.value ? "ring-2 ring-black" : ""
                                                )}
                                                style={{ backgroundColor: c.value }}
                                                onClick={() => setNewColor(c.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateEvent} disabled={isSaving}>
                                {isSaving ? "Creating..." : "Create Event"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = [
            { full: "Sunday", short: "Sun", tiny: "S" },
            { full: "Monday", short: "Mon", tiny: "M" },
            { full: "Tuesday", short: "Tue", tiny: "T" },
            { full: "Wednesday", short: "Wed", tiny: "W" },
            { full: "Thursday", short: "Thu", tiny: "T" },
            { full: "Friday", short: "Fri", tiny: "F" },
            { full: "Saturday", short: "Sat", tiny: "S" },
        ];
        return (
            <div className="grid grid-cols-7 mb-4">
                {days.map((day) => (
                    <div key={day.full} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                        <span className="hidden md:inline">{day.short}</span>
                        <span className="md:hidden">{day.tiny}</span>
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
                const dayItems = getItemsForDay(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                days.push(
                    <div
                        key={day.toString()}
                        className={cn(
                            "min-h-[80px] md:min-h-[140px] p-1 md:p-2 border-t border-r last:border-r-0 dark:border-zinc-800 transition-all group relative",
                            !isCurrentMonth ? "bg-zinc-50/30 dark:bg-zinc-900/10 text-zinc-300 dark:text-zinc-700" : "bg-white dark:bg-zinc-900/20",
                            isToday ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                        )}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className={cn(
                                "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg transition-colors",
                                isToday ? "bg-black text-white dark:bg-white dark:text-black shadow-md" : "text-muted-foreground group-hover:text-black dark:group-hover:text-white"
                            )}>
                                {format(day, "d")}
                            </span>
                            {dayItems.length > 0 && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                    {dayItems.length}
                                </span>
                            )}
                        </div>
                        <div className="space-y-1 md:space-y-1.5 max-h-[60px] md:max-h-[90px] overflow-y-auto overflow-x-hidden no-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {dayItems.map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="group/item relative"
                                    >
                                        <div
                                            className="text-[9px] text-white px-2 py-1 rounded truncate font-bold flex items-center gap-1.5 shadow-sm transition-transform hover:scale-[1.03] cursor-pointer"
                                            style={{ backgroundColor: item.color }}
                                            title={item.title}
                                        >
                                            <item.icon className="h-2.5 w-2.5 flex-shrink-0" strokeWidth={3} />
                                            <span className="truncate">{item.title}</span>
                                            {item.isDeletable && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteEvent(item.id);
                                                    }}
                                                    className="ml-auto opacity-0 group-hover/item:opacity-100 hover:bg-black/20 rounded p-0.5 transition-opacity"
                                                >
                                                    <X className="h-2 w-2" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
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
        return <div className="border-b border-r dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl">{rows}</div>;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-8"
        >
            {renderHeader()}
            <Card className="border-none shadow-2xl overflow-hidden bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
                <CardContent className="p-0">
                    <div className="p-2 md:p-6">
                        {renderDays()}
                        {isLoading ? (
                            <div className="h-[400px] md:h-[600px] flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
                            </div>
                        ) : renderCells()}
                    </div>
                </CardContent>
            </Card>

            {/* Bottom Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Habits
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f43f5e]" /> Todos
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Custom Events
                </div>
            </div>
        </motion.div>
    );
}
