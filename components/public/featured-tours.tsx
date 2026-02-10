import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock } from 'lucide-react';


function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case 'easy':
            return 'bg-green-400/10 text-green-400 border-green-400/20';
        case 'moderate':
            return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case 'hard':
            return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
        case 'expert':
            return 'bg-red-400/10 text-red-400 border-red-400/20';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

export async function FeaturedTours() {
    const supabase = await createClient();

    const { data: dbTours } = await supabase
        .from('tours')
        .select('id, slug, name, short_description, difficulty, duration_days, location_area, base_price, featured_image_url')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

    const tours = dbTours || [];

    // Don't render the section if there are no tours
    if (tours.length === 0) {
        return null;
    }

    return (
        <section className="py-20 lg:py-32 bg-background">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                        Featured Adventures
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Handpicked experiences that showcase the best of Balkan mountain landscapes.
                    </p>
                </div>

                {/* Tours grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tours.map((tour) => (
                        <Link
                            key={tour.id}
                            href={`/tours/${tour.slug}`}
                            className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden card-hover"
                        >
                            {/* Image placeholder */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 relative">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-6xl">🏔️</span>
                                </div>
                                {/* Difficulty badge */}
                                <div className="absolute top-4 left-4">
                                    <Badge className={`${getDifficultyColor(tour.difficulty)} border capitalize`}>
                                        {tour.difficulty}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-apple">
                                    {tour.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                    {tour.short_description}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {tour.location_area}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {tour.duration_days} day{tour.duration_days !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {/* Price and CTA */}
                                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                    <div>
                                        <span className="text-xs text-muted-foreground">From</span>
                                        <p className="text-xl font-bold text-foreground">€{tour.base_price}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-sm font-medium text-primary sm:opacity-0 sm:group-hover:opacity-100 transition-apple">
                                        View Details
                                        <ArrowRight className="h-4 w-4" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View all button */}
                <div className="text-center mt-12">
                    <Button size="lg" variant="outline" className="rounded-xl" asChild>
                        <Link href="/tours">
                            View All Tours
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
