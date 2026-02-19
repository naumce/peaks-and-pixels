'use client';

import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardMobileNav } from '@/components/dashboard/mobile-nav';
import { SignOutButton } from '@/components/shared/sign-out-button';
import type { DbUser } from '@/types/database';

interface DashboardHeaderProps {
    user: DbUser | null;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
    const initials = user
        ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        : 'U';

    return (
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 lg:gap-6 glass border-b border-border/50 px-4 lg:px-8">
            {/* Mobile menu button */}
            <DashboardMobileNav />

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-apple group-focus-within:text-primary" />
                    <Input
                        placeholder="Search tours, bookings..."
                        className="w-full pl-11 h-11 lg:h-12 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary/50 transition-apple text-sm lg:text-base"
                    />
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 lg:gap-3">
                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-secondary transition-apple"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                </Button>

                {/* Theme Toggle */}
                <div className="hidden sm:block">
                    <ThemeToggle />
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-border/50 mx-1 hidden sm:block"></div>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 px-2 rounded-xl hover:bg-secondary gap-3 transition-apple">
                            <Avatar className="h-8 w-8 ring-2 ring-border">
                                <AvatarImage src={user?.avatar_url || undefined} alt={user?.first_name || 'User'} />
                                <AvatarFallback className="gradient-primary text-white text-sm font-medium">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-foreground">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    Tour Operator
                                </p>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-border/50" align="end" sideOffset={8}>
                        <DropdownMenuLabel className="text-foreground">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">
                                    {user?.first_name} {user?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem asChild className="text-foreground focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer">
                            <Link href="/dashboard/profile">Profile Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="text-foreground focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer">
                            <Link href="/account">My Account</Link>
                        </DropdownMenuItem>
                        <div className="sm:hidden">
                            <DropdownMenuSeparator className="bg-border/50" />
                            <DropdownMenuItem
                                className="text-foreground focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer"
                                onClick={(e) => e.preventDefault()}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span>Theme</span>
                                    <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator className="bg-border/50" />
                        <DropdownMenuItem asChild className="p-0">
                            <SignOutButton variant="dropdown" />
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
