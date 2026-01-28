"use client";

import * as React from "react";
import { Plus, Search, MessageSquare, Heart, Clock, ArrowRight, Share2, Loader2, BookOpen, Filter, Trash2, MoreHorizontal, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Category = {
    id: string;
    name: string;
    color: string;
};

type BlogPost = {
    id: string;
    title: string;
    content: string;
    published: boolean;
    tags: string[];
    views: number;
    createdAt: string;
    likes: { userId: string }[];
    dislikes: { userId: string }[];
    files: { url: string; name: string; type: string }[];
    categoryId?: string;
    category?: Category;
};

export default function BlogPage() {
    const [posts, setPosts] = React.useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [selectedCategory, setSelectedCategory] = React.useState("All");
    // Category State
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    const [newCategoryName, setNewCategoryName] = React.useState("");
    const [newCategoryColor, setNewCategoryColor] = React.useState("#3b82f6");

    // Create/Edit Hub State
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editPostId, setEditPostId] = React.useState<string | null>(null);
    const [newTitle, setNewTitle] = React.useState("");
    const [newContent, setNewContent] = React.useState("");
    const [newTags, setNewTags] = React.useState("");
    const [newCategoryId, setNewCategoryId] = React.useState("");
    const [isSaving, setIsSaving] = React.useState(false);

    // Delete Confirmation State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [postToDelete, setPostToDelete] = React.useState<string | null>(null);
    const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Read More State
    const [selectedPost, setSelectedPost] = React.useState<BlogPost | null>(null);
    const [isReadMoreOpen, setIsReadMoreOpen] = React.useState(false);

    const fetchPosts = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/blog");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setPosts(data);
        } catch (error) {
            toast.error("Could not load blog posts");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/blog/categories");
            if (!res.ok) throw new Error("Failed to fetch categories");
            const data = await res.json();
            setCategories(data);
        } catch (error) {
            console.error(error);
        }
    };

    React.useEffect(() => {
        fetchPosts();
        fetchCategories();
    }, []);

    const handleCreateOrUpdatePost = async () => {
        if (!newTitle || !newContent) {
            toast.error("Title and content are required");
            return;
        }

        setIsSaving(true);
        try {
            const url = editPostId ? `/api/blog/${editPostId}` : "/api/blog";
            const method = editPostId ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                body: JSON.stringify({
                    title: newTitle,
                    content: newContent,
                    tags: newTags.split(",").map(tag => tag.trim()).filter(tag => tag !== ""),
                    published: true,
                    categoryId: (newCategoryId === "none" || !newCategoryId) ? "" : newCategoryId
                })
            });

            if (!res.ok) throw new Error("Failed");

            toast.success(editPostId ? "Post updated" : "Blog post created");
            setIsDialogOpen(false);
            resetForm();
            fetchPosts();
        } catch (error) {
            toast.error("Action failed");
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setEditPostId(null);
        setNewTitle("");
        setNewContent("");
        setNewTags("");
        setNewCategoryId("");
    };

    const handleEditPost = (post: BlogPost) => {
        setEditPostId(post.id);
        setNewTitle(post.title);
        setNewContent(post.content);
        setNewTags(post.tags.join(", "));
        setNewCategoryId(post.categoryId || "");
        setIsDialogOpen(true);
    };

    const handleDeletePost = async (postId: string) => {
        setPostToDelete(postId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletePost = async () => {
        if (!postToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/blog/${postToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Post deleted");
            setIsDeleteDialogOpen(false);
            setPostToDelete(null);
            fetchPosts();
        } catch (error) {
            toast.error("Delete failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        try {
            const res = await fetch("/api/blog/categories", {
                method: "POST",
                body: JSON.stringify({ name: newCategoryName, color: newCategoryColor })
            });
            if (!res.ok) throw new Error();
            toast.success("Category added");
            setNewCategoryName("");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to add category");
        }
    };

    const handleDeleteCategory = async (id: string) => {
        setCategoryToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/blog/categories/${categoryToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            toast.success("Category removed");
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error) {
            toast.error("Failed to remove category");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleLike = async (postId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const res = await fetch(`/api/blog/${postId}/like`, { method: "POST" });
            if (!res.ok) throw new Error();
            fetchPosts();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleDislike = async (postId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const res = await fetch(`/api/blog/${postId}/dislike`, { method: "POST" });
            if (!res.ok) throw new Error();
            fetchPosts();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const openReadMore = (post: BlogPost) => {
        setSelectedPost(post);
        setIsReadMoreOpen(true);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" ||
            post.categoryId === selectedCategory ||
            post.tags.some(tag => tag.toLowerCase() === selectedCategory.toLowerCase());
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex flex-col gap-y-8 py-4 md:py-8 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1"
                >
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Personal Blog</h2>
                    <p className="text-muted-foreground text-sm md:text-base">Documenting the journey and sharing insights.</p>
                </motion.div>

                <div className="flex flex-col md:flex-row gap-2">
                    <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full md:w-auto">
                                <Filter className="mr-2 h-4 w-4" /> Categories
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Manage Categories</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Category name..."
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                    />
                                    <Input
                                        type="color"
                                        className="w-12 p-1 h-10"
                                        value={newCategoryColor}
                                        onChange={e => setNewCategoryColor(e.target.value)}
                                    />
                                    <Button onClick={handleCreateCategory}>Add</Button>
                                </div>
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span className="text-sm font-medium">{cat.name}</span>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDeleteCategory(cat.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button className="w-full md:w-auto bg-black text-white dark:bg-white dark:text-black">
                                <Plus className="mr-2 h-4 w-4" /> Create Post
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{editPostId ? "Edit Post" : "Create New Post"}</DialogTitle>
                                <DialogDescription>
                                    {editPostId ? "Update your article." : "Share your thoughts with the world."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter post title..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tags">Tags (comma separated)</Label>
                                    <Input
                                        id="tags"
                                        placeholder="Productivity, Tech, Life..."
                                        value={newTags}
                                        onChange={(e) => setNewTags(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        placeholder="Write your story..."
                                        rows={10}
                                        value={newContent}
                                        onChange={(e) => setNewContent(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateOrUpdatePost} disabled={isSaving} className="bg-black text-white dark:bg-white dark:text-black">
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : (editPostId ? "Update" : "Publish Post")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-zinc-900 border-none shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    <Button
                        variant={selectedCategory === "All" ? "default" : "ghost"}
                        onClick={() => setSelectedCategory("All")}
                        className={cn("text-sm rounded-full px-4 h-9 shrink-0", selectedCategory !== "All" && "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                    >
                        All
                    </Button>
                    {categories.map(cat => (
                        <Button
                            key={cat.id}
                            variant={selectedCategory === cat.id ? "default" : "ghost"}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={cn(
                                "text-sm rounded-full px-4 h-9 shrink-0",
                                selectedCategory !== cat.id && "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                        >
                            <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                        </Button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-muted-foreground animate-pulse">Loading insights...</p>
                </div>
            ) : filteredPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                    <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                        <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-bold">No articles found</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                        We couldn't find any posts matching your criteria. Try adjusting your filters or create a new post.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                        className="mt-6"
                    >
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                        {filteredPosts.map((post) => (
                            <motion.div
                                key={post.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="group border-none shadow-md overflow-hidden bg-white dark:bg-zinc-900/50 hover:shadow-xl transition-all h-full flex flex-col border border-zinc-100 dark:border-zinc-800/50">
                                    <div className="relative p-6 pt-8 bg-zinc-50 dark:bg-zinc-800/30 border-b border-zinc-100 dark:border-zinc-800/50">
                                        <div className="flex items-center justify-center text-muted-foreground py-4">
                                            <BookOpen className="h-10 w-10 opacity-20" />
                                        </div>
                                        {post.category ? (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span
                                                    className="backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm text-white"
                                                    style={{ backgroundColor: `${post.category.color}CC` }}
                                                >
                                                    {post.category.name}
                                                </span>
                                            </div>
                                        ) : post.tags.length > 0 && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-white/90 dark:bg-black/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                                                    {post.tags[0]}
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 dark:bg-black/90" onClick={(e) => { e.stopPropagation(); handleEditPost(post); }}>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-rose-500/90 text-white" onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <CardHeader className="pb-2 flex-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <Clock className="h-3 w-3" />
                                            <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                                        </div>
                                        <CardTitle className="text-xl group-hover:text-violet-500 transition-colors cursor-pointer line-clamp-2" onClick={() => openReadMore(post)}>
                                            {post.title}
                                        </CardTitle>
                                        <p className="text-muted-foreground text-sm line-clamp-3 mt-2">
                                            {post.content}
                                        </p>
                                    </CardHeader>

                                    <CardFooter className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={(e) => handleLike(post.id, e)}
                                                className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                                            >
                                                <Heart className={cn("h-4 w-4", (post.likes?.length || 0) > 0 && "fill-rose-500 text-rose-500")} />
                                                <span className="text-xs font-medium">{post.likes?.length || 0}</span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDislike(post.id, e)}
                                                className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                                            >
                                                <ThumbsDown className={cn("h-4 w-4", (post.dislikes?.length || 0) > 0 && "fill-blue-400 text-blue-400")} />
                                                <span className="text-xs font-medium">{post.dislikes?.length || 0}</span>
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => openReadMore(post)}
                                            className="flex items-center gap-1 text-black dark:text-white font-bold text-xs hover:translate-x-1 transition-transform group/btn"
                                        >
                                            READ MORE <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                        </button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Read More Modal */}
            <Dialog open={isReadMoreOpen} onOpenChange={setIsReadMoreOpen}>
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    {selectedPost && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{format(new Date(selectedPost.createdAt), "MMMM d, yyyy")}</span>
                                    {selectedPost.tags.map(tag => (
                                        <span key={tag} className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <DialogTitle className="text-3xl font-bold leading-tight">
                                    {selectedPost.title}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-6 space-y-6">
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    {selectedPost.content.split('\n').map((para, i) => (
                                        <p key={i} className="text-lg leading-relaxed mb-4 text-zinc-800 dark:text-zinc-200">
                                            {para}
                                        </p>
                                    ))}
                                </div>

                                {selectedPost.files && selectedPost.files.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                                        {selectedPost.files.map((file, i) => (
                                            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                {file.type.startsWith('image/') ? (
                                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                                                        <Share2 className="h-8 w-8 mb-2 text-zinc-400" />
                                                        <span className="text-xs font-medium truncate w-full">{file.name}</span>
                                                    </div>
                                                )}
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold"
                                                >
                                                    VIEW FILE
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="flex-row items-center justify-between border-t pt-6">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => handleLike(selectedPost.id)}
                                        className="flex items-center gap-2 hover:text-rose-500 transition-colors group"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30",
                                            selectedPost.likes?.some(l => posts.some(p => p.id === selectedPost.id && p.likes?.some(u => u.userId === l.userId))) && "bg-rose-100 dark:bg-rose-900/30"
                                        )}>
                                            <Heart className={cn("h-5 w-5", (selectedPost.likes?.length || 0) > 0 && "fill-rose-500 text-rose-500")} />
                                        </div>
                                        <span className="font-bold">{selectedPost.likes?.length || 0}</span>
                                    </button>

                                    <button
                                        onClick={() => handleDislike(selectedPost.id)}
                                        className="flex items-center gap-2 hover:text-blue-500 transition-colors group"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30",
                                            (selectedPost.dislikes?.length || 0) > 0 && "bg-blue-100 dark:bg-blue-900/30"
                                        )}>
                                            <ThumbsDown className={cn("h-5 w-5", (selectedPost.dislikes?.length || 0) > 0 && "fill-blue-400 text-blue-400")} />
                                        </div>
                                        <span className="font-bold">{selectedPost.dislikes?.length || 0}</span>
                                    </button>
                                </div>
                                <Button variant="outline" onClick={() => setIsReadMoreOpen(false)}>
                                    Close article
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setPostToDelete(null);
                    setCategoryToDelete(null);
                }}
                onConfirm={postToDelete ? confirmDeletePost : confirmDeleteCategory}
                isLoading={isDeleting}
                title={postToDelete ? "Delete Post" : "Delete Category"}
                description={postToDelete ? "Are you sure you want to delete this post?" : "Are you sure you want to delete this category?"}
            />
        </div>
    );
}

