'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/admin/stat-card';
import {
    Mountain,
    Calendar,
    DollarSign,
    CalendarCheck,
    Loader2,
} from 'lucide-react';

interface OperatorStats {
    tours: { total: number; active: number; draft: number };
    upcomingInstances: number;
    bookings: { thisMonth: number; pending: number; confirmed: number };
    revenue: { thisMonth: number; total: number };
}

export function DashboardStatsCards() {
    const [stats, setStats] = useState<OperatorStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/operator/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-2xl border border-border/50 bg-card animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="My Tours"
                value={stats?.tours.active.toString() || '0'}
                icon={Mountain}
                description={`${stats?.tours.draft || 0} drafts`}
            />
            <StatCard
                title="Upcoming Instances"
                value={stats?.upcomingInstances.toString() || '0'}
                icon={CalendarCheck}
                description="Scheduled"
            />
            <StatCard
                title="Bookings This Month"
                value={stats?.bookings.thisMonth.toString() || '0'}
                icon={Calendar}
                description={`${stats?.bookings.pending || 0} pending`}
            />
            <StatCard
                title="Revenue This Month"
                value={`€${(stats?.revenue.thisMonth || 0).toLocaleString()}`}
                icon={DollarSign}
                description={`€${(stats?.revenue.total || 0).toLocaleString()} total`}
            />
        </div>
    );
}
