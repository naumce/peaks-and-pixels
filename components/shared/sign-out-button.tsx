'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
    className?: string;
    variant?: 'sidebar' | 'dropdown';
}

export function SignOutButton({ className, variant = 'sidebar' }: SignOutButtonProps) {
    const router = useRouter();

    async function handleSignOut() {
        await fetch('/api/auth/signout', { method: 'POST' });
        router.push('/auth/login');
        router.refresh();
    }

    if (variant === 'dropdown') {
        return (
            <button
                onClick={handleSignOut}
                className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-destructive outline-none transition-colors focus:bg-destructive/10 focus:text-destructive hover:bg-destructive/10"
            >
                <LogOut className="h-4 w-4" />
                Sign out
            </button>
        );
    }

    return (
        <button
            onClick={handleSignOut}
            className={className || "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-apple w-full"}
        >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
        </button>
    );
}
