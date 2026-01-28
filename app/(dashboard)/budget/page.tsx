"use client";

import * as React from "react";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, Filter, Download, Trash2, PiggyBank } from "lucide-react";
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    Bar,
    BarChart,
    Cell
} from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Transaction {
    id: string;
    type: "income" | "expense" | "saving";
    amount: number;
    category: string;
    description?: string;
    date: string;
    title?: string;
}

export default function BudgetPage() {
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    // Form State
    const [type, setType] = React.useState<"income" | "expense" | "saving">("expense");
    const [amount, setAmount] = React.useState("");
    const [category, setCategory] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [transactionToDelete, setTransactionToDelete] = React.useState<{ id: string, type: string } | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch("/api/finance");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setTransactions(data);
        } catch (error) {
            toast.error("Could not load financial data");
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleAddTransaction = async () => {
        if (!amount || !category) {
            toast.error("Amount and Category are required");
            return;
        }

        try {
            const res = await fetch("/api/finance", {
                method: "POST",
                body: JSON.stringify({
                    type,
                    amount,
                    category,
                    description,
                    date
                })
            });

            if (!res.ok) throw new Error("Failed to create");

            toast.success("Transaction added");
            setIsDialogOpen(false);
            setAmount("");
            setCategory("");
            setDescription("");
            fetchData();
        } catch (error) {
            toast.error("Failed to save transaction");
        }
    };

    const handleDelete = async (id: string, type: string) => {
        setTransactionToDelete({ id, type });
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/finance/${transactionToDelete.id}?type=${transactionToDelete.type}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");

            setTransactions(prev => prev.filter(t => t.id !== transactionToDelete.id));
            toast.success("Transaction deleted");
            setIsDeleteDialogOpen(false);
            setTransactionToDelete(null);
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setIsDeleting(true);
        }
    };

    // Derived State
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSavings = transactions
        .filter(t => t.type === 'saving')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpense;

    // Chart Data: Financial Trend (Income, Expense, Savings, Balance)
    const sortedTransactions = [...transactions]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningIncome = 0;
    let runningExpense = 0;
    let runningSavings = 0;

    // We want daily data points. Group by date first or just iterate?
    // Iterating and pushing daily snapshots is safer for cumulative lines.
    const trendMap = new Map<string, { income: number, expense: number, savings: number }>();

    sortedTransactions.forEach(t => {
        const d = format(new Date(t.date), "MMM d");
        const current = trendMap.get(d) || { income: 0, expense: 0, savings: 0 };

        if (t.type === 'income') current.income += t.amount;
        else if (t.type === 'expense') current.expense += t.amount;
        else if (t.type === 'saving') current.savings += t.amount;

        trendMap.set(d, current);
    });

    const trendData: any[] = [];

    // Re-iterate chronologically to build cumulative
    // Need sorted keys
    const sortedDates = Array.from(trendMap.keys()).sort((a, b) => {
        // This sort works if dates are formatted roughly, but safer to use original dates.
        // Let's rely on sortedTransactions order to assume keys are roughly added in order, 
        // OR better: just iterate the sorted transactions and build cumulative snapshot per day.
        return 0;
    });

    // Simpler approach: Map date -> Daily Delta. Then distinct dates sorted. Then cumulative.
    const dailyDeltas = sortedTransactions.reduce((acc, t) => {
        const dateKey = format(new Date(t.date), 'yyyy-MM-dd'); // sorting safe format
        if (!acc[dateKey]) acc[dateKey] = { income: 0, expense: 0, savings: 0, dateStr: t.date };

        if (t.type === 'income') acc[dateKey].income += t.amount;
        else if (t.type === 'expense') acc[dateKey].expense += t.amount;
        else if (t.type === 'saving') acc[dateKey].savings += t.amount;

        return acc;
    }, {} as Record<string, { income: number, expense: number, savings: number, dateStr: string }>);

    const sortedDailyKeys = Object.keys(dailyDeltas).sort();

    runningIncome = 0;
    runningExpense = 0;
    runningSavings = 0;

    const finalTrendData = sortedDailyKeys.map(key => {
        const day = dailyDeltas[key];
        runningIncome += day.income;
        runningExpense += day.expense;
        runningSavings += day.savings;

        return {
            date: format(new Date(day.dateStr), "MMM d"),
            income: runningIncome,
            expense: runningExpense,
            savings: runningSavings,
            balance: runningIncome - runningExpense // Net result
        };
    });

    if (finalTrendData.length === 0) {
        finalTrendData.push({ date: format(new Date(), "MMM d"), income: 0, expense: 0, savings: 0, balance: 0 });
    }

    // Daily Deltas for "Live Graph"
    const dailyData = sortedDailyKeys.map(key => {
        const day = dailyDeltas[key];
        return {
            date: format(new Date(day.dateStr), "MMM d"),
            income: day.income,
            expense: day.expense,
            savings: day.savings,
            net: day.income - day.expense
        };
    });

    if (dailyData.length === 0) {
        dailyData.push({ date: format(new Date(), "MMM d"), income: 0, expense: 0, savings: 0, net: 0 });
    }

    // Chart Data: Expenses by Category
    const expensesByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);

    const categoryData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value,
        percentage: totalIncome > 0 ? (value / totalIncome) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    return (
        <div className="flex flex-col gap-y-8 py-8 px-2 md:px-0">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Financial Overview</h2>
                    <p className="text-muted-foreground text-sm">Monitor your wealth, expenses, and savings in real-time.</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
                                <Plus className="mr-2 h-4 w-4" /> Add Transaction
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Transaction</DialogTitle>
                                <DialogDescription>Record a new income, expense, or savings contribution.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Type</Label>
                                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="income">Income</SelectItem>
                                                <SelectItem value="expense">Expense</SelectItem>
                                                <SelectItem value="saving">Savings</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Amount</Label>
                                        <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>{type === 'income' ? 'Source' : type === 'saving' ? 'Goal / Purpose' : 'Category'}</Label>
                                    <Input
                                        placeholder={
                                            type === 'income' ? "e.g., Salary, Freelance" :
                                                type === 'saving' ? "e.g., Emergency Fund, New Car" :
                                                    "e.g., Food, Rent, Utils"
                                        }
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Date</Label>
                                    <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Description (Optional)</Label>
                                    <Input placeholder="Details..." value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddTransaction}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium text-muted-foreground flex items-center">
                                    <Wallet className="h-4 w-4 mr-2" /> Current Balance
                                </p>
                            </div>
                            <div className="text-3xl font-bold">
                                ৳{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="border-none shadow-md bg-emerald-50 dark:bg-emerald-900/20 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-emerald-700 dark:text-emerald-400">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium flex items-center">
                                    <ArrowUpCircle className="h-4 w-4 mr-2" /> Total Income
                                </p>
                            </div>
                            <div className="text-3xl font-bold">
                                ৳{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="border-none shadow-md bg-rose-50 dark:bg-rose-900/20 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-rose-700 dark:text-rose-400">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium flex items-center">
                                    <ArrowDownCircle className="h-4 w-4 mr-2" /> Total Expenses
                                </p>
                            </div>
                            <div className="text-3xl font-bold">
                                ৳{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <Card className="border-none shadow-md bg-violet-50 dark:bg-violet-900/20 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6 text-violet-700 dark:text-violet-400">
                            <div className="flex items-center justify-between space-y-0 pb-2">
                                <p className="text-sm font-medium flex items-center">
                                    <PiggyBank className="h-4 w-4 mr-2" /> Total Savings
                                </p>
                            </div>
                            <div className="text-3xl font-bold">
                                ৳{totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid gap-4 lg:grid-cols-7"
            >
                <Card className="lg:col-span-4 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Daily Financial Track</CardTitle>
                        <CardDescription>Daily breakdown of income and expenditures.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        stroke="#888"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        stroke="#888"
                                        tickFormatter={(value) => `৳${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "8px", color: "#fff" }}
                                    />
                                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                                    <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Expense" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>How much you spend relative to your income.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {categoryData.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No expenses tracked yet.</p>
                            ) : (
                                categoryData.map((item) => (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-muted-foreground">৳{item.value.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                                                className={cn(
                                                    "h-full rounded-full",
                                                    item.percentage > 50 ? "bg-rose-500" : item.percentage > 25 ? "bg-amber-500" : "bg-emerald-500"
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid gap-4 lg:grid-cols-7"
            >
                <Card className="lg:col-span-4 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Financial Trends</CardTitle>
                        <CardDescription>Cumulative growth of your net worth over time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={finalTrendData}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                                    <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#888" tickFormatter={(v) => `৳${v}`} />
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "8px", color: "#fff" }} />
                                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorBalance)" name="Net Balance" animationDuration={1500} />
                                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={1} fillOpacity={0.1} fill="#10b981" name="Income (Cum.)" animationDuration={1500} />
                                    <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={1} fillOpacity={0.1} fill="#f43f5e" name="Expense (Cum.)" animationDuration={1500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>History of your financial activities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                            {transactions.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No transactions found.</p>
                            ) : (
                                transactions.map((tx, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * idx }}
                                        key={tx.id}
                                        className="flex items-center group"
                                    >
                                        <div className={cn(
                                            "w-9 h-9 rounded-full flex items-center justify-center mr-4 shrink-0",
                                            tx.type === "income" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" :
                                                tx.type === "saving" ? "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" :
                                                    "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                                        )}>
                                            {tx.type === "income" ? <TrendingUp className="h-5 w-5" /> :
                                                tx.type === "saving" ? <PiggyBank className="h-5 w-5" /> :
                                                    <DollarSign className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 space-y-0.5 min-w-0">
                                            <p className="text-sm font-medium truncate">{tx.title || tx.category}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {format(new Date(tx.date), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={cn(
                                                "text-sm font-bold whitespace-nowrap",
                                                tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" :
                                                    tx.type === "saving" ? "text-violet-600 dark:text-violet-400" :
                                                        "text-rose-600 dark:text-rose-400"
                                            )}>
                                                {tx.type === 'income' ? '+' : tx.type === 'saving' ? '' : '-'}৳{Math.abs(tx.amount).toLocaleString('en-US')}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-500"
                                                onClick={() => handleDelete(tx.id, tx.type)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Transaction"
                description="Are you sure you want to delete this transaction? This action cannot be undone."
            />
        </div >
    );
}

