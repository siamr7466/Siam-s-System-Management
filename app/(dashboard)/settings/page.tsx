"use client";

import * as React from "react";
import {
    User,
    Bell,
    Eye,
    Globe,
    Moon,
    Save,
    Camera,
    Mail,
    Smartphone
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function SettingsPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const userName = user?.name || "Siam Rahman";
    const userEmail = user?.email || "siamrahman7466@gmail.com";
    const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

    return (
        <div className="flex flex-col gap-y-8 py-8">
            <div className="px-4 md:px-0">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground text-sm">Manage your account preferences and system configuration.</p>
            </div>

            <Tabs defaultValue="profile" className="w-full px-4 md:px-0">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900 mb-8 w-full md:w-fit overflow-x-auto justify-start h-auto p-1">
                    <TabsTrigger value="profile" className="gap-2">
                        <User className="h-4 w-4" /> Profile
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-2">
                        <Bell className="h-4 w-4" /> Notifications
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="gap-2">
                        <Moon className="h-4 w-4" /> Appearance
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <div className="grid gap-8">
                        <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle>Public Profile</CardTitle>
                                <CardDescription>How others see you in the system.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                    <div className="relative group">
                                        <Avatar className="h-24 w-24 ring-2 ring-zinc-100 dark:ring-zinc-800">
                                            <AvatarImage src={user?.image || ""} />
                                            <AvatarFallback className="text-2xl font-bold bg-zinc-100 dark:bg-zinc-800">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera className="h-6 w-6" />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">Profile Picture</p>
                                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB Max.</p>
                                        <div className="flex justify-center sm:justify-start gap-2 mt-2">
                                            <Button variant="outline" size="sm">Update</Button>
                                            <Button variant="ghost" size="sm" className="text-rose-500">Remove</Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" defaultValue={userName} className="bg-zinc-50 dark:bg-zinc-900/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" defaultValue={userEmail} className="bg-zinc-50 dark:bg-zinc-900/50" />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <textarea
                                            id="bio"
                                            className="w-full flex min-h-[100px] rounded-md border border-input bg-zinc-50 p-3 text-sm focus-visible:ring-1 focus-visible:ring-zinc-400 dark:bg-zinc-900/50"
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-start sm:justify-end pt-4">
                                    <Button
                                        onClick={() => toast.success("Profile changes saved successfully!")}
                                        className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black"
                                    >
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle>Connected Accounts</CardTitle>
                                <CardDescription>Integrate with your favorite services.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    { name: "Google", desc: "Calendar, Contacts, & Storage", icon: Globe, connected: true },
                                    { name: "GitHub", desc: "Code Sync & Authentication", icon: Smartphone, connected: false },
                                ].map((app, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
                                                <app.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{app.name}</p>
                                                <p className="text-xs text-muted-foreground">{app.desc}</p>
                                            </div>
                                        </div>
                                        <Button variant={app.connected ? "outline" : "default"} size="sm">
                                            {app.connected ? "Disconnect" : "Connect"}
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>


                <TabsContent value="notifications">
                    <Card className="border-none shadow-md bg-white dark:bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle>Preferences</CardTitle>
                            <CardDescription>Choose how you want to be notified.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { title: "Email Notifications", desc: "Weekly summaries and security alerts", icon: Mail },
                                { title: "Push Notifications", desc: "Instant task and habit reminders", icon: Smartphone },
                                { title: "Dashboard Alerts", desc: "System updates and blog comments", icon: Eye },
                            ].map((pref, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                            <pref.icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{pref.title}</p>
                                            <p className="text-xs text-muted-foreground">{pref.desc}</p>
                                        </div>
                                    </div>
                                    <div
                                        onClick={() => toast.success("Notification setting updated!")}
                                        className="w-10 h-6 bg-emerald-500 rounded-full relative cursor-pointer"
                                    >
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
