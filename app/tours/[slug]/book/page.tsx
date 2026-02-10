import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { BookingForm } from '@/components/public/booking-form';
import { ArrowLeft, Shield, Clock, CreditCard, Calendar, MapPin, Users, Star } from 'lucide-react';

interface BookingPageProps {
    params: Promise<{ slug: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch tour with correct column names
    const { data: tour, error: tourError } = await supabase
        .from('tours')
        .select('id, slug, name, tagline, duration_minutes, base_price, max_participants, cover_image, location_area, difficulty')
        .eq('slug', slug)
        .eq('status', 'active')
        .single();

    if (tourError || !tour) {
        console.error('Tour fetch error:', tourError);
        notFound();
    }

    // Fetch available dates (tour instances)
    const { data: instances } = await supabase
        .from('tour_instances')
        .select('id, start_datetime, capacity_max, capacity_booked')
        .eq('tour_id', tour.id)
        .eq('status', 'scheduled')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(20);

    // Transform to available dates format
    const availableDates = (instances || [])
        .filter(inst => inst.capacity_max - inst.capacity_booked > 0)
        .map(inst => ({
            id: inst.id,
            date: inst.start_datetime.split('T')[0],
            time: inst.start_datetime,
            spots_left: inst.capacity_max - inst.capacity_booked,
        }));

    // Format duration for display
    const durationDisplay = tour.duration_minutes <= 480
        ? `${Math.round(tour.duration_minutes / 60)} hours`
        : `${Math.ceil(tour.duration_minutes / 480)} day${Math.ceil(tour.duration_minutes / 480) !== 1 ? 's' : ''}`;

    return (
        <>

            {/* Hero Header */}
            <section className="pt-24 lg:pt-28 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
                <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute top-20 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Link
                        href={`/tours/${slug}`}
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-apple mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tour Details
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* Tour Image */}
                        <div className="lg:w-32 lg:h-32 w-full h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex-shrink-0">
                            {tour.cover_image ? (
                                <img src={tour.cover_image} alt={tour.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl">🏔️</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                                Book: {tour.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {tour.location_area || 'Macedonia'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {durationDisplay}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Max {tour.max_participants} people
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking content */}
            <section className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            {availableDates.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-foreground mb-2">No Dates Available</h3>
                                    <p className="text-muted-foreground mb-6">
                                        This tour doesn't have any upcoming scheduled dates yet.
                                        Check back later or contact us for private booking.
                                    </p>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                                    >
                                        Contact Us
                                    </Link>
                                </div>
                            ) : (
                                <BookingForm
                                    tour={{
                                        id: tour.id,
                                        slug: tour.slug,
                                        name: tour.name,
                                        base_price: tour.base_price,
                                        max_participants: tour.max_participants,
                                    }}
                                    availableDates={availableDates}
                                />
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Order summary */}
                                <div className="rounded-2xl border border-border/50 bg-card p-6">
                                    <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>

                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tour</span>
                                            <span className="text-foreground font-medium text-right max-w-[150px] truncate">{tour.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Duration</span>
                                            <span className="text-foreground">{durationDisplay}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Price per person</span>
                                            <span className="text-foreground font-semibold">€{tour.base_price}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-border/50 mt-4 pt-4">
                                        <p className="text-xs text-muted-foreground">
                                            Final price will be calculated based on number of participants
                                        </p>
                                    </div>
                                </div>

                                {/* Available dates summary */}
                                <div className="rounded-2xl border border-border/50 bg-card p-6">
                                    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Available Dates
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {availableDates.length > 0 ? (
                                            <>
                                                <span className="text-2xl font-bold text-primary">{availableDates.length}</span> upcoming date{availableDates.length !== 1 ? 's' : ''} available
                                            </>
                                        ) : (
                                            'No dates currently scheduled'
                                        )}
                                    </p>
                                </div>

                                {/* Trust badges */}
                                <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Free Cancellation</p>
                                            <p className="text-xs text-muted-foreground">Cancel up to 48h before for full refund</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="h-5 w-5 text-primary mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Instant Confirmation</p>
                                            <p className="text-xs text-muted-foreground">Receive booking confirmation immediately</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <CreditCard className="h-5 w-5 text-accent mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Secure Payment</p>
                                            <p className="text-xs text-muted-foreground">256-bit SSL encrypted checkout</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Star className="h-5 w-5 text-amber-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Highly Rated</p>
                                            <p className="text-xs text-muted-foreground">4.9/5 based on 200+ reviews</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
