import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Calendar, MapPin } from 'lucide-react';
import { DeleteTourButton } from '@/components/admin/delete-tour-button';

// Placeholder tours for when database is empty
const placeholderTours = [
    {
        id: '1',
        slug: 'matka-canyon-adventure',
        name: 'Matka Canyon Adventure',
        tagline: 'A stunning day hike through the beautiful Matka Canyon.',
        difficulty: 'moderate',
        duration_minutes: 480,
        location_area: 'Matka, Macedonia',
        base_price: 89,
        status: 'active',
        is_featured: true,
        cover_image: null as string | null,
    },
    {
        id: '2',
        slug: 'sharr-mountain-expedition',
        name: 'Sharr Mountain Expedition',
        tagline: 'Multi-day trek through the majestic Sharr Mountains.',
        difficulty: 'hard',
        duration_minutes: 1440,
        location_area: 'Sharr Mountains',
        base_price: 299,
        status: 'active',
        is_featured: false,
        cover_image: null as string | null,
    },
];

function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
        case 'easy': return 'bg-green-400/10 text-green-400 border-green-400/20';
        case 'moderate': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case 'hard': return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
        case 'expert': return 'bg-red-400/10 text-red-400 border-red-400/20';
        default: return 'bg-muted text-muted-foreground border-border';
    }
}

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-green-400/10 text-green-400 border-green-400/20';
        case 'draft': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case 'archived': return 'bg-muted text-muted-foreground border-border';
        default: return 'bg-muted text-muted-foreground border-border';
    }
}

export default async function AdminToursPage() {
    // Use admin client to bypass RLS and see all tours including drafts
    const supabase = createAdminClient();

    const { data: dbTours, error } = await supabase
        .from('tours')
        .select('id, slug, name, tagline, difficulty, duration_minutes, location_area, base_price, status, is_featured, cover_image')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching tours:', error);
    }

    const tours = (dbTours && dbTours.length > 0) ? dbTours : placeholderTours;

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tours</h1>
                    <p className="text-muted-foreground">Manage your tour offerings</p>
                </div>
                <Button className="gradient-primary text-white rounded-xl glow-hover" asChild>
                    <Link href="/admin/tours/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tour
                    </Link>
                </Button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-2xl font-bold text-foreground">{tours.length}</p>
                    <p className="text-sm text-muted-foreground">Total Tours</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-2xl font-bold text-green-400">{tours.filter(t => t.status === 'active').length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-2xl font-bold text-amber-400">{tours.filter(t => t.status === 'draft').length}</p>
                    <p className="text-sm text-muted-foreground">Draft</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50">
                    <p className="text-2xl font-bold text-primary">{tours.filter(t => t.is_featured).length}</p>
                    <p className="text-sm text-muted-foreground">Featured</p>
                </div>
            </div>

            {/* Tours grid */}
            {tours.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-border">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <span className="text-3xl">🏔️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No tours yet</h3>
                    <p className="text-muted-foreground mb-6">Get started by creating your first tour.</p>
                    <Button className="gradient-primary text-white rounded-xl" asChild>
                        <Link href="/admin/tours/new">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Tour
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tours.map((tour) => (
                        <div key={tour.id} className="rounded-2xl border border-border/50 bg-card overflow-hidden card-hover">
                            {/* Image or gradient placeholder */}
                            <div className={`h-32 relative ${!tour.cover_image ? `bg-gradient-to-br ${tour.difficulty === 'easy' ? 'from-green-400/30 to-emerald-500/30' :
                                    tour.difficulty === 'moderate' ? 'from-amber-400/30 to-orange-500/30' :
                                        tour.difficulty === 'hard' ? 'from-orange-400/30 to-red-500/30' :
                                            'from-primary/30 to-accent/30'
                                }` : ''}`}>
                                {tour.cover_image ? (
                                    <img
                                        src={tour.cover_image}
                                        alt={tour.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-4xl">🏔️</span>
                                    </div>
                                )}
                                {/* Badges */}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <Badge className={`${getStatusColor(tour.status)} border capitalize text-xs`}>
                                        {tour.status}
                                    </Badge>
                                    {tour.is_featured && (
                                        <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">
                                            Featured
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{tour.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tour.tagline || 'No description'}</p>

                                {/* Meta */}
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {tour.location_area || 'TBD'}
                                    </span>
                                    <Badge className={`${getDifficultyColor(tour.difficulty)} border capitalize text-xs`}>
                                        {tour.difficulty}
                                    </Badge>
                                    <span>€{tour.base_price}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 rounded-lg" asChild>
                                        <Link href={`/tours/${tour.slug}`} target="_blank">
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            Preview
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-lg" asChild>
                                        <Link href={`/admin/tours/${tour.id}/edit`}>
                                            <Edit className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-lg" asChild>
                                        <Link href={`/admin/tours/${tour.id}/schedule`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <DeleteTourButton tourId={tour.id} tourName={tour.name} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

