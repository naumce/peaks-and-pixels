import { Suspense } from 'react';
import { DashboardStatsCards } from '@/components/dashboard/stats-cards';
import { DashboardRecentBookings } from '@/components/dashboard/recent-bookings';
import { DashboardUpcomingInstances } from '@/components/dashboard/upcoming-instances';
import { Loader2 } from 'lucide-react';

function WidgetSkeleton() {
    return <div className="h-64 rounded-2xl border border-border/50 bg-card animate-pulse" />;
}

export default function DashboardOverviewPage() {
    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Overview</h1>
                <p className="text-muted-foreground">Welcome back! Here&apos;s your tour operator summary.</p>
            </div>

            {/* Stats Grid (client component - fetches via API) */}
            <DashboardStatsCards />

            {/* Content Grid (server components - fetch directly from Supabase) */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Suspense fallback={<WidgetSkeleton />}>
                    <DashboardRecentBookings />
                </Suspense>
                <Suspense fallback={<WidgetSkeleton />}>
                    <DashboardUpcomingInstances />
                </Suspense>
            </div>
        </div>
    );
}
