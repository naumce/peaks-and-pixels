'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Calendar, MapPin, Loader2 } from 'lucide-react';
import { DashboardDeleteTourButton } from '@/components/dashboard/delete-tour-button';

interface Tour {
    id: string;
    slug: string;
    name: string;
    tagline: string | null;
    difficulty: string;
    duration_minutes: number;
    location_area: string | null;
    base_price: number;
    status: string;
    cover_image: string | null;
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

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-green-400/10 text-green-400 border-green-400/20';
        case 'draft': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
        case 'archived': return 'bg-muted text-muted-foreground border-border';
        default: return 'bg-muted text-muted-foreground border-border';
    }
}

export default function DashboardToursPage() {
    const [tours, setTours] = useState<Tour[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/operator/tours')
            .then(res => res.json())
            .then(data => setTours(Array.isArray(data) ? data : []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">My Tours</h1>
                    <p className="text-muted-foreground">Create and manage your tour offerings</p>
                </div>
                <Button className="gradient-primary text-white rounded-xl glow-hover" asChild>
                    <Link href="/dashboard/tours/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Tour
                    </Link>
                </Button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                        <Link href="/dashboard/tours/new">
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
                                    <span>&euro;{tour.base_price}</span>
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
                                        <Link href={`/dashboard/tours/${tour.id}/edit`}>
                                            <Edit className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-lg" asChild>
                                        <Link href={`/dashboard/tours/${tour.id}/schedule`}>
                                            <Calendar className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                    <DashboardDeleteTourButton tourId={tour.id} tourName={tour.name} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
