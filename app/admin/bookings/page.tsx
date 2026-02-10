'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search, Filter, Calendar, Users, MapPin, ArrowRight,
    Loader2, RefreshCw, Check, X, Clock, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Booking {
    id: string;
    reference: string;
    participant_count: number;
    total_amount: number;
    booking_status: string;
    payment_status: string;
    lead_participant_name: string;
    lead_participant_email: string;
    created_at: string;
    tour_instance: {
        id: string;
        start_datetime: string;
        tour: {
            id: string;
            name: string;
            slug: string;
        };
    } | null;
}

const STATUS_FILTERS = [
    { value: 'all', label: 'All Bookings' },
    { value: 'pending_payment', label: 'Pending Payment' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminBookingsPage() {
    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadBookings();
    }, [statusFilter]);

    const loadBookings = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/bookings?${params}`);
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error loading bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadBookings();
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed':
                return { color: 'bg-green-400/10 text-green-400 border-green-400/20', icon: Check };
            case 'pending_payment':
                return { color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: Clock };
            case 'completed':
                return { color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: Check };
            case 'cancelled':
                return { color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: X };
            case 'no_show':
                return { color: 'bg-muted text-muted-foreground border-border', icon: AlertCircle };
            default:
                return { color: 'bg-muted text-muted-foreground border-border', icon: AlertCircle };
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Bookings</h1>
                    <p className="text-muted-foreground">Manage customer reservations</p>
                </div>
                <Button onClick={loadBookings} variant="outline" className="rounded-xl">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setStatusFilter(filter.value)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                                statusFilter === filter.value
                                    ? 'bg-primary text-white'
                                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by reference or name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 rounded-xl"
                        />
                    </div>
                    <Button type="submit" className="rounded-xl">Search</Button>
                </form>
            </div>

            {/* Bookings List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : bookings.length === 0 ? (
                <div className="p-12 rounded-2xl border border-dashed border-border text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
                    <p className="text-muted-foreground">
                        {statusFilter !== 'all'
                            ? `No ${statusFilter.replace('_', ' ')} bookings`
                            : 'Bookings will appear here when customers make reservations'}
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/50 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary/30 border-b border-border/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reference</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Tour</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                                <th className="text-center p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Guests</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {bookings.map((booking) => {
                                const statusConfig = getStatusConfig(booking.booking_status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <tr key={booking.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="p-4">
                                            <span className="font-mono font-medium text-foreground">
                                                {booking.reference}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden md:table-cell">
                                            <span className="text-foreground truncate max-w-[200px] block">
                                                {booking.tour_instance?.tour?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="p-4 hidden lg:table-cell">
                                            <div className="text-sm">
                                                <p className="text-foreground">
                                                    {booking.tour_instance?.start_datetime
                                                        ? formatDate(booking.tour_instance.start_datetime)
                                                        : '—'}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {booking.tour_instance?.start_datetime
                                                        ? formatTime(booking.tour_instance.start_datetime)
                                                        : ''}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-foreground font-medium truncate max-w-[150px]">
                                                    {booking.lead_participant_name}
                                                </p>
                                                <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                                                    {booking.lead_participant_email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center hidden sm:table-cell">
                                            <span className="inline-flex items-center gap-1 text-foreground">
                                                <Users className="w-4 h-4" />
                                                {booking.participant_count}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge className={`${statusConfig.color} border capitalize text-xs`}>
                                                <StatusIcon className="w-3 h-3 mr-1" />
                                                {booking.booking_status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className="font-semibold text-foreground">
                                                €{booking.total_amount}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Button variant="ghost" size="icon" className="rounded-lg" asChild>
                                                <Link href={`/admin/bookings/${booking.id}`}>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
