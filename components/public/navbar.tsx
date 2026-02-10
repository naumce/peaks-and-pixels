'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { Menu, User, LogOut, Shield, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const navigation = [
    { name: 'Tours', href: '/tours' },
    { name: 'About', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Contact', href: '/contact' },
];

interface UserProfile {
    first_name: string;
    role: string;
    email: string;
}

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState<{ id: string } | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) {
                setUser({ id: user.id });
                supabase
                    .from('users')
                    .select('first_name, role, email')
                    .eq('id', user.id)
                    .single()
                    .then(({ data }) => {
                        if (data) setProfile(data);
                    });
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            } else if (session?.user) {
                setUser({ id: session.user.id });
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUserMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'glass border-b border-border/50'
                    : 'bg-transparent'
            )}
        >
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 lg:h-20 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/25 transition-apple group-hover:scale-105">
                            <span className="text-xl">🏔️</span>
                        </div>
                        <span className="text-lg font-bold text-foreground hidden sm:block">
                            Peaks & Pixels
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    'px-4 py-2 rounded-xl text-sm font-medium transition-apple',
                                    pathname === item.href
                                        ? 'text-primary bg-primary/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                )}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 lg:gap-3">
                        <ThemeToggle />

                        {/* Desktop: Auth-aware buttons */}
                        <div className="hidden lg:flex items-center gap-2">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary transition-apple"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="text-sm font-semibold text-primary">
                                                {profile?.first_name?.[0] || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">
                                            {profile?.first_name || 'Account'}
                                        </span>
                                        {isAdmin && (
                                            <Shield className="h-3.5 w-3.5 text-amber-400" />
                                        )}
                                        <ChevronDown className={cn(
                                            'h-4 w-4 text-muted-foreground transition-transform',
                                            userMenuOpen && 'rotate-180'
                                        )} />
                                    </button>

                                    {/* Dropdown */}
                                    {userMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-card shadow-lg z-50 overflow-hidden">
                                                <div className="px-4 py-3 border-b border-border/50">
                                                    <p className="text-sm font-medium text-foreground">{profile?.first_name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                                                    {isAdmin && (
                                                        <span className="inline-block mt-1 text-xs font-medium text-amber-400">Admin</span>
                                                    )}
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        href="/account"
                                                        onClick={() => setUserMenuOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                                                    >
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        My Account
                                                    </Link>
                                                    {isAdmin && (
                                                        <Link
                                                            href="/admin"
                                                            onClick={() => setUserMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors"
                                                        >
                                                            <Shield className="h-4 w-4 text-amber-400" />
                                                            Admin Dashboard
                                                        </Link>
                                                    )}
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-secondary transition-colors w-full text-left"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <Button variant="ghost" className="rounded-xl" asChild>
                                        <Link href="/auth/login">Sign In</Link>
                                    </Button>
                                    <Button className="gradient-primary text-white rounded-xl glow-hover" asChild>
                                        <Link href="/auth/signup">Get Started</Link>
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Mobile menu */}
                        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[300px] glass border-l border-border/50 p-0">
                                <SheetHeader className="p-6 border-b border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                                            <span className="text-xl">🏔️</span>
                                        </div>
                                        <SheetTitle className="text-lg font-bold">Peaks & Pixels</SheetTitle>
                                    </div>
                                </SheetHeader>

                                <div className="flex flex-col p-6">
                                    {/* User info on mobile */}
                                    {user && profile && (
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                <span className="font-semibold text-primary">
                                                    {profile.first_name?.[0] || 'U'}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-foreground">{profile.first_name}</p>
                                                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <nav className="space-y-1 mb-6">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className={cn(
                                                    'flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-apple',
                                                    pathname === item.href
                                                        ? 'text-primary bg-primary/10'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                                )}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </nav>

                                    <div className="space-y-2 pt-6 border-t border-border/50">
                                        {user ? (
                                            <>
                                                <Button variant="outline" className="w-full rounded-xl justify-start gap-2" asChild>
                                                    <Link href="/account" onClick={() => setMobileMenuOpen(false)}>
                                                        <User className="h-4 w-4" />
                                                        My Account
                                                    </Link>
                                                </Button>
                                                {isAdmin && (
                                                    <Button variant="outline" className="w-full rounded-xl justify-start gap-2" asChild>
                                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                                            <Shield className="h-4 w-4 text-amber-400" />
                                                            Admin Dashboard
                                                        </Link>
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    className="w-full rounded-xl justify-start gap-2 text-red-400 hover:text-red-400"
                                                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="outline" className="w-full rounded-xl" asChild>
                                                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                                                        Sign In
                                                    </Link>
                                                </Button>
                                                <Button className="w-full gradient-primary text-white rounded-xl" asChild>
                                                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                                        Get Started
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </nav>
        </header>
    );
}
