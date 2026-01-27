"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

export default function RegisterPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.message || "Something went wrong");
                setIsLoading(false);
                return;
            }

            // Automatically sign in after registration
            const signInResult = await signIn("credentials", {
                email: values.email.toLowerCase(),
                password: values.password,
                redirect: false,
            });

            if (!signInResult?.ok) {
                alert("Account created but failed to sign in automatically. Please login.");
                router.push("/login");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight text-center">
                    Create an account
                </CardTitle>
                <CardDescription className="text-center">
                    Enter your information to get started
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="none"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@example.com"
                                type="email"
                                autoCapitalize="none"
                                autoComplete="email"
                                autoCorrect="off"
                                disabled={isLoading}
                                {...form.register("email")}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                {...form.register("password")}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.password.message}
                                </p>
                            )}
                        </div>
                        <Button disabled={isLoading} className="w-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 shadow-md transition-all">
                            {isLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Sign Up
                        </Button>
                    </div>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <div className="text-sm text-center text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="underline underline-offset-4 hover:text-primary transition-colors font-medium"
                    >
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
