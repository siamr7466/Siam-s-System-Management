"use client";
import { useSession } from "next-auth/react";

import * as React from "react";
import { motion } from "framer-motion";

import {
    CheckCircle2,
    ListTodo,
    TrendingUp,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    LucideIcon
} from "lucide-react";
import {
    Area,
    AreaChart,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    trend?: "up" | "down";
    trendValue?: string;
    color: string;
}

function StatCard({ title, value, description, icon: Icon, trend, trendValue, color }: StatCardProps) {
    return (
        <Card className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent pointer-events-none" />
            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between">
                    <div className={`${color} p-3 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/80 group-hover:scale-110 group-hover:rotate-3 shadow-sm transition-all duration-500 ease-out`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === "up" ? "text-emerald-600 bg-emerald-100/50 dark:bg-emerald-500/10" : "text-rose-600 bg-rose-100/50 dark:bg-rose-500/10"}`}>
                            {trend === "up" ? <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" /> : <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div className="mt-5">
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
                    <h3 className="text-3xl font-extrabold tracking-tight mt-1 text-zinc-900 dark:text-zinc-50">{value}</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: {
        name: string;
        value: number;
        stroke?: string;
        fill?: string;
        color?: string;
    }[];
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800/50 p-4 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
                <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold mb-3 uppercase tracking-wider">{label} Performance</p>
                <div className="space-y-2.5">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-8 text-sm group">
                            <div className="flex items-center gap-2.5">
                                <div className="w-2.5 h-2.5 rounded-full ring-4 ring-transparent group-hover:ring-zinc-200 dark:group-hover:ring-white/10 transition-all shadow-inner" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                <span className={entry.name === "Overall Score" ? "text-zinc-900 dark:text-white font-extrabold" : "text-zinc-600 dark:text-zinc-300 font-medium"}>
                                    {entry.name}
                                </span>
                            </div>
                            <span className={`font-mono font-bold ${entry.name === "Overall Score" ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400"}`}>
                                {entry.value}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return null;
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
} as const;

export default function DashboardPage() {
    const { data: session } = useSession();
    const firstName = session?.user?.name?.split(" ")[0] || "Siam";

    const [data, setData] = React.useState<any[]>([]);
    const [todoData, setTodoData] = React.useState<any[]>([]);
    const [budgetData, setBudgetData] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState<any>({});
    const [topHabits, setTopHabits] = React.useState<any[]>([]);
    const [upcomingTasks, setUpcomingTasks] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("/api/dashboard");
                if (res.ok) {
                    const json = await res.json();
                    setData(json.habitData);
                    setTodoData(json.todoData);
                    setBudgetData(json.budgetData);
                    setStats(json.stats);
                    setTopHabits(json.topHabits);
                    setUpcomingTasks(json.upcomingTasks || []);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={cn(
                "flex flex-col gap-y-8 py-8",
                isLoading && "opacity-50 pointer-events-none transition-opacity duration-500"
            )}>
            <motion.div variants={itemVariants} className="px-4 md:px-0">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400">
                    Welcome back, {firstName}!
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base mt-2 font-medium">
                    Here's what's happening with your productivity today.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 px-4 md:px-0">
                <StatCard
                    title="Habit Completion"
                    value={stats.habitCompletion || "0%"}
                    description="Today's goal rate"
                    icon={CheckCircle2}
                    trend="up"
                    trendValue="Optimal"
                    color="text-violet-600 dark:text-violet-400"
                />
                <StatCard
                    title="Pending Tasks"
                    value={`${stats.pendingTasks || 0}`}
                    description="Active items"
                    icon={ListTodo}
                    trend="down"
                    trendValue="Clear"
                    color="text-pink-600 dark:text-pink-400"
                />
                <StatCard
                    title="Monthly Savings"
                    value={`৳${(stats.monthlySavings || 0).toLocaleString()}`}
                    description="Net income this month"
                    icon={TrendingUp}
                    trend="up"
                    trendValue="Growth"
                    color="text-emerald-600 dark:text-emerald-400"
                />
                <StatCard
                    title="Focus Score"
                    value={`${stats.focusScore || 0}`}
                    description="Productivity Index"
                    icon={Zap}
                    trend="up"
                    trendValue="High"
                    color="text-amber-600 dark:text-amber-400"
                />
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-7 px-4 md:px-0">
                <Card className="col-span-full lg:col-span-4 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-500">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Live Habit Persistence</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            Real-time consistency tracking across all disciplines.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 pb-6">
                        <div className="h-[350px] w-full min-h-0 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#888" opacity={0.15} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        fontWeight={500}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        dx={-15}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                                        itemStyle={{ color: "#a78bfa" }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '25px', fontSize: '12px', fontWeight: 600 }} />

                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Overall Score"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        animationDuration={2000}
                                        animationEasing="ease-out"
                                    />
                                    {topHabits.map((habit: any, index: number) => (
                                        <Line
                                            key={habit.key}
                                            type="monotone"
                                            dataKey={habit.key}
                                            name={habit.name}
                                            stroke={["#3b82f6", "#10b981", "#f43f5e"][index % 3]}
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 6, strokeWidth: 0, fill: ["#3b82f6", "#10b981", "#f43f5e"][index % 3] }}
                                            strokeOpacity={0.9}
                                            animationDuration={2000}
                                            animationEasing="ease-out"
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-full lg:col-span-3 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-500 flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Upcoming Tasks</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            You have {stats.pendingTasks || 0} tasks pending.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4">
                            {upcomingTasks.slice(0, 5).map((task: any, idx: number) => (
                                <motion.div 
                                    key={task.id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.4 }}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 hover:shadow-md transition-all duration-300 group cursor-pointer"
                                >
                                    <div className={cn(
                                        "w-3 h-3 rounded-full shadow-sm",
                                        task.priority === "HIGH" ? "bg-rose-500 shadow-rose-500/30" :
                                            task.priority === "MEDIUM" ? "bg-amber-500 shadow-amber-500/30" : "bg-emerald-500 shadow-emerald-500/30"
                                    )} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate text-zinc-800 dark:text-zinc-200 group-hover:text-primary transition-colors">{task.title}</p>
                                        <p className="text-[10px] sm:text-xs text-zinc-500 font-medium uppercase tracking-wider mt-0.5">{task.status.replace('_', ' ')}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-6 rounded-full px-3 font-bold bg-white dark:bg-zinc-900 shadow-sm border-zinc-200 dark:border-zinc-800 group-hover:bg-primary/5 transition-colors">
                                        {task.priority}
                                    </Badge>
                                </motion.div>
                            ))}
                            {upcomingTasks.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center h-full min-h-[250px] text-zinc-400 dark:text-zinc-600"
                                >
                                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-full mb-4 opacity-50">
                                        <ListTodo className="h-8 w-8" />
                                    </div>
                                    <p className="text-sm font-medium">No pending tasks. You're all caught up!</p>
                                </motion.div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2 mt-2 px-4 md:px-0">
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-500">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Todo Completion Rate</CardTitle>
                        <CardDescription className="text-zinc-500 font-medium">
                            Weekly task efficiency analysis (0-100%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 pb-6">
                        <div className="h-[300px] w-full min-h-0 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <AreaChart data={todoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTodo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#888" opacity={0.15} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} dy={15} />
                                    <YAxis stroke="#888888" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-15} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '6 6', opacity: 0.5 }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '25px', fontSize: '12px', fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="rate" name="Completion Rate" stroke="#ec4899" strokeWidth={4} fillOpacity={1} fill="url(#colorTodo)" animationDuration={2000} animationEasing="ease-out" />
                                    <Line type="monotone" dataKey="high" name="High Priority" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#f43f5e" }} strokeOpacity={0.9} animationDuration={2000} animationEasing="ease-out" />
                                    <Line type="monotone" dataKey="medium" name="Medium Priority" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#f59e0b" }} strokeOpacity={0.9} animationDuration={2000} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl transition-all duration-500">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Budget Analytics</CardTitle>
                            <CardDescription className="text-zinc-500 font-medium">
                                Daily income vs expense tracking.
                            </CardDescription>
                        </div>
                        <Select
                            defaultValue="week"
                            onValueChange={async (v: string) => {
                                const res = await fetch(`/api/dashboard?range=${v}`);
                                const json = await res.json();
                                setBudgetData(json.budgetData);
                            }}
                        >
                            <SelectTrigger className="w-[120px] h-9 text-xs font-semibold rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                                <SelectValue placeholder="Range" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl font-medium">
                                <SelectItem value="day" className="rounded-lg">Past 24h</SelectItem>
                                <SelectItem value="week" className="rounded-lg">Past Week</SelectItem>
                                <SelectItem value="month" className="rounded-lg">Past Month</SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="pl-0 pb-6 pt-4">
                        <div className="h-[300px] w-full min-h-0 min-w-0">
                            <ResponsiveContainer width="100%" height="100%" minHeight={1} minWidth={1}>
                                <AreaChart data={budgetData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#888" opacity={0.15} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} dy={15} />
                                    <YAxis stroke="#888888" fontSize={12} fontWeight={500} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} dx={-15} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '6 6', opacity: 0.5 }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '25px', fontSize: '12px', fontWeight: 600 }} />
                                    <Area type="monotone" dataKey="saved" name="Net Savings" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorBudget)" animationDuration={2000} animationEasing="ease-out" />
                                    <Line type="monotone" dataKey="income" name="Income" stroke="#34d399" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#34d399" }} strokeOpacity={0.9} animationDuration={2000} animationEasing="ease-out" />
                                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2.5} dot={false} activeDot={{ r: 6, strokeWidth: 0, fill: "#f43f5e" }} strokeOpacity={0.9} animationDuration={2000} animationEasing="ease-out" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}

