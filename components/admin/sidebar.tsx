'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Mountain,
    Calendar,
    Users,
    Users2,
    UserPlus,
    Image,
    BarChart3,
    Settings,
    LogOut,
    ChevronRight,
} from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tours', href: '/admin/tours', icon: Mountain },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Clubs', href: '/admin/clubs', icon: Users2 },
    { name: 'Operators', href: '/admin/operators', icon: UserPlus },
    { name: 'Content', href: '/admin/content', icon: Image },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 flex-col glass lg:flex">
            {/* Logo */}
            <div className="flex h-20 items-center gap-3 px-8 border-b border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                    <span className="text-xl">🏔️</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-foreground">Peaks & Pixels</h1>
                    <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-6">
                <div className="mb-4">
                    <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Menu
                    </p>
                </div>
                <ul className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href));

                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-apple',
                                        isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    )}
                                >
                                    <item.icon className={cn(
                                        'h-5 w-5 transition-apple',
                                        isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                                    )} />
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <ChevronRight className="h-4 w-4 text-primary" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="border-t border-border/50 p-6">
                <Link
                    href="/api/auth/signout"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-apple"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                </Link>
            </div>
        </aside>
    );
}
