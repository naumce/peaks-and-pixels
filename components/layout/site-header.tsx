'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
    Mountain, Menu, X, User, LogOut,
    ChevronDown, Compass, Users, Calendar, Search, Bell, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { createClient } from '@/lib/supabase/client';

const navLinks = [
    { href: '/tours', label: 'Tours' },
    { href: '/clubs', label: 'Clubs' },
    { href: '/feed', label: 'Feed' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
    const { user, profile, loading } = useAuth();
    const isAdmin = profile?.role === 'admin';
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    async function handleSignOut() {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = '/';
    }

    // Don't show on admin, auth, or dashboard pages
    if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/dashboard')) {
        return null;
    }

    return (
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25">
                            <span className="text-lg">🏔️</span>
                        </div>
                        <span className="font-bold text-lg hidden sm:block">Peaks & Pixels</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === link.href || pathname.startsWith(link.href + '/')
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <Link
                            href="/search"
                            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-muted transition-colors"
                        >
                            <Search className="h-5 w-5 text-muted-foreground" />
                        </Link>

                        {loading ? (
                            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                        ) : user ? (
                            <>
                                {/* Notifications */}
                                <Link
                                    href="/account/notifications"
                                    className="relative flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-muted transition-colors"
                                >
                                    <Bell className="h-5 w-5 text-muted-foreground" />
                                </Link>

                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-4 w-4 text-primary" />
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
                                    </button>

                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                                                <div className="p-2">
                                                    <Link
                                                        href="/account"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        <span>My Account</span>
                                                    </Link>
                                                    <Link
                                                        href="/account/bookings"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <Calendar className="h-4 w-4" />
                                                        <span>My Bookings</span>
                                                    </Link>
                                                    <Link
                                                        href="/feed"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                                                    >
                                                        <Compass className="h-4 w-4" />
                                                        <span>My Feed</span>
                                                    </Link>
                                                    {isAdmin && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                                                        >
                                                            <Shield className="h-4 w-4 text-amber-400" />
                                                            <span>Admin Dashboard</span>
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="border-t border-border p-2">
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        <span>Sign Out</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/auth/login" className="hidden sm:block">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button size="sm" className="rounded-full">Get Started</Button>
                                </Link>
                            </>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden p-2 hover:bg-muted rounded-lg"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="md:hidden relative z-50 border-t border-border py-4 space-y-1 slide-up">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {!user && (
                                <Link
                                    href="/auth/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}
