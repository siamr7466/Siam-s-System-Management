"use client";

import * as React from "react";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, DollarSign, TrendingUp, Filter, Download } from "lucide-react";
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const chartData = [
    { name: "Rent", amount: 1200, type: "expense" },
    { name: "Salary", amount: 4500, type: "income" },
    { name: "Food", amount: 600, type: "expense" },
    { name: "Utils", amount: 200, type: "expense" },
    { name: "Stocks", amount: 800, type: "income" },
    { name: "Leisure", amount: 400, type: "expense" },
];

const transactions = [
    { id: "1", title: "Monthly Salary", amount: 4500, type: "income", category: "Work", date: "Today" },
    { id: "2", title: "Apartment Rent", amount: -1200, type: "expense", category: "Home", date: "Yesterday" },
    { id: "3", title: "Vercel Pro Subscription", amount: -20, type: "expense", category: "Dev", date: "Jan 25" },
    { id: "4", title: "Dividend Payout", amount: 80, type: "income", category: "Invesment", date: "Jan 24" },
    { id: "5", title: "Grocercies", amount: -150, type: "expense", category: "Food", date: "Jan 23" },
];

export default function BudgetPage() {
    return (
        <div className="flex flex-col gap-y-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
                    <p className="text-muted-foreground">Monitor and manage your financial health.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
                    <Button className="bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black">
                        <Plus className="mr-2 h-4 w-4" /> Add Transaction
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium text-muted-foreground flex items-center">
                                <Wallet className="h-4 w-4 mr-2" /> Total Balance
                            </p>
                        </div>
                        <div className="text-3xl font-bold">৳12,450.50</div>
                        <p className="text-xs text-muted-foreground mt-1">+2.5% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-emerald-50 dark:bg-emerald-900/20">
                    <CardContent className="p-6 text-emerald-700 dark:text-emerald-400">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium flex items-center">
                                <ArrowUpCircle className="h-4 w-4 mr-2" /> Monthly Income
                            </p>
                        </div>
                        <div className="text-3xl font-bold">৳5,300.00</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-md bg-rose-50 dark:bg-rose-900/20">
                    <CardContent className="p-6 text-rose-700 dark:text-rose-400">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <p className="text-sm font-medium flex items-center">
                                <ArrowDownCircle className="h-4 w-4 mr-2" /> Monthly Expenses
                            </p>
                        </div>
                        <div className="text-3xl font-bold">৳2,370.00</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>Review where your money goes.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{
                                            backgroundColor: "#18181b",
                                            border: "none",
                                            borderRadius: "8px",
                                            color: "#fff"
                                        }}
                                    />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#888" />
                                    <YAxis hide />
                                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.type === 'income' ? '#10b981' : '#f43f5e'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-md bg-white dark:bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Your last 5 entries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-4 ${tx.type === "income" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                        }`}>
                                        {tx.type === "income" ? <TrendingUp className="h-5 w-5" /> : <DollarSign className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-sm font-medium">{tx.title}</p>
                                        <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                                    </div>
                                    <div className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"
                                        }`}>
                                        {tx.amount > 0 ? "+" : ""}৳{Math.abs(tx.amount).toLocaleString('en-US')}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" className="w-full mt-6 text-muted-foreground hover:text-black dark:hover:text-white">
                            View All Transactions
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
