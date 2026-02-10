import { createClient } from '@/lib/supabase/server';
import { StatCard } from '@/components/admin/stat-card';
import { RecentBookings } from '@/components/admin/recent-bookings';
import { UpcomingTours } from '@/components/admin/upcoming-tours';
import type { DashboardStatsResponse } from '@/types/api';
import {
    DollarSign,
    Calendar,
    Users,
    Mountain,
    TrendingUp,
    TrendingDown,
} from 'lucide-react';

async function getDashboardStats(): Promise<DashboardStatsResponse> {
    const supabase = await createClient();

    // Get booking counts
    const { count: pendingBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_status', 'pending_payment');

    const { count: confirmedBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('booking_status', 'confirmed');

    // Get tour counts
    const { count: activeTours } = await supabase
        .from('tours')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

    // Get customer count
    const { count: totalCustomers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'customer');

    // Calculate revenue (sum of paid bookings)
    const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_amount')
        .eq('payment_status', 'paid') as { data: { total_amount: number }[] | null };

    const totalRevenue = revenueData?.reduce((sum, b) => sum + Number(b.total_amount), 0) || 0;

    return {
        revenue: {
            today: 0, // TODO: Calculate from today's bookings
            thisWeek: 0,
            thisMonth: totalRevenue,
            lastMonth: 0,
            trend: 12.5, // Placeholder
        },
        bookings: {
            pending: pendingBookings || 0,
            confirmed: confirmedBookings || 0,
            completed: 0,
            cancelled: 0,
            totalThisMonth: (pendingBookings || 0) + (confirmedBookings || 0),
        },
        tours: {
            active: activeTours || 0,
            upcomingThisWeek: 0, // TODO: Calculate
            capacityUtilization: 0,
        },
        customers: {
            total: totalCustomers || 0,
            newThisMonth: 0, // TODO: Calculate
        },
    };
}

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">Welcome back! Here&apos;s what&apos;s happening.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Revenue This Month"
                    value={`€${stats.revenue.thisMonth.toLocaleString()}`}
                    icon={DollarSign}
                    trend={stats.revenue.trend}
                    trendIcon={stats.revenue.trend >= 0 ? TrendingUp : TrendingDown}
                />
                <StatCard
                    title="Active Bookings"
                    value={stats.bookings.confirmed.toString()}
                    icon={Calendar}
                    description={`${stats.bookings.pending} pending payment`}
                />
                <StatCard
                    title="Active Tours"
                    value={stats.tours.active.toString()}
                    icon={Mountain}
                    description={`${stats.tours.upcomingThisWeek} this week`}
                />
                <StatCard
                    title="Total Customers"
                    value={stats.customers.total.toString()}
                    icon={Users}
                    trend={15.3}
                    trendIcon={TrendingUp}
                />
            </div>

            {/* Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <RecentBookings />
                <UpcomingTours />
            </div>
        </div>
    );
}
