'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { updatePassword } from '@/lib/auth/actions';

export default function UpdatePasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const password = formData.get('password') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        const result = await updatePassword(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        // updatePassword redirects on success, so we won't reach here
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25">
                        <span className="text-2xl">🏔️</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Peaks & Pixels</h1>
                        <p className="text-sm text-muted-foreground">Set new password</p>
                    </div>
                </div>

                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">Set new password</h2>
                    <p className="text-muted-foreground mt-2">
                        Choose a strong password for your account.
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
                        <Label htmlFor="password" className="text-foreground font-medium">
                            New Password
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
                        <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                            Confirm Password
                        </Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="h-12 bg-secondary/50 border-border rounded-xl text-foreground pr-12 focus:bg-secondary focus:border-primary/50 transition-apple"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-apple"
                            >
                                {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                                <Check className="h-5 w-5 mr-2" />
                                Update Password
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
