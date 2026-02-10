'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'circular' | 'text' | 'card';
    width?: string | number;
    height?: string | number;
}

export function Skeleton({
    className,
    variant = 'default',
    width,
    height
}: SkeletonProps) {
    const baseStyles = 'shimmer';

    const variantStyles = {
        default: 'rounded-lg',
        circular: 'rounded-full',
        text: 'rounded h-4',
        card: 'rounded-2xl',
    };

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    return (
        <div
            className={cn(baseStyles, variantStyles[variant], className)}
            style={style}
            aria-hidden="true"
        />
    );
}

// Pre-built skeleton patterns
export function TourCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Skeleton className="aspect-[4/3]" variant="default" />
            <div className="p-5 space-y-3">
                <Skeleton variant="text" className="w-3/4 h-5" />
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-1/2 h-4" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton variant="text" className="w-20 h-4" />
                    <Skeleton variant="text" className="w-16 h-6" />
                </div>
            </div>
        </div>
    );
}

export function ClubCardSkeleton() {
    return (
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <Skeleton className="h-40" variant="default" />
            <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="space-y-2 flex-1">
                        <Skeleton variant="text" className="w-2/3 h-5" />
                        <Skeleton variant="text" className="w-1/3 h-3" />
                    </div>
                </div>
                <Skeleton variant="text" className="w-full h-4" />
                <Skeleton variant="text" className="w-2/3 h-4" />
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="flex items-center gap-4">
            <Skeleton variant="circular" width={56} height={56} />
            <div className="space-y-2">
                <Skeleton variant="text" className="w-32 h-5" />
                <Skeleton variant="text" className="w-24 h-4" />
            </div>
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton variant="text" className="h-4" />
                </td>
            ))}
        </tr>
    );
}

export function NotificationSkeleton() {
    return (
        <div className="p-4 rounded-xl border border-border/50 bg-card">
            <div className="flex gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-2/3 h-4" />
                    <Skeleton variant="text" className="w-full h-3" />
                    <Skeleton variant="text" className="w-1/4 h-3" />
                </div>
            </div>
        </div>
    );
}
