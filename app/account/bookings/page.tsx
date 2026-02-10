import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Calendar, MapPin, Users, ArrowLeft, Search, Filter } from 'lucide-react';

export default async function BookingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get all bookings for this customer
    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id,
            reference,
            participant_count,
            total_amount,
            booking_status,
            created_at,
            tour_instance:tour_instances (
                id,
                start_datetime,
                tour:tours (
                    name,
                    slug,
                    cover_image,
                    location_area,
                    difficulty
                )
            )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-400/10 text-green-400 border-green-400/20';
            case 'pending_payment': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'completed': return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
            case 'cancelled': return 'bg-red-400/10 text-red-400 border-red-400/20';
            case 'no_show': return 'bg-muted text-muted-foreground border-border';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
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

    // Group bookings by status
    const upcomingBookings = bookings?.filter(b => ['confirmed', 'pending_payment'].includes(b.booking_status)) || [];
    const pastBookings = bookings?.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.booking_status)) || [];

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Bookings</h1>
                    <p className="text-muted-foreground">View and manage your tour reservations</p>
                </div>
                <Button className="gradient-primary text-white rounded-xl" asChild>
                    <Link href="/tours">Book New Tour</Link>
                </Button>
            </div>

            {/* Upcoming Section */}
            {upcomingBookings.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Upcoming ({upcomingBookings.length})
                    </h2>
                    <div className="grid gap-4">
                        {upcomingBookings.map((booking: any) => (
                            <Link
                                key={booking.id}
                                href={`/account/bookings/${booking.id}`}
                                className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group hover-scale"
                            >
                                {/* Tour Image */}
                                <div className="w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
                                    {booking.tour_instance?.tour?.cover_image ? (
                                        <img
                                            src={booking.tour_instance.tour.cover_image}
                                            alt=""
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                            <span className="text-3xl">🏔️</span>
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="font-semibold text-foreground">
                                            {booking.tour_instance?.tour?.name || 'Tour'}
                                        </h3>
                                        <Badge className={`${getStatusColor(booking.booking_status)} border capitalize text-xs flex-shrink-0`}>
                                            {booking.booking_status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {booking.tour_instance?.start_datetime
                                                ? formatDate(booking.tour_instance.start_datetime)
                                                : 'TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {booking.tour_instance?.tour?.location_area || 'TBD'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            {booking.participant_count} {booking.participant_count === 1 ? 'guest' : 'guests'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Ref: </span>
                                            <span className="font-mono text-foreground">{booking.reference}</span>
                                        </p>
                                        <p className="text-lg font-bold text-foreground">€{booking.total_amount}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Past Section */}
            {pastBookings.length > 0 && (
                <section>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <span className="text-muted-foreground">Past Bookings</span>
                        <span className="text-sm font-normal text-muted-foreground">({pastBookings.length})</span>
                    </h2>
                    <div className="grid gap-3">
                        {pastBookings.map((booking: any) => (
                            <Link
                                key={booking.id}
                                href={`/account/bookings/${booking.id}`}
                                className="flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/30 hover:border-border/60 transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                                    {booking.tour_instance?.tour?.cover_image ? (
                                        <img
                                            src={booking.tour_instance.tour.cover_image}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-lg">🏔️</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-foreground truncate">
                                        {booking.tour_instance?.tour?.name || 'Tour'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {booking.tour_instance?.start_datetime
                                            ? formatDate(booking.tour_instance.start_datetime)
                                            : 'Unknown date'}
                                    </p>
                                </div>

                                <Badge className={`${getStatusColor(booking.booking_status)} border capitalize text-xs`}>
                                    {booking.booking_status.replace('_', ' ')}
                                </Badge>

                                <span className="text-sm font-medium text-foreground">€{booking.total_amount}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {(!bookings || bookings.length === 0) && (
                <EmptyState
                    icon="calendar"
                    title="No bookings yet"
                    description="Start your adventure by booking your first tour!"
                    action={{ label: 'Explore Tours', href: '/tours' }}
                />
            )}
        </div>
    );
}
