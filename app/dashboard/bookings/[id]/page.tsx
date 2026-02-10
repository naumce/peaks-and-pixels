'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Calendar, MapPin, Users, Mail, Phone,
    Loader2, Check, Clock, X, AlertCircle
} from 'lucide-react';

interface BookingDetail {
    id: string;
    reference: string;
    participant_count: number;
    total_amount: number;
    booking_status: string;
    payment_status: string;
    lead_participant_name: string;
    lead_participant_email: string;
    lead_participant_phone: string | null;
    special_requests: string | null;
    created_at: string;
    tour_instance: {
        id: string;
        start_datetime: string;
        end_datetime: string;
        capacity_max: number;
        capacity_booked: number;
        status: string;
        tour: {
            id: string;
            name: string;
            slug: string;
            cover_image: string | null;
            location_area: string | null;
        };
    } | null;
    customer: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        phone: string | null;
    } | null;
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'confirmed':
            return { color: 'bg-green-400/10 text-green-400 border-green-400/20', icon: Check, label: 'Confirmed' };
        case 'pending_payment':
            return { color: 'bg-amber-400/10 text-amber-400 border-amber-400/20', icon: Clock, label: 'Pending Payment' };
        case 'completed':
            return { color: 'bg-blue-400/10 text-blue-400 border-blue-400/20', icon: Check, label: 'Completed' };
        case 'cancelled':
            return { color: 'bg-red-400/10 text-red-400 border-red-400/20', icon: X, label: 'Cancelled' };
        default:
            return { color: 'bg-muted text-muted-foreground border-border', icon: AlertCircle, label: status };
    }
}

export default function DashboardBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`/api/operator/bookings/${id}`)
            .then(res => {
                if (!res.ok) throw new Error('Booking not found');
                return res.json();
            })
            .then(data => setBooking(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Booking not found</h2>
                <p className="text-muted-foreground mb-6">{error || 'This booking does not exist or you do not have access.'}</p>
                <Button asChild>
                    <Link href="/dashboard/bookings">Back to Bookings</Link>
                </Button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(booking.booking_status);
    const StatusIcon = statusConfig.icon;
    const tour = booking.tour_instance?.tour;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6 fade-in max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-xl" asChild>
                    <Link href="/dashboard/bookings">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-foreground">Booking {booking.reference}</h1>
                    <p className="text-muted-foreground">
                        Created {formatDate(booking.created_at)}
                    </p>
                </div>
                <Badge className={`${statusConfig.color} border text-sm px-3 py-1`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Tour Info */}
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Tour Details</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Tour</p>
                            <p className="font-medium text-foreground">{tour?.name || 'Unknown'}</p>
                        </div>
                        {tour?.location_area && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{tour.location_area}</span>
                            </div>
                        )}
                        {booking.tour_instance && (
                            <>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>{formatDate(booking.tour_instance.start_datetime)}</span>
                                </div>
                                <div className="text-sm text-muted-foreground ml-6">
                                    {formatTime(booking.tour_instance.start_datetime)} — {formatTime(booking.tour_instance.end_datetime)}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{booking.tour_instance.capacity_booked}/{booking.tour_instance.capacity_max} booked</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Customer Info */}
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Customer</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-muted-foreground">Lead Participant</p>
                            <p className="font-medium text-foreground">{booking.lead_participant_name}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{booking.lead_participant_email}</span>
                        </div>
                        {booking.lead_participant_phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{booking.lead_participant_phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{booking.participant_count} guest{booking.participant_count !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="rounded-2xl border border-border/50 bg-card p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Payment</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Amount</span>
                            <span className="text-xl font-bold text-foreground">&euro;{Number(booking.total_amount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Status</span>
                            <Badge variant="outline" className="capitalize">
                                {booking.payment_status.replace('_', ' ')}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Special Requests */}
                {booking.special_requests && (
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Special Requests</h3>
                        <p className="text-muted-foreground">{booking.special_requests}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
