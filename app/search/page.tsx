'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search as SearchIcon, MapPin, Users, Calendar, Clock, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Tour {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    cover_image: string;
    location_area: string;
    difficulty: string;
    duration_hours: number;
    base_price: number;
}

interface Club {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    activity_types: string[];
    member_count: number;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    const [searchQuery, setSearchQuery] = useState(query);
    const [tours, setTours] = useState<Tour[]>([]);
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            performSearch(query);
        }
    }, [query, type]);

    async function performSearch(q: string) {
        if (!q.trim()) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`);
            if (res.ok) {
                const data = await res.json();
                setTours(data.tours || []);
                setClubs(data.clubs || []);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${type}`);
        }
    }

    function handleTypeChange(newType: string) {
        router.push(`/search?q=${encodeURIComponent(query)}&type=${newType}`);
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'moderate': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'challenging': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'expert': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const totalResults = tours.length + clubs.length;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {/* Search Header */}
                <div className="max-w-2xl mx-auto mb-8">
                    <form onSubmit={handleSearch} className="relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search tours, clubs, destinations..."
                            className="pl-12 pr-12 py-6 text-lg rounded-xl border-border/50 focus:border-primary"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Filter Tabs */}
                <div className="flex justify-center gap-2 mb-8">
                    {['all', 'tours', 'clubs'].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleTypeChange(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${type === t
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                    </div>
                ) : query ? (
                    <div className="space-y-8">
                        <p className="text-center text-muted-foreground">
                            {totalResults} results for "{query}"
                        </p>

                        {/* Tours Results */}
                        {(type === 'all' || type === 'tours') && tours.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Tours</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {tours.map((tour) => (
                                        <Link
                                            key={tour.id}
                                            href={`/tours/${tour.slug}`}
                                            className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/50 transition-all"
                                        >
                                            <div className="aspect-[16/10] relative bg-muted">
                                                {tour.cover_image ? (
                                                    <img
                                                        src={tour.cover_image}
                                                        alt=""
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                                                        <span className="text-4xl">🏔️</span>
                                                    </div>
                                                )}
                                                <Badge className={`absolute top-3 right-3 ${getDifficultyColor(tour.difficulty)}`}>
                                                    {tour.difficulty}
                                                </Badge>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                                    {tour.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                                    {tour.tagline}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {tour.location_area}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {tour.duration_hours}h
                                                        </span>
                                                    </div>
                                                    <p className="font-bold">
                                                        €{tour.base_price}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Clubs Results */}
                        {(type === 'all' || type === 'clubs') && clubs.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Clubs</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {clubs.map((club) => (
                                        <Link
                                            key={club.id}
                                            href={`/clubs/${club.slug}`}
                                            className="group bg-card rounded-xl border border-border/50 p-5 hover:border-primary/50 transition-all"
                                        >
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                                                    {club.logo_url ? (
                                                        <img src={club.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                                                        {club.name}
                                                    </h3>
                                                    {club.activity_types && club.activity_types.length > 0 && (
                                                        <span className="text-xs text-muted-foreground capitalize">
                                                            {club.activity_types.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                                {club.description || 'No description'}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {club.member_count} members
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {totalResults === 0 && (
                            <div className="text-center py-16">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SearchIcon className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    We couldn't find anything matching "{query}". Try different keywords or browse our tours.
                                </p>
                                <Button className="mt-6" asChild>
                                    <Link href="/tours">Browse Tours</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <SearchIcon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Search Peaks & Pixels</h3>
                        <p className="text-muted-foreground">
                            Find tours, clubs, and adventure destinations
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
