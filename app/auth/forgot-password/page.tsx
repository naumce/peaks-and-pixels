'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { resetPassword } from '@/lib/auth/actions';

export default function ForgotPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await resetPassword(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
                    <p className="text-muted-foreground mb-8">
                        We&apos;ve sent a password reset link to your email address.
                        Click the link in the email to set a new password.
                    </p>
                    <Link href="/auth/login">
                        <Button variant="outline" className="rounded-xl">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Login
                        </Button>
                    </Link>
                </div>
            </div>
        );
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
                        <p className="text-sm text-muted-foreground">Reset your password</p>
                    </div>
                </div>

                {/* Heading */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-foreground">Forgot password?</h2>
                    <p className="text-muted-foreground mt-2">
                        Enter your email address and we&apos;ll send you a link to reset your password.
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

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 gradient-primary text-white font-medium rounded-xl hover:opacity-90 transition-apple glow-hover"
                    >
                        {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <p className="text-center text-muted-foreground mt-8">
                    Remember your password?{' '}
                    <Link
                        href="/auth/login"
                        className="text-primary hover:text-primary/80 font-medium transition-apple"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
