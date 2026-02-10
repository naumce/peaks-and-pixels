import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description?: string;
    trend?: number;
    trendIcon?: LucideIcon;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    trendIcon: TrendIcon,
}: StatCardProps) {
    const isPositive = trend !== undefined && trend >= 0;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-apple card-hover">
            {/* Subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-apple" />

            {/* Content */}
            <div className="relative">
                <div className="flex items-start justify-between">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">{title}</span>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
                            {trend !== undefined && TrendIcon && (
                                <div
                                    className={cn(
                                        'flex items-center gap-0.5 text-sm font-semibold px-2 py-0.5 rounded-full',
                                        isPositive
                                            ? 'text-green-400 bg-green-400/10'
                                            : 'text-red-400 bg-red-400/10'
                                    )}
                                >
                                    <TrendIcon className="h-3.5 w-3.5" />
                                    <span>{Math.abs(trend)}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-apple">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>

                {description && (
                    <p className="mt-3 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
        </div>
    );
}
