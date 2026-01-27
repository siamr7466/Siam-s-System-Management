"use client";

import * as React from "react";
import {
    File,
    FileText,
    Image as ImageIcon,
    Video,
    MoreVertical,
    Plus,
    Search,
    Folder,
    Download,
    Trash2,
    ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockFiles = [
    { name: "Quarterly Report.pdf", type: "PDF", size: "2.4 MB", date: "Jan 12, 2024", icon: FileText, color: "text-rose-500" },
    { name: "Product Showcase.mp4", type: "Video", size: "45.1 MB", date: "Jan 10, 2024", icon: Video, color: "text-violet-500" },
    { name: "Brand Identity.fig", type: "Figma", size: "1.2 MB", date: "Jan 08, 2024", icon: ImageIcon, color: "text-pink-500" },
    { name: "User Research.docx", type: "Doc", size: "850 KB", date: "Jan 05, 2024", icon: File, color: "text-blue-500" },
    { name: "Feedback Sessions.zip", type: "Archive", size: "128 MB", date: "Jan 02, 2024", icon: Folder, color: "text-amber-500" },
];

export default function FilesPage() {
    return (
        <div className="flex flex-col gap-y-8 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cloud Storage</h2>
                    <p className="text-muted-foreground">Manage your documents and media assets.</p>
                </div>
                <Button className="bg-black text-white dark:bg-white dark:text-black">
                    <Plus className="mr-2 h-4 w-4" /> Upload File
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                {[
                    { label: "Used Space", value: "4.2 GB", total: "10 GB", color: "bg-black dark:bg-white" },
                    { label: "Documents", value: "1,240", total: "", color: "bg-blue-500" },
                    { label: "Media", value: "420", total: "", color: "bg-violet-500" },
                    { label: "Other", value: "154", total: "", color: "bg-rose-500" },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm bg-white dark:bg-zinc-900/50">
                        <CardContent className="p-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{stat.label}</p>
                            <div className="flex items-end gap-2 text-2xl font-bold">
                                {stat.value}
                                {stat.total && <span className="text-sm font-normal text-muted-foreground mb-1">/ {stat.total}</span>}
                            </div>
                            {stat.total && (
                                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full mt-3">
                                    <div className={`${stat.color} h-1.5 rounded-full`} style={{ width: '42%' }} />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your files..."
                        className="pl-9 bg-white dark:bg-zinc-900 border-none shadow-sm"
                    />
                </div>
            </div>

            <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-zinc-800">
                                    <th className="text-left font-semibold text-sm p-4 text-muted-foreground">Name</th>
                                    <th className="text-left font-semibold text-sm p-4 text-muted-foreground">Date Modified</th>
                                    <th className="text-left font-semibold text-sm p-4 text-muted-foreground">Size</th>
                                    <th className="text-left font-semibold text-sm p-4 text-muted-foreground">Type</th>
                                    <th className="w-[80px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                                {mockFiles.map((file, i) => (
                                    <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${file.color}`}>
                                                    <file.icon className="h-4 w-4" />
                                                </div>
                                                <span className="font-medium text-sm group-hover:text-black dark:group-hover:text-white transition-colors">{file.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground">{file.date}</td>
                                        <td className="p-4 text-sm text-muted-foreground">{file.size}</td>
                                        <td className="p-4">
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-muted-foreground">
                                                {file.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem className="gap-2"><Download className="h-4 w-4" /> Download</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2"><ExternalLink className="h-4 w-4" /> Preview</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 text-rose-500"><Trash2 className="h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
