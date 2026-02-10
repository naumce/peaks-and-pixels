'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft, Calendar, Clock, MapPin, Users, Mail, Phone,
    Loader2, Check, X, AlertCircle, RefreshCw, Ban
} from 'lucide-react';

interface Booking {
    id: string;
    reference: string;
    participant_count: number;
    base_price: number;
    total_amount: number;
    booking_status: string;
    payment_status: string;
    lead_participant_name: string;
    lead_participant_email: string;
    lead_participant_phone: string;
    special_requests: string | null;
    dietary_restrictions: string | null;
    created_at: string;
    cancelled_at: string | null;
    cancelled_by: string | null;
    tour_instance: {
        id: string;
        start_datetime: string;
        end_datetime: string;
        tour: {
            id: string;
            name: string;
            slug: string;
            cover_image: string | null;
            location_area: string;
            meeting_point: string;
        };
    } | null;
}

export default function AdminBookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [booking, setBooking] = useState<Booking | null>(null);

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    const loadBooking = async () => {
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}`);
            if (!res.ok) throw new Error('Failed to load booking');
            const data = await res.json();
            setBooking(data);
        } catch (error) {
            console.error('Error loading booking:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to mark this booking as ${newStatus}?`)) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update booking');

            await loadBooking();
        } catch (error) {
            console.error('Error updating booking:', error);
            alert('Failed to update booking');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusConfig = (status: string) => {
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
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
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

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-foreground">Booking not found</h2>
                <Button className="mt-4" asChild>
                    <Link href="/admin/bookings">Back to Bookings</Link>
                </Button>
            </div>
        );
    }

    const statusConfig = getStatusConfig(booking.booking_status);
    const StatusIcon = statusConfig.icon;
    const tour = booking.tour_instance?.tour;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" asChild>
                        <Link href="/admin/bookings">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground font-mono">
                                {booking.reference}
                            </h1>
                            <Badge className={`${statusConfig.color} border text-sm`}>
                                <StatusIcon className="w-4 h-4 mr-1" />
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">
                            Booked on {formatDate(booking.created_at)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={loadBooking}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tour Info */}
                    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
                        {tour?.cover_image && (
                            <div className="h-40 overflow-hidden">
                                <img src={tour.cover_image} alt={tour.name} className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-foreground mb-4">
                                {tour?.name || 'Tour'}
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {booking.tour_instance?.start_datetime
                                            ? formatDate(booking.tour_instance.start_datetime)
                                            : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {booking.tour_instance?.start_datetime
                                            ? formatTime(booking.tour_instance.start_datetime)
                                            : 'TBD'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4" />
                                    <span>{tour?.location_area || 'TBD'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4" />
                                    <span>{booking.participant_count} guests</span>
                                </div>
                            </div>
                            {tour?.meeting_point && (
                                <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                    <p className="text-sm text-muted-foreground">
                                        <strong className="text-foreground">Meeting Point:</strong> {tour.meeting_point}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">Customer Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{booking.lead_participant_name}</p>
                                    <p className="text-sm text-muted-foreground">Lead participant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <a href={`mailto:${booking.lead_participant_email}`} className="hover:text-primary">
                                    {booking.lead_participant_email}
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${booking.lead_participant_phone}`} className="hover:text-primary">
                                    {booking.lead_participant_phone}
                                </a>
                            </div>
                        </div>

                        {(booking.special_requests || booking.dietary_restrictions) && (
                            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                                {booking.special_requests && (
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Special Requests</p>
                                        <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                                    </div>
                                )}
                                {booking.dietary_restrictions && (
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Dietary Restrictions</p>
                                        <p className="text-sm text-muted-foreground">{booking.dietary_restrictions}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">Payment</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{booking.participant_count} × €{booking.base_price}</span>
                                <span className="text-foreground">€{booking.base_price * booking.participant_count}</span>
                            </div>
                        </div>
                        <div className="border-t border-border/50 mt-4 pt-4 flex justify-between">
                            <span className="font-semibold text-foreground">Total</span>
                            <span className="text-xl font-bold text-primary">€{booking.total_amount}</span>
                        </div>
                        <div className="mt-4">
                            <Badge className={booking.payment_status === 'paid'
                                ? 'bg-green-400/10 text-green-400 border-green-400/20 border'
                                : 'bg-amber-400/10 text-amber-400 border-amber-400/20 border'}>
                                Payment: {booking.payment_status}
                            </Badge>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6">
                        <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                        <div className="space-y-2">
                            {booking.booking_status === 'pending_payment' && (
                                <Button
                                    className="w-full rounded-xl bg-green-600 hover:bg-green-700"
                                    onClick={() => updateStatus('confirmed')}
                                    disabled={updating}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Confirmed
                                </Button>
                            )}
                            {booking.booking_status === 'confirmed' && (
                                <Button
                                    className="w-full rounded-xl bg-blue-600 hover:bg-blue-700"
                                    onClick={() => updateStatus('completed')}
                                    disabled={updating}
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Mark as Completed
                                </Button>
                            )}
                            {!['cancelled', 'completed'].includes(booking.booking_status) && (
                                <Button
                                    variant="outline"
                                    className="w-full rounded-xl text-red-500 border-red-500/30 hover:bg-red-500/10"
                                    onClick={() => updateStatus('cancelled')}
                                    disabled={updating}
                                >
                                    <Ban className="w-4 h-4 mr-2" />
                                    Cancel Booking
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Cancellation Info */}
                    {booking.booking_status === 'cancelled' && booking.cancelled_at && (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                            <h3 className="font-semibold text-red-400 mb-2">Cancelled</h3>
                            <p className="text-sm text-muted-foreground">
                                Cancelled on {formatDate(booking.cancelled_at)} by {booking.cancelled_by || 'system'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
