'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import {
    DollarSign, TrendingUp, Calendar, Mountain,
    Loader2
} from 'lucide-react';

interface OperatorStats {
    tours: { total: number; active: number; draft: number };
    upcomingInstances: number;
    bookings: { thisMonth: number; pending: number; confirmed: number };
    revenue: { thisMonth: number; total: number };
}

interface Booking {
    id: string;
    reference: string;
    total_amount: number;
    booking_status: string;
    payment_status: string;
    lead_participant_name: string;
    created_at: string;
    tour_instance: {
        id: string;
        start_datetime: string;
        tour: {
            id: string;
            name: string;
        };
    } | null;
}

export default function DashboardEarningsPage() {
    const [stats, setStats] = useState<OperatorStats | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('/api/operator/stats').then(r => r.json()),
            fetch('/api/operator/bookings?limit=20').then(r => r.json()),
        ])
            .then(([statsData, bookingsData]) => {
                setStats(statsData);
                setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const paidBookings = bookings.filter(b =>
        b.payment_status === 'paid' || b.payment_status === 'completed'
    );

    // Group revenue by tour
    const revenueByTour: Record<string, { name: string; revenue: number; count: number }> = {};
    for (const booking of paidBookings) {
        const tourName = booking.tour_instance?.tour?.name || 'Unknown Tour';
        const tourId = booking.tour_instance?.tour?.id || 'unknown';
        if (!revenueByTour[tourId]) {
            revenueByTour[tourId] = { name: tourName, revenue: 0, count: 0 };
        }
        revenueByTour[tourId].revenue += Number(booking.total_amount);
        revenueByTour[tourId].count += 1;
    }

    const tourBreakdown = Object.values(revenueByTour).sort((a, b) => b.revenue - a.revenue);

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
                <p className="text-muted-foreground">Track your revenue and completed bookings</p>
            </div>

            {/* Revenue Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Revenue This Month"
                    value={`€${(stats?.revenue.thisMonth || 0).toLocaleString()}`}
                    icon={DollarSign}
                />
                <StatCard
                    title="Total Revenue"
                    value={`€${(stats?.revenue.total || 0).toLocaleString()}`}
                    icon={TrendingUp}
                />
                <StatCard
                    title="Confirmed Bookings"
                    value={stats?.bookings.confirmed.toString() || '0'}
                    icon={Calendar}
                    description={`${stats?.bookings.pending || 0} pending`}
                />
            </div>

            {/* Revenue by Tour */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Mountain className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Revenue by Tour</h3>
                            <p className="text-xs text-muted-foreground">Breakdown of completed bookings</p>
                        </div>
                    </div>
                </div>

                <div className="p-2">
                    {tourBreakdown.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <div className="mx-auto h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                                <DollarSign className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-foreground font-medium">No earnings yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Revenue will appear here once bookings are paid
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {tourBreakdown.map((tour) => (
                                <div
                                    key={tour.name}
                                    className="flex items-center justify-between rounded-xl p-4 hover:bg-secondary/50 transition-apple"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
                                            <Mountain className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{tour.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {tour.count} booking{tour.count !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-foreground">
                                            &euro;{tour.revenue.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Paid Bookings */}
            <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border/50">
                    <h3 className="text-base font-semibold text-foreground">Recent Paid Bookings</h3>
                    <p className="text-xs text-muted-foreground">Completed transactions</p>
                </div>
                <div className="p-2">
                    {paidBookings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No paid bookings yet
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {paidBookings.slice(0, 10).map((booking) => (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between rounded-xl p-4 hover:bg-secondary/50 transition-apple"
                                >
                                    <div>
                                        <p className="font-medium text-foreground">{booking.lead_participant_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.reference} • {booking.tour_instance?.tour?.name || 'Unknown'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-foreground">&euro;{Number(booking.total_amount).toFixed(0)}</p>
                                        <Badge className="bg-green-400/10 text-green-400 border-green-400/20 border text-xs">
                                            Paid
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
