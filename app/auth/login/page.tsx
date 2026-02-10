'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
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

        const supabase = createClient();
        const { data: authData, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        // Check user role to determine redirect
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        const role = profile?.role || 'customer';

        // Small delay to ensure cookies are properly set
        await new Promise(resolve => setTimeout(resolve, 100));

        if (role === 'admin' || role === 'guide') {
            router.push('/admin');
        } else {
            router.push('/account');
        }
        router.refresh();
    }

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
                            <span className="text-2xl">🏔️</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-foreground">Peaks & Pixels</h1>
                            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
                        </div>
                    </div>

                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">
                            Sign in to access your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl fade-in">
                                {error}
                            </div>
                        )}

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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-foreground font-medium">
                                    Password
                                </Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="text-sm text-primary hover:text-primary/80 transition-apple"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    required
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
                                    Sign In
                                    <ArrowRight className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-muted-foreground mt-8">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/auth/signup"
                            className="text-primary hover:text-primary/80 font-medium transition-apple"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 gradient-primary opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/80" />

                {/* Floating orbs */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-40 right-20 w-40 h-40 bg-accent/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-primary/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />

                {/* Content */}
                <div className="relative text-center px-12">
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Manage Your Adventures
                    </h2>
                    <p className="text-lg text-white/70 max-w-md">
                        The complete platform for tour operators to manage bookings, customers, and create unforgettable experiences.
                    </p>
                </div>
            </div>
        </div>
    );
}
