import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TourRouteSection } from '@/components/public/tour-route-section';
import {
    MapPin, Clock, Users, Mountain, Calendar,
    ArrowLeft, Shield, Camera, Check, Star
} from 'lucide-react';

interface TourDetailPageProps {
    params: Promise<{ slug: string }>;
}


function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case 'easy': return 'bg-green-400/10 text-green-400 border-green-400/20';
        case 'moderate': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case 'hard': return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
        case 'expert': return 'bg-red-400/10 text-red-400 border-red-400/20';
        default: return 'bg-muted text-muted-foreground border-border';
    }
}

export default async function TourDetailPage({ params }: TourDetailPageProps) {
    const { slug } = await params;
    // Use admin client so we can preview draft tours
    const supabase = createAdminClient();

    const { data: dbTour } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .single();

    if (!dbTour) {
        notFound();
    }

    const tour = dbTour;

    // Fetch reviews for this tour
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            id, rating, content, created_at,
            customer:users!reviews_customer_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('tour_id', tour.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

    const tourReviews = reviews || [];
    const avgRating = tourReviews.length > 0
        ? (tourReviews.reduce((sum, r) => sum + r.rating, 0) / tourReviews.length).toFixed(1)
        : null;

    // Parse included/not_included arrays
    const included = Array.isArray(tour.whats_included) ? tour.whats_included : [];
    const notIncluded = Array.isArray(tour.whats_not_included) ? tour.whats_not_included : [];
    const itinerary = Array.isArray(tour.itinerary) ? tour.itinerary : [];

    return (
        <>
            {/* Hero */}
            <section className="pt-24 lg:pt-28 pb-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
                <div className="absolute top-20 right-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <Link
                        href="/tours"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-apple mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tours
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className={`${getDifficultyColor(tour.difficulty)} border capitalize`}>
                            {tour.difficulty}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                            {tour.location_area}
                        </span>
                        {/* Rating */}
                        {avgRating && (
                            <div className="flex items-center gap-1 text-sm">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                <span className="font-medium">{avgRating}</span>
                                <span className="text-muted-foreground">({tourReviews.length} review{tourReviews.length !== 1 ? 's' : ''})</span>
                            </div>
                        )}
                    </div>

                    <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">
                        {tour.name}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        {tour.tagline || tour.short_description}
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 lg:py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Main content */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Cover Image or Placeholder */}
                            <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                                {tour.cover_image ? (
                                    <img src={tour.cover_image} alt={tour.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-8xl">🏔️</span>
                                )}
                            </div>

                            {/* Quick info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 text-center">
                                    <Clock className="h-5 w-5 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Duration</p>
                                    <p className="font-semibold text-foreground">
                                        {tour.duration_days} day{tour.duration_days !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 text-center">
                                    <Mountain className="h-5 w-5 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Difficulty</p>
                                    <p className="font-semibold text-foreground capitalize">{tour.difficulty}</p>
                                </div>
                                <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 text-center">
                                    <Users className="h-5 w-5 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Group Size</p>
                                    <p className="font-semibold text-foreground">Max {tour.max_participants || 12}</p>
                                </div>
                                <div className="p-3 sm:p-4 rounded-xl bg-card border border-border/50 text-center">
                                    <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Location</p>
                                    <p className="font-semibold text-foreground truncate">{tour.location_area}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-4">About This Tour</h2>
                                <div className="prose prose-neutral dark:prose-invert max-w-none">
                                    {(tour.description || '').split('\n\n').map((paragraph: string, i: number) => (
                                        <p key={i} className="text-muted-foreground mb-4">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Route Section - Interactive Map */}
                            {tour.route_data && (
                                <TourRouteSection tourId={tour.id} tourSlug={tour.slug} />
                            )}

                            {/* Itinerary */}
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-6">Itinerary</h2>
                                <div className="space-y-4">
                                    {itinerary.map((item: { time: string; title: string; description: string }, i: number) => (
                                        <div key={i} className="flex gap-4 p-4 rounded-xl bg-card border border-border/50">
                                            <div className="flex-shrink-0 w-16 text-center">
                                                <span className="text-sm font-semibold text-primary">{item.time}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">{item.title}</h3>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Included / Not included */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <Check className="h-5 w-5 text-green-400" />
                                        What's Included
                                    </h3>
                                    <ul className="space-y-2">
                                        {included.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                                        <span className="text-muted-foreground">✕</span>
                                        Not Included
                                    </h3>
                                    <ul className="space-y-2">
                                        {notIncluded.map((item: string, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="text-muted-foreground mt-0.5 flex-shrink-0">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            {tourReviews.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-bold text-foreground">Reviews</h2>
                                        {avgRating && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`h-5 w-5 ${star <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />
                                                    ))}
                                                </div>
                                                <span className="font-semibold">{avgRating}</span>
                                                <span className="text-muted-foreground">({tourReviews.length} review{tourReviews.length !== 1 ? 's' : ''})</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {tourReviews.map((review) => {
                                            const customer = review.customer as { first_name: string; last_name: string; avatar_url: string | null } | null;
                                            const name = customer ? `${customer.first_name} ${customer.last_name?.[0] || ''}.` : 'Guest';
                                            const timeAgo = new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                                            return (
                                                <div key={review.id} className="p-6 rounded-xl bg-card border border-border/50">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                                <span className="font-semibold text-primary">{name[0]}</span>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">{name}</p>
                                                                <p className="text-sm text-muted-foreground">{timeAgo}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`h-4 w-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-muted-foreground">{review.content}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Booking card */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-border/50 bg-card p-6 space-y-6">
                                {/* Price */}
                                <div className="text-center pb-6 border-b border-border/50">
                                    <p className="text-sm text-muted-foreground">From</p>
                                    <p className="text-4xl font-bold text-foreground">€{tour.base_price}</p>
                                    <p className="text-sm text-muted-foreground">per person</p>
                                </div>

                                {/* CTA */}
                                <Button
                                    size="lg"
                                    className="w-full h-14 gradient-primary text-white rounded-xl text-base font-medium glow-hover"
                                    asChild
                                >
                                    <Link href={`/tours/${slug}/book`}>
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Check Availability
                                    </Link>
                                </Button>

                                {/* Trust badges */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4 text-green-400" />
                                        Free cancellation up to 48h before
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Users className="h-4 w-4 text-primary" />
                                        Small groups, max {tour.max_participants || 12} people
                                    </div>
                                    {(tour.photo_opportunities !== false) && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Camera className="h-4 w-4 text-accent" />
                                            Photo opportunities included
                                        </div>
                                    )}
                                </div>

                                {/* Contact */}
                                <div className="pt-4 border-t border-border/50 text-center">
                                    <p className="text-sm text-muted-foreground mb-2">Have questions?</p>
                                    <Link
                                        href="/contact"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Contact us
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile sticky booking bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border/50 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-xl font-bold text-foreground">€{tour.base_price}</p>
                    </div>
                    <Button
                        size="lg"
                        className="h-12 px-6 gradient-primary text-white rounded-xl text-sm font-medium glow-hover"
                        asChild
                    >
                        <Link href={`/tours/${slug}/book`}>
                            <Calendar className="mr-2 h-4 w-4" />
                            Check Availability
                        </Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

