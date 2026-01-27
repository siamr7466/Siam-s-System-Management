"use client";

import { useSession } from "next-auth/react";
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

// Enhanced Mock Data with individual track habits
const data = [
    { name: "Mon", total: 65, coding: 70, fitness: 60, reading: 50 },
    { name: "Tue", total: 78, coding: 85, fitness: 65, reading: 80 },
    { name: "Wed", total: 95, coding: 90, fitness: 95, reading: 100 },
    { name: "Thu", total: 85, coding: 80, fitness: 85, reading: 90 },
    { name: "Fri", total: 92, coding: 95, fitness: 90, reading: 85 },
    { name: "Sat", total: 88, coding: 100, fitness: 80, reading: 70 },
    { name: "Sun", total: 96, coding: 98, fitness: 95, reading: 92 },
];

const todoData = [
    { name: "Mon", rate: 50, high: 40, medium: 70 },
    { name: "Tue", rate: 65, high: 55, medium: 75 },
    { name: "Wed", rate: 80, high: 70, medium: 85 },
    { name: "Thu", rate: 75, high: 60, medium: 80 },
    { name: "Fri", rate: 90, high: 85, medium: 95 },
    { name: "Sat", rate: 85, high: 90, medium: 80 },
    { name: "Sun", rate: 60, high: 50, medium: 70 },
];

const budgetData = [
    { name: "Mon", saved: 500, income: 2000, expense: 1500 },
    { name: "Tue", saved: 800, income: 2200, expense: 1400 },
    { name: "Wed", saved: 1200, income: 2500, expense: 1300 },
    { name: "Thu", saved: 400, income: 1800, expense: 1400 },
    { name: "Fri", saved: 1500, income: 3000, expense: 1500 },
    { name: "Sat", saved: 200, income: 1500, expense: 1300 },
    { name: "Sun", saved: 1000, income: 2000, expense: 1000 },
];

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
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-zinc-900/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className={`${color} p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend && (
                        <div className={`flex items-center text-xs font-medium ${trend === "up" ? "text-emerald-500" : "text-rose-500"}`}>
                            {trend === "up" ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                            {trendValue}
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
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
            <div className="bg-zinc-950/90 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                <p className="text-zinc-400 text-xs font-semibold mb-3 uppercase tracking-wider">{label} Performance</p>
                <div className="space-y-2">
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-8 text-sm group">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full ring-2 ring-transparent group-hover:ring-white/20 transition-all" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                <span className={entry.name === "Overall Score" ? "text-white font-bold" : "text-zinc-300"}>
                                    {entry.name}
                                </span>
                            </div>
                            <span className={`font-mono font-bold ${entry.name === "Overall Score" ? "text-white" : "text-zinc-400"}`}>
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

export default function DashboardPage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col gap-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">
                    Welcome back, {session?.user?.name?.split(" ")[0] || "User"}!
                </h2>
                <p className="text-muted-foreground">
                    Here&apos;s what&apos;s happening with your productivity today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Habit Completion"
                    value="88%"
                    description="+12% from yesterday"
                    icon={CheckCircle2}
                    trend="up"
                    trendValue="4%"
                    color="text-violet-500"
                />
                <StatCard
                    title="Pending Tasks"
                    value="12"
                    description="4 due today"
                    icon={ListTodo}
                    trend="down"
                    trendValue="2"
                    color="text-pink-500"
                />
                <StatCard
                    title="Monthly Savings"
                    value="৳2,450"
                    description="+18% from last month"
                    icon={TrendingUp}
                    trend="up"
                    trendValue="৳450"
                    color="text-emerald-500"
                />
                <StatCard
                    title="Focus Score"
                    value="92"
                    description="Top 5% this week"
                    icon={Zap}
                    trend="up"
                    trendValue="7"
                    color="text-amber-500"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Live Habit Persistence</CardTitle>
                        <CardDescription>
                            Real-time consistency tracking across all disciplines.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}%`}
                                        dx={-10}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />

                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        name="Overall Score"
                                        stroke="#8b5cf6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        animationDuration={1500}
                                        animationEasing="ease-in-out"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="coding"
                                        name="Coding"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        strokeOpacity={0.7}
                                        animationDuration={1500}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="fitness"
                                        name="Fitness"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        strokeOpacity={0.7}
                                        animationDuration={1500}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="reading"
                                        name="Reading"
                                        stroke="#f43f5e"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        strokeOpacity={0.7}
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Upcoming Tasks</CardTitle>
                        <CardDescription>
                            You have {4} tasks due in the next 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {[
                                { title: "Design System Update", time: "2h remaining", priority: "High" },
                                { title: "Review Budget Sheet", time: "5h remaining", priority: "Medium" },
                                { title: "Read 20 pages", time: "8h remaining", priority: "Low" },
                                { title: "Client Meeting", time: "Tomorrow", priority: "High" },
                            ].map((task, i) => (
                                <div key={i} className="flex items-center group">
                                    <div className="space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none group-hover:text-violet-500 transition-colors">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">{task.time}</p>
                                    </div>
                                    <div className={`text-xs px-2 py-1 rounded-full font-semibold ${task.priority === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" :
                                        task.priority === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        }`}>
                                        {task.priority}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Todo Completion Rate</CardTitle>
                        <CardDescription>
                            Weekly task efficiency analysis (0-100%).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={todoData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTodo" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ec4899', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="rate" name="Completion Rate" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorTodo)" animationDuration={1500} />
                                    <Line type="monotone" dataKey="high" name="High Priority" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} strokeOpacity={0.7} animationDuration={1500} />
                                    <Line type="monotone" dataKey="medium" name="Medium Priority" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} strokeOpacity={0.7} animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Budget Analytics</CardTitle>
                        <CardDescription>
                            Daily income vs expense tracking.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={budgetData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorBudget" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} dx={-10} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                    <Area type="monotone" dataKey="saved" name="Net Savings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBudget)" animationDuration={1500} />
                                    <Line type="monotone" dataKey="income" name="Income" stroke="#34d399" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} strokeOpacity={0.7} animationDuration={1500} />
                                    <Line type="monotone" dataKey="expense" name="Expense" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} strokeOpacity={0.7} animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
