"use client";

import * as React from "react";
import { format, isSameDay, startOfDay, startOfWeek, addDays } from "date-fns";
import { Plus, Trash2, TrendingUp, Zap, Calendar as CalendarIcon, Check, MoreVertical, Activity, BookOpen, GlassWater, Dumbbell, Sun } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface HabitLog {
    id: string;
    date: string;
    completed: boolean;
}

interface Habit {
    id: string;
    name: string;
    description?: string;
    frequency: string;
    color: string;
    logs: HabitLog[];
}

const ICONS: Record<string, any> = {
    "Run": Activity,
    "Walk": Activity,
    "Read": BookOpen,
    "Water": GlassWater,
    "Gym": Dumbbell,
    "Workout": Dumbbell,
    "Morning": Sun,
    "Default": Check
};

export default function HabitsPage() {
    const router = useRouter();
    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    // New Habit Form
    const [newHabitName, setNewHabitName] = React.useState("");
    const [newHabitDesc, setNewHabitDesc] = React.useState("");
    const [newHabitFreq, setNewHabitFreq] = React.useState("DAILY");
    const [newHabitColor, setNewHabitColor] = React.useState("#8b5cf6");

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [habitToDelete, setHabitToDelete] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Calculate days for the CURRENT WEEK starting on Saturday
    const days = React.useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 6 }); // 6 = Saturday
        return Array.from({ length: 7 }).map((_, i) => {
            const date = addDays(start, i);
            return {
                date,
                label: format(date, "EEE"),
                day: format(date, "d"),
                iso: startOfDay(date).toISOString(),
                isToday: isSameDay(date, new Date())
            };
        });
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await fetch("/api/habits");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            const parsedData = data.map((h: any) => ({
                ...h,
                logs: h.logs.map((l: any) => ({ ...l, date: l.date }))
            }));
            setHabits(parsedData);
        } catch (error) {
            toast.error("Could not load habits");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchHabits();
    }, []);

    const handleCreateHabit = async () => {
        if (!newHabitName) return;
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
                body: JSON.stringify({
                    name: newHabitName,
                    description: newHabitDesc,
                    frequency: newHabitFreq,
                    color: newHabitColor
                })
            });
            if (!res.ok) throw new Error("Failed to create");
            toast.success("Habit created!");
            setIsDialogOpen(false);
            setNewHabitName("");
            setNewHabitDesc("");
            fetchHabits();
        } catch (error) {
            toast.error("Failed to create habit");
        }
    };

    const handleToggle = async (habitId: string, date: Date) => {
        const targetDate = startOfDay(date).toISOString();
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;

        const currentHabit = habits[habitIndex];
        const logIndex = currentHabit.logs.findIndex(l => isSameDay(new Date(l.date), date));
        const isCompleted = logIndex !== -1;

        const newHabits = [...habits];
        if (isCompleted) {
            newHabits[habitIndex].logs.splice(logIndex, 1);
        } else {
            newHabits[habitIndex].logs.push({
                id: "temp-" + Date.now(),
                date: targetDate,
                completed: true
            });
        }
        setHabits(newHabits);

        try {
            const res = await fetch(`/api/habits/${habitId}/check`, {
                method: "POST",
                body: JSON.stringify({ date: targetDate })
            });
            if (!res.ok) {
                fetchHabits();
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Failed to update habit");
        }
    };

    const handleDelete = async (habitId: string) => {
        setHabitToDelete(habitId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!habitToDelete) return;
        setIsDeleting(true);
        try {
            await fetch(`/api/habits/${habitToDelete}`, { method: "DELETE" });
            toast.success("Habit deleted");
            setHabits(habits.filter(h => h.id !== habitToDelete));
            setIsDeleteDialogOpen(false);
            setHabitToDelete(null);
        } catch (error) {
            toast.error("Could not delete habit");
        } finally {
            setIsDeleting(false);
        }
    };

    // Stats
    const totalHabits = habits.length;
    const completedToday = habits.reduce((acc, h) => {
        const today = new Date();
        const done = h.logs.some(l => isSameDay(new Date(l.date), today));
        return acc + (done ? 1 : 0);
    }, 0);
    const overallRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const getIcon = (name: string) => {
        const key = Object.keys(ICONS).find(k => name.toLowerCase().includes(k.toLowerCase())) || "Default";
        return ICONS[key];
    };

    // Data for Pie Chart
    const pieData = [
        { name: "Completed", value: completedToday, color: "#8b5cf6" },
        { name: "Remaining", value: totalHabits - completedToday, color: "#e4e4e7" }, // zinc-200
    ];

    if (totalHabits === 0) {
        pieData[1].value = 1; // Show empty ring
    }

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
                type: "spring",
                stiffness: 100
            } as any
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 py-8 h-full overflow-hidden"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div variants={itemVariants} className="px-4 md:px-0">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Daily Routines</h2>
                    <p className="text-muted-foreground text-sm">"Your habits shape who you are."</p>
                </motion.div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-4 md:px-0">
                            <Button className="w-full md:w-auto bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 rounded-full px-6 transition-all duration-300">
                                <Plus className="mr-2 h-4 w-4" /> New Habit
                            </Button>
                        </motion.div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Habit</DialogTitle>
                            <DialogDescription>Defines a new routine you want to stick to.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Habit Name</Label>
                                <Input id="name" placeholder="e.g., Morning Meditation" value={newHabitName} onChange={(e) => setNewHabitName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description (Optional)</Label>
                                <Input id="desc" placeholder="10 minutes of mindfulness" value={newHabitDesc} onChange={(e) => setNewHabitDesc(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Frequency</Label>
                                    <Select value={newHabitFreq} onValueChange={setNewHabitFreq}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Color</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {[
                                            "#8b5cf6", // Violet
                                            "#ec4899", // Pink
                                            "#10b981", // Emerald
                                            "#f59e0b", // Amber
                                            "#3b82f6", // Blue
                                            "#ef4444", // Red
                                            "#06b6d4", // Cyan
                                            "#84cc16", // Lime
                                            "#d946ef", // Fuchsia
                                            "#f97316"  // Orange
                                        ].map((c) => (
                                            <motion.div
                                                key={c}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`w-6 h-6 rounded-full cursor-pointer ring-2 ring-offset-2 ${newHabitColor === c ? "ring-zinc-900 dark:ring-white" : "ring-transparent"}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setNewHabitColor(c)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateHabit}>Create Habit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Main Content Grid: 3 Columns on Large Screens */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 overflow-hidden min-h-0 px-4 md:px-0">

                {/* Column 1: Overall Progress & Stats */}
                <motion.div variants={itemVariants} className="flex flex-col gap-6">
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50 flex flex-col justify-between flex-1 group hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Overall Progress</CardTitle>
                                <Select defaultValue="today">
                                    <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">Weekly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-center relative min-h-[200px]">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 100, delay: 0.6 }}
                                className="h-48 w-full relative flex items-center justify-center"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            startAngle={90}
                                            endAngle={-270}
                                            stroke="none"
                                            cornerRadius={10}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <motion.div
                                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                >
                                    <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                                        {overallRate}%
                                    </span>
                                </motion.div>
                            </motion.div>
                            <p className="text-sm text-muted-foreground mt-4 text-center">
                                You're doing great! Keep it up.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 grid-cols-2">
                        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="bg-violet-500/10 border-none shadow-sm hover:bg-violet-500/20 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <TrendingUp className="h-5 w-5 text-violet-500 mb-2" />
                                    <div className="text-xl font-bold">{totalHabits}</div>
                                    <span className="text-xs text-muted-foreground">Active</span>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                            <Card className="bg-emerald-500/10 border-none shadow-sm hover:bg-emerald-500/20 transition-colors">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <Zap className="h-5 w-5 text-emerald-500 mb-2" />
                                    <div className="text-xl font-bold">{completedToday}</div>
                                    <span className="text-xs text-muted-foreground">Done</span>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Column 2: Weekly Consistency Grid */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full border-none shadow-md bg-white dark:bg-zinc-900/50 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-500">
                        <CardHeader>
                            <CardTitle>Consistency</CardTitle>
                            <CardDescription>This Week (Sat - Fri)</CardDescription>
                        </CardHeader>
                        <CardContent className="overflow-x-auto overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            <div className="min-w-[300px] space-y-4">
                                {/* Header */}
                                <div className="flex items-end justify-between mb-2 pb-2 border-b dark:border-zinc-800 gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase w-20 truncate">Habit</span>
                                    <div className="flex-1 flex justify-between">
                                        {days.map((d, i) => (
                                            <motion.div
                                                key={d.iso}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + (i * 0.1) }}
                                                className="flex flex-col items-center w-6"
                                            >
                                                <span className={cn("text-[10px] uppercase mb-1", d.isToday ? "text-violet-500 font-bold" : "text-muted-foreground")}>{d.label[0]}</span>
                                                <span className={cn("text-[10px] w-5 h-5 flex items-center justify-center rounded-full", d.isToday ? "bg-violet-500 text-white" : "text-zinc-500")}>{d.day}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <span className="w-6" />
                                </div>

                                <AnimatePresence>
                                    {habits.map((habit, index) => (
                                        <motion.div
                                            key={habit.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between gap-2 group/row hover:bg-zinc-50 dark:hover:bg-zinc-800/30 p-2 rounded-lg transition-colors"
                                        >
                                            <div className="font-medium text-sm w-20 truncate" title={habit.name}>{habit.name}</div>
                                            <div className="flex-1 flex justify-between">
                                                {days.map(d => {
                                                    const isDone = habit.logs.some(l => isSameDay(new Date(l.date), d.date));
                                                    // Check if day is in future
                                                    const isFuture = d.date > new Date();

                                                    return (
                                                        <div key={d.iso} className="flex justify-center w-6">
                                                            {!isFuture ? (
                                                                <motion.div
                                                                    whileHover={{ scale: 1.5 }}
                                                                    className={cn("w-2 h-8 rounded-full transition-all duration-300", isDone ? "opacity-100 shadow-[0_0_10px_rgba(139,92,246,0.3)]" : "opacity-20 bg-zinc-300 dark:bg-zinc-700")}
                                                                    style={{ backgroundColor: isDone ? habit.color : undefined }}
                                                                />
                                                            ) : (
                                                                <div className="w-2 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800/50 opacity-20" />
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="w-6 flex justify-center opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDelete(habit.id)}>
                                                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-red-500" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Column 3: Today's Routine List */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Card className="h-full border-none shadow-md bg-white dark:bg-zinc-900/50 flex flex-col group hover:shadow-xl transition-all duration-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle>Today</CardTitle>
                            <span className="text-sm font-medium text-violet-500 cursor-pointer hover:underline">See All</span>
                        </CardHeader>
                        <CardContent className="space-y-3 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                            {isLoading ? <div className="py-8 text-center text-muted-foreground">Loading...</div> : habits.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                    <p>No habits for today.</p>
                                </div>
                            ) : (
                                <AnimatePresence>
                                    {habits.map((habit) => {
                                        const Icon = getIcon(habit.name);
                                        const isCompleted = habit.logs.some(l => isSameDay(new Date(l.date), new Date()));
                                        return (
                                            <motion.div
                                                key={habit.id}
                                                layout
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                whileHover={{ scale: 1.02 }}
                                                className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="truncate">
                                                        <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{habit.name}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{habit.description || "Daily"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(habit.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggle(habit.id, new Date());
                                                        }}
                                                        className={cn(
                                                            "h-8 w-8 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                                                            isCompleted ? "border-transparent text-white shadow-lg" : "border-zinc-300 dark:border-zinc-600 text-transparent hover:border-violet-500"
                                                        )}
                                                        style={{
                                                            backgroundColor: isCompleted ? habit.color : "transparent",
                                                            boxShadow: isCompleted ? `0 0 10px ${habit.color}80` : "none"
                                                        }}
                                                    >
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: isCompleted ? 1 : 0 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                        >
                                                            <Check className="h-4 w-4" strokeWidth={4} />
                                                        </motion.div>
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Habit"
                description="Are you sure you want to delete this habit? All progress will be lost."
            />
        </motion.div>
    );
}
