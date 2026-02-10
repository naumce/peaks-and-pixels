import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowRight, Ticket, Clock, Plus, Briefcase } from 'lucide-react';

export default async function AccountDashboard() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Get user profile
    const { data: profile } = await supabase
        .from('users')
        .select('first_name, last_name, email, role')
        .eq('id', user.id)
        .single();

    // Get upcoming bookings
    const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select(`
            id,
            reference,
            participant_count,
            total_amount,
            booking_status,
            tour_instance:tour_instances (
                id,
                start_datetime,
                tour:tours (
                    name,
                    slug,
                    cover_image,
                    location_area
                )
            )
        `)
        .eq('customer_id', user.id)
        .in('booking_status', ['confirmed', 'pending_payment'])
        .order('created_at', { ascending: false })
        .limit(3);

    // Get past bookings count
    const { count: pastBookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', user.id)
        .eq('booking_status', 'completed');

    // Get user's clubs
    const { data: memberships } = await supabase
        .from('club_members')
        .select(`
            club:clubs (
                id,
                name,
                slug,
                logo_url,
                member_count
            )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(5);

    const myClubs = memberships?.map(m => m.club).filter(Boolean) || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-400/10 text-green-400 border-green-400/20';
            case 'pending_payment': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'completed': return 'bg-muted text-muted-foreground border-border';
            case 'cancelled': return 'bg-red-400/10 text-red-400 border-red-400/20';
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

    return (
        <div className="space-y-8 fade-in">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Welcome back, {profile?.first_name || 'Adventurer'}! 👋
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    {profile?.email}
                </p>
                <p className="text-muted-foreground mt-2">
                    Here's an overview of your upcoming adventures
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid sm:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">Upcoming</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{upcomingBookings?.length || 0}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{pastBookingsCount || 0}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-accent" />
                        </div>
                        <span className="text-sm text-muted-foreground">Places</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{pastBookingsCount || 0}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">Clubs</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{myClubs.length}</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Upcoming Bookings */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">Upcoming Adventures</h2>
                        <Link href="/account/bookings" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {!upcomingBookings || upcomingBookings.length === 0 ? (
                        <div className="p-12 rounded-2xl border border-dashed border-border text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming adventures</h3>
                            <p className="text-muted-foreground mb-6">Time to plan your next adventure!</p>
                            <Button className="gradient-primary text-white rounded-xl" asChild>
                                <Link href="/tours">
                                    Explore Tours
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {upcomingBookings.map((booking: any) => (
                                <Link
                                    key={booking.id}
                                    href={`/account/bookings/${booking.id}`}
                                    className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                                >
                                    {/* Tour Image */}
                                    <div className="w-full sm:w-32 h-24 rounded-xl overflow-hidden bg-secondary/30 flex-shrink-0">
                                        {booking.tour_instance?.tour?.cover_image ? (
                                            <img
                                                src={booking.tour_instance.tour.cover_image}
                                                alt=""
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="text-3xl">🏔️</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="font-semibold text-foreground truncate">
                                                {booking.tour_instance?.tour?.name || 'Tour'}
                                            </h3>
                                            <Badge className={`${getStatusColor(booking.booking_status)} border capitalize text-xs flex-shrink-0`}>
                                                {booking.booking_status.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
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

                                        <p className="text-sm">
                                            <span className="text-muted-foreground">Ref: </span>
                                            <span className="font-mono text-foreground">{booking.reference}</span>
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="sm:text-right flex-shrink-0">
                                        <p className="text-lg font-bold text-foreground">€{booking.total_amount}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Clubs Sidebar */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-foreground">My Clubs</h2>
                        <Link href="/clubs" className="text-sm text-primary hover:underline flex items-center gap-1">
                            Browse <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                        {myClubs.length === 0 ? (
                            <div className="p-8 text-center">
                                <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">You haven't joined any clubs yet</p>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/clubs">
                                        Discover Clubs
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-border">
                                    {myClubs.map((club: any) => (
                                        <Link
                                            key={club.id}
                                            href={`/clubs/${club.slug}`}
                                            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                {club.logo_url ? (
                                                    <Image
                                                        src={club.logo_url}
                                                        alt=""
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <Users className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{club.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {club.member_count} members
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-border">
                                    <Link
                                        href="/clubs/create"
                                        className="flex items-center justify-center gap-2 p-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create a Club
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Explore More CTA */}
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">Ready for your next adventure?</h3>
                        <p className="text-muted-foreground">Discover stunning landscapes and unforgettable experiences</p>
                    </div>
                    <Button className="gradient-primary text-white rounded-xl glow-hover" asChild>
                        <Link href="/tours">
                            Browse Tours <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Become Operator CTA - only for customers */}
            {profile?.role === 'customer' && (
                <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-primary/10 border border-purple-500/20">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Briefcase className="w-6 h-6 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-foreground mb-1">Want to lead tours?</h3>
                                <p className="text-muted-foreground">Apply to become a tour operator and share your expertise</p>
                            </div>
                        </div>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl" asChild>
                            <Link href="/account/become-operator">
                                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
