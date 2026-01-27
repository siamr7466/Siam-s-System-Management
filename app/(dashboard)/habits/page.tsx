"use client";

import * as React from "react";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { Plus, Trash2, TrendingUp, Zap, Calendar as CalendarIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

export default function HabitsPage() {
    const router = useRouter();
    const [habits, setHabits] = React.useState<Habit[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    // New Habit Form
    const [newHabitName, setNewHabitName] = React.useState("");
    const [newHabitDesc, setNewHabitDesc] = React.useState("");
    const [newHabitFreq, setNewHabitFreq] = React.useState("DAILY");
    const [newHabitColor, setNewHabitColor] = React.useState("#8b5cf6"); // Default Purple

    // Generate last 7 days for the grid
    const days = React.useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(new Date(), 6 - i);
            return {
                date,
                label: format(date, "EEE"), // Mon
                day: format(date, "d"),     // 12
                iso: startOfDay(date).toISOString()
            };
        });
    }, []);

    // Fetch Habits
    const fetchHabits = async () => {
        try {
            const res = await fetch("/api/habits");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            // Parse dates in logs
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

    // Create Habit
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
            fetchHabits(); // Reload
        } catch (error) {
            toast.error("Failed to create habit");
        }
    };

    // Toggle Check-in
    const handleToggle = async (habitId: string, date: Date) => {
        // Optimistic Update
        const targetDate = startOfDay(date).toISOString();
        const habitIndex = habits.findIndex(h => h.id === habitId);
        if (habitIndex === -1) return;

        const currentHabit = habits[habitIndex];
        const logIndex = currentHabit.logs.findIndex(l => isSameDay(new Date(l.date), date));
        const isCompleted = logIndex !== -1;

        const newHabits = [...habits];
        if (isCompleted) {
            // Remove log
            newHabits[habitIndex].logs.splice(logIndex, 1);
        } else {
            // Add fake log
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
                // Revert on error
                fetchHabits();
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Failed to update habit");
        }
    };

    // Delete Habit
    const handleDelete = async (habitId: string) => {
        if (!confirm("Are you sure you want to delete this habit?")) return;
        try {
            await fetch(`/api/habits/${habitId}`, { method: "DELETE" });
            toast.success("Habit deleted");
            setHabits(habits.filter(h => h.id !== habitId));
        } catch (error) {
            toast.error("Could not delete habit");
        }
    };

    // Calculate Stats
    const totalHabits = habits.length;
    const completedToday = habits.reduce((acc, h) => {
        const today = new Date();
        const done = h.logs.some(l => isSameDay(new Date(l.date), today));
        return acc + (done ? 1 : 0);
    }, 0);
    const overallRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return (
        <div className="flex flex-col gap-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Habit Tracker</h2>
                    <p className="text-muted-foreground">Build consistency, one day at a time.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-violet-600 hover:bg-violet-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Habit
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Habit</DialogTitle>
                            <DialogDescription>
                                Defines a new routine you want to stick to.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Habit Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Morning Meditation"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description (Optional)</Label>
                                <Input
                                    id="desc"
                                    placeholder="10 minutes of mindfulness"
                                    value={newHabitDesc}
                                    onChange={(e) => setNewHabitDesc(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Frequency</Label>
                                    <Select value={newHabitFreq} onValueChange={setNewHabitFreq}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Color</Label>
                                    <div className="flex gap-2 mt-2">
                                        {["#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#3b82f6"].map((c) => (
                                            <div
                                                key={c}
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

            {/* Stats Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-200/50 dark:border-violet-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Active Habits</CardTitle>
                        <TrendingUp className="h-4 w-4 text-violet-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalHabits}</div>
                        <p className="text-xs text-muted-foreground">Tracking {totalHabits} routines</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200/50 dark:border-emerald-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today's Completion</CardTitle>
                        <Zap className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallRate}%</div>
                        <p className="text-xs text-muted-foreground">{completedToday} of {totalHabits} completed</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-200/50 dark:border-amber-900/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Day</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{format(new Date(), "dd MMM")}</div>
                        <p className="text-xs text-muted-foreground">{format(new Date(), "EEEE")}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Habits Grid */}
            <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50 min-h-[500px]">
                <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>Click on a box to toggle completion.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40 text-muted-foreground">Loading habits...</div>
                    ) : habits.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-60 text-center">
                            <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                                <Zap className="h-8 w-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-semibold">No habits yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-2">Start by creating your first habit using the "New Habit" button above.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Header Row */}
                            <div className="grid grid-cols-[1fr,repeat(7,minmax(40px,1fr)),40px] gap-2 md:gap-4 items-end mb-2 border-b pb-4 dark:border-zinc-800">
                                <div className="font-semibold text-muted-foreground text-sm uppercase tracking-wider pl-2">Habit</div>
                                {days.map((day) => (
                                    <div key={day.iso} className="flex flex-col items-center text-center">
                                        <span className="text-[10px] uppercase text-muted-foreground font-bold">{day.label}</span>
                                        <span className={`text-sm font-bold mt-1 h-8 w-8 flex items-center justify-center rounded-full ${isSameDay(day.date, new Date()) ? "bg-black text-white dark:bg-white dark:text-black" : ""
                                            }`}>
                                            {day.day}
                                        </span>
                                    </div>
                                ))}
                                <div className="w-10"></div>
                            </div>

                            {/* Habit Rows */}
                            {habits.map((habit) => (
                                <div key={habit.id} className="grid grid-cols-[1fr,repeat(7,minmax(40px,1fr)),40px] gap-2 md:gap-4 items-center group">
                                    <div className="pl-2">
                                        <div className="font-semibold text-base">{habit.name}</div>
                                        {habit.description && <div className="text-xs text-muted-foreground">{habit.description}</div>}
                                    </div>

                                    {days.map((day) => {
                                        const isCompleted = habit.logs.some(log => isSameDay(new Date(log.date), day.date));
                                        return (
                                            <button
                                                key={day.iso}
                                                onClick={() => handleToggle(habit.id, day.date)}
                                                className={`
                                                    h-10 w-full md:h-12 md:w-full rounded-xl transition-all duration-300 flex items-center justify-center
                                                    ${isCompleted
                                                        ? "opacity-100 shadow-sm scale-100"
                                                        : "bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-800 opacity-50 hover:opacity-100"
                                                    }
                                                `}
                                                style={{
                                                    backgroundColor: isCompleted ? habit.color : undefined,
                                                    color: isCompleted ? "white" : undefined
                                                }}
                                            >
                                                {isCompleted && <Check className="h-5 w-5 md:h-6 md:w-6 animate-in zoom-in-50 duration-200" strokeWidth={3} />}
                                            </button>
                                        );
                                    })}

                                    <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-rose-500"
                                            onClick={() => handleDelete(habit.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
