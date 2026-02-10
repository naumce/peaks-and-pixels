import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
    Search, Inbox, Calendar, Users, MapPin,
    Mountain, Bell, FileQuestion, Heart, Bookmark
} from 'lucide-react';

interface EmptyStateProps {
    icon?: 'search' | 'inbox' | 'calendar' | 'users' | 'location' | 'mountain' | 'notifications' | 'help' | 'favorites' | 'bookmarks' | 'custom';
    customIcon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    secondaryAction?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

const iconMap = {
    search: Search,
    inbox: Inbox,
    calendar: Calendar,
    users: Users,
    location: MapPin,
    mountain: Mountain,
    notifications: Bell,
    help: FileQuestion,
    favorites: Heart,
    bookmarks: Bookmark,
    custom: null,
};

export function EmptyState({
    icon = 'inbox',
    customIcon,
    title,
    description,
    action,
    secondaryAction,
    className,
}: EmptyStateProps) {
    const IconComponent = iconMap[icon];

    return (
        <div className={cn(
            'flex flex-col items-center justify-center text-center py-16 px-6',
            className
        )}>
            {/* Icon */}
            <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center">
                    {customIcon ? (
                        customIcon
                    ) : IconComponent ? (
                        <IconComponent className="h-10 w-10 text-muted-foreground/60" />
                    ) : (
                        <span className="text-4xl">📭</span>
                    )}
                </div>
                {/* Decorative circles */}
                <div className="absolute -inset-3 border border-dashed border-border/50 rounded-full" />
                <div className="absolute -inset-6 border border-dashed border-border/30 rounded-full" />
            </div>

            {/* Text */}
            <h3 className="text-xl font-semibold text-foreground mb-2">
                {title}
            </h3>
            {description && (
                <p className="text-muted-foreground max-w-sm mb-6">
                    {description}
                </p>
            )}

            {/* Actions */}
            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {action && (
                        action.href ? (
                            <Button asChild>
                                <Link href={action.href}>{action.label}</Link>
                            </Button>
                        ) : (
                            <Button onClick={action.onClick}>
                                {action.label}
                            </Button>
                        )
                    )}
                    {secondaryAction && (
                        secondaryAction.href ? (
                            <Button variant="outline" asChild>
                                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={secondaryAction.onClick}>
                                {secondaryAction.label}
                            </Button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
