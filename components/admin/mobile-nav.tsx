'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Menu,
    LayoutDashboard,
    Mountain,
    Calendar,
    Users,
    Image,
    BarChart3,
    Settings,
    ChevronRight,
} from 'lucide-react';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Tours', href: '/admin/tours', icon: Mountain },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Content', href: '/admin/content', icon: Image },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden hover:bg-secondary">
                    <Menu className="h-5 w-5 text-muted-foreground" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 border-r border-border/50 glass">
                <SheetHeader className="p-6 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                            <span className="text-xl">🏔️</span>
                        </div>
                        <div className="text-left">
                            <SheetTitle className="text-lg font-bold text-foreground">Peaks & Pixels</SheetTitle>
                            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
                        </div>
                    </div>
                </SheetHeader>

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
                                        onClick={() => setOpen(false)}
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
                <div className="border-t border-border/50 p-6 bg-secondary/20">
                    <SignOutButton />
                </div>
            </SheetContent>
        </Sheet>
    );
}
