"use client";

import * as React from "react";
import { Plus, Search, MoreHorizontal, Calendar, Tag, CheckCircle2, Clock, AlertCircle, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Task {
    id: string;
    title: string;
    description?: string;
    status: "PENDING" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    dueDate?: string;
    tags: string[];
}

export default function TodosPage() {
    const [tasks, setTasks] = React.useState<Task[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
    const [taskToEdit, setTaskToEdit] = React.useState<Task | null>(null);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        fetchTasks();
    }, []);

    const [newTaskTitle, setNewTaskTitle] = React.useState("");
    const [newTaskDesc, setNewTaskDesc] = React.useState("");
    const [newTaskPriority, setNewTaskPriority] = React.useState("MEDIUM");
    const [newTaskDueDate, setNewTaskDueDate] = React.useState("");
    const [newTaskTags, setNewTaskTags] = React.useState("");
    const [searchQuery, setSearchQuery] = React.useState("");

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
    const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        if (taskToEdit) {
            setNewTaskTitle(taskToEdit.title);
            setNewTaskDesc(taskToEdit.description || "");
            setNewTaskPriority(taskToEdit.priority);
            setNewTaskDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : "");
            setNewTaskTags(taskToEdit.tags.join(", "));
        }
    }, [taskToEdit]);

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/todos");
            if (!res.ok) throw new Error("Failed to fetch");
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            toast.error("Could not load tasks");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async () => {
        if (!newTaskTitle) return;
        try {
            const res = await fetch("/api/todos", {
                method: "POST",
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDesc,
                    priority: newTaskPriority,
                    dueDate: newTaskDueDate || undefined,
                    tags: newTaskTags.split(",").map(t => t.trim()).filter(t => t !== "")
                })
            });
            if (!res.ok) throw new Error("Failed to create");
            toast.success("Task created");
            setIsDialogOpen(false);
            resetForm();
            fetchTasks();
        } catch (error) {
            toast.error("Failed to create task");
        }
    };

    const handleEditTask = async () => {
        if (!taskToEdit || !newTaskTitle) return;
        try {
            const res = await fetch(`/api/todos/${taskToEdit.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title: newTaskTitle,
                    description: newTaskDesc,
                    priority: newTaskPriority,
                    dueDate: newTaskDueDate || undefined,
                    tags: newTaskTags.split(",").map(t => t.trim()).filter(t => t !== "")
                })
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("Task updated");
            setIsEditDialogOpen(false);
            setTaskToEdit(null);
            resetForm();
            fetchTasks();
        } catch (error) {
            toast.error("Failed to update task");
        }
    };

    const resetForm = () => {
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskPriority("MEDIUM");
        setNewTaskDueDate("");
        setNewTaskTags("");
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        const oldTasks = [...tasks];
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus as any } : t));

        try {
            const res = await fetch(`/api/todos/${taskId}`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) throw new Error("Failed to update");
        } catch (error) {
            setTasks(oldTasks);
            toast.error("Failed to update status");
        }
    };

    const handleDelete = async (taskId: string) => {
        setTaskToDelete(taskId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/todos/${taskToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            setTasks(tasks.filter(t => t.id !== taskToDelete));
            toast.success("Task deleted");
            setIsDeleteDialogOpen(false);
            setTaskToDelete(null);
        } catch (error) {
            toast.error("Failed to delete task");
        } finally {
            setIsDeleting(false);
        }
    };

    const columns = [
        { id: "PENDING", title: "To Do", icon: AlertCircle, color: "text-zinc-500" },
        { id: "IN_PROGRESS", title: "In Progress", icon: Clock, color: "text-sky-500" },
        { id: "DONE", title: "Done", icon: CheckCircle2, color: "text-emerald-500" },
    ];

    const getPriorityColor = (p: string) => {
        switch (p) {
            case "HIGH": return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
            case "MEDIUM": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
            case "LOW": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
            default: return "bg-zinc-100 text-zinc-700";
        }
    };

    const onDragEnd = (result: any) => {
        const { destination, source, draggableId } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const task = tasks.find(t => t.id === draggableId);
        if (!task) return;

        const newStatus = destination.droppableId;
        if (newStatus !== task.status) {
            handleUpdateStatus(draggableId, newStatus);
        }
    };

    const filteredTasks = tasks.filter(task => {
        const query = searchQuery.toLowerCase();
        return task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags.some(tag => tag.toLowerCase().includes(query));
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    } as const;

    if (!isMounted) return null;

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8 py-8 h-full overflow-hidden px-4 md:px-0"
        >
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Active Tasks</h2>
                    <p className="text-muted-foreground text-sm">"Organize your work and life, finally."</p>
                </div>
                <div className="flex-1 max-w-md relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search tasks or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-white dark:bg-zinc-900 border-none shadow-sm h-11 rounded-xl"
                    />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full md:w-auto bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black shadow-lg rounded-full px-6 h-11">
                            <Plus className="mr-2 h-4 w-4" /> New Task
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Task</DialogTitle>
                            <DialogDescription>Add a new item to your todo list.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Title</Label>
                                <Input placeholder="Task title" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input placeholder="Additional details..." value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Tags (comma separated)</Label>
                                <Input placeholder="Work, Personal, Urgent..." value={newTaskTags} onChange={e => setNewTaskTags(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Priority</Label>
                                    <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateTask}>Create Task</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </motion.div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto md:overflow-hidden min-h-0 pb-10 md:pb-0">
                    {columns.map((col) => {
                        const colTasks = filteredTasks.filter(t => t.status === col.id);
                        return (
                            <Card key={col.id} className="border-none shadow-md bg-white dark:bg-zinc-900/50 flex flex-col h-full overflow-hidden">
                                <CardHeader className="py-4 border-b dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <col.icon className={cn("h-5 w-5", col.color)} />
                                            <CardTitle className="text-sm font-bold uppercase tracking-wider">{col.title}</CardTitle>
                                        </div>
                                        <Badge variant="secondary" className="rounded-full px-2 min-w-[20px] justify-center">{colTasks.length}</Badge>
                                    </div>
                                </CardHeader>
                                <Droppable droppableId={col.id}>
                                    {(provided: any, snapshot: any) => (
                                        <CardContent
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "flex-1 p-2 overflow-y-auto transition-colors",
                                                snapshot.isDraggingOver ? "bg-zinc-100/50 dark:bg-zinc-800/50" : "bg-zinc-50/30 dark:bg-black/10"
                                            )}
                                        >
                                            <div className="flex flex-col gap-2 min-h-[100px]">
                                                {colTasks.length === 0 && !snapshot.isDraggingOver && (
                                                    <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-50 border-2 border-dashed rounded-xl border-zinc-200 dark:border-zinc-800 m-2">
                                                        <p className="text-xs">No tasks</p>
                                                    </motion.div>
                                                )}
                                                {colTasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided: any, snapshot: any) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                }}
                                                            >
                                                                <motion.div
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    whileHover={{ scale: 1.02 }}
                                                                    transition={{ duration: 0.2 }}
                                                                >
                                                                    <Card className={cn(
                                                                        "border shadow-none transition-all relative group bg-white dark:bg-zinc-900",
                                                                        snapshot.isDragging ? "shadow-xl ring-2 ring-violet-500 rotate-2 scale-105 z-50" : "hover:shadow-md"
                                                                    )}>
                                                                        <CardContent className="p-3">
                                                                            <div className="flex justify-between items-start mb-2">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", getPriorityColor(task.priority))}>
                                                                                        {task.priority}
                                                                                    </span>
                                                                                    {task.dueDate && (
                                                                                        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                                            <Calendar className="h-3 w-3" />
                                                                                            {format(new Date(task.dueDate), "MMM d")}
                                                                                        </span>
                                                                                    )}
                                                                                    {task.tags.map(tag => (
                                                                                        <span key={tag} className="text-[10px] bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                                                            <Tag className="h-2 w-2" />
                                                                                            {tag}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger asChild>
                                                                                        <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded">
                                                                                            <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                                                                                        </button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end">
                                                                                        <DropdownMenuItem onClick={() => {
                                                                                            setTaskToEdit(task);
                                                                                            setIsEditDialogOpen(true);
                                                                                        }}>
                                                                                            Edit
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-rose-500">
                                                                                            Delete
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </div>

                                                                            <h4 className={cn("font-medium text-sm mb-1", task.status === "DONE" && "text-muted-foreground line-through")}>{task.title}</h4>
                                                                            {task.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>}

                                                                            <div className="flex items-center justify-between mt-2 pt-2 border-t dark:border-zinc-800">
                                                                                <div>
                                                                                    {task.status !== "PENDING" && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 mr-1"
                                                                                            onClick={() => handleUpdateStatus(task.id, task.status === "DONE" ? "IN_PROGRESS" : "PENDING")}
                                                                                        >
                                                                                            <ArrowLeft className="h-3 w-3" />
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                                <div className="w-8 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                                                                                <div>
                                                                                    {task.status !== "DONE" && (
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            className="h-6 w-6 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600"
                                                                                            onClick={() => handleUpdateStatus(task.id, task.status === "PENDING" ? "IN_PROGRESS" : "DONE")}
                                                                                        >
                                                                                            <ArrowRight className="h-3 w-3" />
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </motion.div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </CardContent>
                                    )}
                                </Droppable>
                            </Card>
                        );
                    })}
                </div>
            </DragDropContext>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Delete Task"
                description="Are you sure you want to delete this task?"
            />

            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
                setIsEditDialogOpen(open);
                if (!open) {
                    setTaskToEdit(null);
                    resetForm();
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Title</Label>
                            <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Description</Label>
                            <Input value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Priority</Label>
                                <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Due Date</Label>
                                <Input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>Tags</Label>
                            <Input value={newTaskTags} onChange={e => setNewTaskTags(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditTask}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
