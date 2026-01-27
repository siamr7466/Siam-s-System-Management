"use client";

import * as React from "react";
import { Plus, Search, MessageSquare, Heart, Clock, ArrowRight, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const mockPosts = [
    {
        id: "1",
        title: "Mastering the Flow State",
        excerpt: "How to reach maximum productivity by engineering your environment and mindset for deep focus.",
        category: "Productivity",
        date: "Jan 15, 2024",
        readTime: "5 min",
        likes: 42,
        comments: 12,
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: "2",
        title: "The Silent Power of Habit",
        excerpt: "Why small, daily rituals are the hidden engine behind long-term success and how to build them effectively.",
        category: "Psychology",
        date: "Jan 12, 2024",
        readTime: "8 min",
        likes: 38,
        comments: 5,
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&auto=format&fit=crop&q=60"
    },
    {
        id: "3",
        title: "Optimizing Your Digital Workspace",
        excerpt: "A deep dive into the software and hardware tools that make a difference in a modern developer's life.",
        category: "Tech",
        date: "Jan 10, 2024",
        readTime: "6 min",
        likes: 56,
        comments: 18,
        image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&auto=format&fit=crop&q=60"
    }
];

export default function BlogPage() {
    return (
        <div className="flex flex-col gap-y-8 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Personal Blog</h2>
                    <p className="text-muted-foreground">Documenting the journey and sharing insights.</p>
                </div>
                <Button className="bg-black text-white dark:bg-white dark:text-black">
                    <Plus className="mr-2 h-4 w-4" /> Create Post
                </Button>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        className="pl-9 bg-white dark:bg-zinc-900 border-none shadow-sm"
                    />
                </div>
                <div className="hidden md:flex gap-2">
                    {["All", "Productivity", "Tech", "Life"].map(cat => (
                        <Button key={cat} variant="ghost" className="text-sm rounded-full px-5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                            {cat}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {mockPosts.map((post) => (
                    <Card key={post.id} className="group border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900/50 hover:shadow-xl transition-all h-full flex flex-col">
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={post.image}
                                alt={post.title}
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    {post.category}
                                </span>
                            </div>
                        </div>

                        <CardHeader className="pb-2 flex-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                <Clock className="h-3 w-3" />
                                <span>{post.date}</span>
                                <span>•</span>
                                <span>{post.readTime} read</span>
                            </div>
                            <CardTitle className="text-xl group-hover:text-violet-500 transition-colors cursor-pointer">
                                {post.title}
                            </CardTitle>
                            <p className="text-muted-foreground text-sm line-clamp-3 mt-2">
                                {post.excerpt}
                            </p>
                        </CardHeader>

                        <CardFooter className="pt-4 border-t dark:border-zinc-800 flex items-center justify-between text-muted-foreground">
                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                                    <Heart className="h-4 w-4" />
                                    <span className="text-xs font-medium">{post.likes}</span>
                                </button>
                                <button className="flex items-center gap-1 hover:text-sky-500 transition-colors">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="text-xs font-medium">{post.comments}</span>
                                </button>
                            </div>
                            <button className="flex items-center gap-1 text-black dark:text-white font-bold text-xs hover:translate-x-1 transition-transform">
                                READ MORE <ArrowRight className="h-4 w-4" />
                            </button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
