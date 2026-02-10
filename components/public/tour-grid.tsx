import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface TourGridProps {
    difficulty?: string;
    duration?: string;
    search?: string;
    page: number;
}

const ITEMS_PER_PAGE = 9;


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

export async function TourGrid({ difficulty, duration, search, page }: TourGridProps) {
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from('tours')
        .select('id, slug, name, tagline, difficulty, duration_minutes, location_area, base_price, cover_image', { count: 'exact' })
        .eq('status', 'active');

    // Apply filters
    if (difficulty) {
        query = query.eq('difficulty', difficulty);
    }

    if (duration) {
        // Convert days to minutes (8 hours = 480 minutes per day)
        if (duration === '1') {
            query = query.lte('duration_minutes', 480);
        } else if (duration === '2-3') {
            query = query.gt('duration_minutes', 480).lte('duration_minutes', 1440);
        } else if (duration === '4+') {
            query = query.gt('duration_minutes', 1440);
        }
    }

    if (search) {
        query = query.ilike('name', `%${search}%`);
    }

    // Pagination
    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: dbTours, count, error } = await query;

    // Log error for debugging
    if (error) {
        console.error('Tours query error:', error);
    }

    // Show actual DB data (no placeholder fallback)
    const tours = dbTours || [];
    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    if (tours.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <span className="text-3xl">🏔️</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No tours found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-6">
                Showing {tours.length} of {totalCount} tours
            </p>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tours.map((tour) => (
                    <Link
                        key={tour.id}
                        href={`/tours/${tour.slug}`}
                        className="group relative rounded-2xl border border-border/50 bg-card overflow-hidden card-hover"
                    >
                        {/* Image */}
                        <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                            {tour.cover_image ? (
                                <img
                                    src={tour.cover_image}
                                    alt={tour.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-6xl">🏔️</span>
                                </div>
                            )}
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
                                {tour.tagline}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {tour.location_area}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {tour.duration_minutes <= 480
                                        ? `${Math.round(tour.duration_minutes / 60)}h`
                                        : `${Math.ceil(tour.duration_minutes / 480)} day${Math.ceil(tour.duration_minutes / 480) !== 1 ? 's' : ''}`}
                                </span>
                            </div>

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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page <= 1}
                        className="rounded-xl"
                        asChild={page > 1}
                    >
                        {page > 1 ? (
                            <Link href={`/tours?page=${page - 1}${difficulty ? `&difficulty=${difficulty}` : ''}${duration ? `&duration=${duration}` : ''}${search ? `&search=${search}` : ''}`}>
                                <ChevronLeft className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span><ChevronLeft className="h-4 w-4" /></span>
                        )}
                    </Button>

                    <span className="px-4 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={page >= totalPages}
                        className="rounded-xl"
                        asChild={page < totalPages}
                    >
                        {page < totalPages ? (
                            <Link href={`/tours?page=${page + 1}${difficulty ? `&difficulty=${difficulty}` : ''}${duration ? `&duration=${duration}` : ''}${search ? `&search=${search}` : ''}`}>
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <span><ChevronRight className="h-4 w-4" /></span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
