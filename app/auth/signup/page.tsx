'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react';

export default function SignUpPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;

        const supabase = createClient();
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    role: 'customer',
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push('/auth/verify-email');
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 gradient-primary opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-background/80" />

                {/* Floating orbs */}
                <div className="absolute top-40 right-20 w-32 h-32 bg-accent/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

                {/* Content */}
                <div className="relative px-12">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Start Your Journey
                    </h2>
                    <ul className="space-y-4 text-white/80">
                        <li className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20">
                                <Check className="h-4 w-4 text-green-400" />
                            </div>
                            Discover amazing hiking & photo tours
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20">
                                <Check className="h-4 w-4 text-green-400" />
                            </div>
                            Book with confidence, instant confirmation
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-400/20">
                                <Check className="h-4 w-4 text-green-400" />
                            </div>
                            Create unforgettable memories
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
                            <span className="text-2xl">🏔️</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Peaks & Pixels</h1>
                            <p className="text-sm text-muted-foreground">Adventure awaits</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground">Create account</h2>
                        <p className="text-muted-foreground mt-2">
                            Join us and start exploring
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl fade-in">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-foreground font-medium">
                                    First name
                                </Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="John"
                                    required
                                    className="h-12 bg-secondary/50 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary/50 transition-apple"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-foreground font-medium">
                                    Last name
                                </Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    required
                                    className="h-12 bg-secondary/50 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary/50 transition-apple"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground font-medium">
                                Email
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="h-12 bg-secondary/50 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary/50 transition-apple"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground font-medium">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                    className="h-12 bg-secondary/50 border-border rounded-xl text-foreground pr-12 focus:bg-secondary focus:border-primary/50 transition-apple"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-apple"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Minimum 8 characters
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-apple glow-hover"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-muted-foreground mt-8">
                        Already have an account?{' '}
                        <Link
                            href="/auth/login"
                            className="text-primary hover:text-primary/80 font-medium transition-apple"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
