import Link from 'next/link';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar, MapPin, Users, ArrowLeft, Clock, Download,
    Phone, Mail, AlertCircle, CheckCircle, XCircle, User
} from 'lucide-react';

interface BookingDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get booking details
    const { data: booking, error } = await supabase
        .from('bookings')
        .select(`
            *,
            tour_instance:tour_instances (
                id,
                start_datetime,
                end_datetime,
                tour:tours (
                    id,
                    name,
                    slug,
                    cover_image,
                    location_area,
                    difficulty,
                    meeting_point,
                    whats_included,
                    what_to_bring
                )
            )
        `)
        .eq('id', id)
        .eq('customer_id', user.id)
        .single();

    if (error || !booking) {
        notFound();
    }

    const tour = booking.tour_instance?.tour;
    const instance = booking.tour_instance;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed':
                return {
                    color: 'bg-green-400/10 text-green-400 border-green-400/20',
                    icon: CheckCircle,
                    label: 'Confirmed'
                };
            case 'pending_payment':
                return {
                    color: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
                    icon: AlertCircle,
                    label: 'Pending Payment'
                };
            case 'completed':
                return {
                    color: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
                    icon: CheckCircle,
                    label: 'Completed'
                };
            case 'cancelled':
                return {
                    color: 'bg-red-400/10 text-red-400 border-red-400/20',
                    icon: XCircle,
                    label: 'Cancelled'
                };
            default:
                return {
                    color: 'bg-muted text-muted-foreground border-border',
                    icon: AlertCircle,
                    label: status
                };
        }
    };

    const statusConfig = getStatusConfig(booking.booking_status);
    const StatusIcon = statusConfig.icon;

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

    return (
        <div className="space-y-6 fade-in">
            {/* Back Button */}
            <Link
                href="/account/bookings"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Bookings
            </Link>

            {/* Hero / Ticket Card */}
            <div className="rounded-3xl overflow-hidden border border-border/50 bg-card">
                {/* Cover Image */}
                <div className="h-48 relative">
                    {tour?.cover_image ? (
                        <img
                            src={tour.cover_image}
                            alt={tour.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                            <span className="text-6xl">🏔️</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent" />

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                        <Badge className={`${statusConfig.color} border text-sm px-3 py-1`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusConfig.label}
                        </Badge>
                    </div>
                </div>

                {/* Ticket Content */}
                <div className="p-6 -mt-8 relative">
                    <h1 className="text-2xl font-bold text-foreground mb-2">{tour?.name || 'Tour'}</h1>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {instance?.start_datetime ? formatDate(instance.start_datetime) : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {instance?.start_datetime ? formatTime(instance.start_datetime) : 'TBD'}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {tour?.location_area || 'TBD'}
                        </span>
                    </div>

                    {/* Booking Reference */}
                    <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Booking Reference</p>
                                <p className="text-2xl font-mono font-bold text-primary">{booking.reference}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold text-foreground">€{booking.total_amount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Guests */}
                    <div className="space-y-3 mb-6">
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Guests ({booking.participant_count})
                        </h3>
                        <div className="p-4 rounded-xl bg-secondary/20 border border-border/30">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{booking.lead_participant_name}</p>
                                    <p className="text-sm text-muted-foreground">Lead participant</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meeting Point */}
                    {tour?.meeting_point && (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Meeting Point
                            </h3>
                            <p className="text-muted-foreground">{tour.meeting_point}</p>
                        </div>
                    )}

                    {/* What to Bring */}
                    {tour?.what_to_bring && tour.what_to_bring.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-foreground mb-3">What to Bring</h3>
                            <ul className="grid sm:grid-cols-2 gap-2">
                                {tour.what_to_bring.map((item: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="pt-6 border-t border-border/50">
                        <h3 className="font-semibold text-foreground mb-3">Contact Information</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {booking.lead_participant_email}
                            </span>
                            <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {booking.lead_participant_phone}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
                {tour?.slug && (
                    <Button variant="outline" className="rounded-xl" asChild>
                        <Link href={`/tours/${tour.slug}`}>
                            View Tour Details
                        </Link>
                    </Button>
                )}
                {booking.booking_status === 'pending_payment' && (
                    <Button className="gradient-primary text-white rounded-xl">
                        Complete Payment
                    </Button>
                )}
            </div>
        </div>
    );
}
