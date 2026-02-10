'use client';

import { Bell, Search, Sparkles } from 'lucide-react';
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
import { MobileNav } from '@/components/admin/mobile-nav';
import type { DbUser } from '@/types/database';

interface AdminHeaderProps {
    user: DbUser | null;
}

export function AdminHeader({ user }: AdminHeaderProps) {
    const initials = user
        ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`
        : 'U';

    return (
        <header className="sticky top-0 z-40 flex h-20 items-center gap-4 lg:gap-6 glass border-b border-border/50 px-4 lg:px-8">
            {/* Mobile menu button */}
            <MobileNav />

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-apple group-focus-within:text-primary" />
                    <Input
                        placeholder="Search..."
                        className="w-full pl-11 h-10 lg:h-12 bg-secondary/50 border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:bg-secondary focus:border-primary/50 transition-apple text-sm lg:text-base"
                    />
                    <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:inline-flex h-6 items-center gap-1 rounded-md border border-border/50 bg-muted px-2 text-xs text-muted-foreground">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 lg:gap-3">
                {/* AI Assistant button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-primary/10 transition-apple group hidden sm:flex"
                >
                    <Sparkles className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-apple" />
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-10 w-10 rounded-xl hover:bg-secondary transition-apple"
                >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40"></span>
                        <span className="relative flex h-4 w-4 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white">
                            3
                        </span>
                    </span>
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
                                    {user?.role || 'Admin'}
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
                        <DropdownMenuItem className="text-foreground focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer">
                            Profile Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-foreground focus:bg-secondary focus:text-foreground rounded-lg cursor-pointer">
                            Preferences
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
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg cursor-pointer">
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
