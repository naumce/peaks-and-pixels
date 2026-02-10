'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Users, MapPin, Calendar, Plus, Filter, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClubCardSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

interface Club {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    description: string;
    cover_image: string;
    logo: string;
    activity_types: string[];
    location: string;
    member_count: number;
    event_count: number;
    is_verified: boolean;
    owner: {
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
}

const activityTypes = [
    { value: '', label: 'All Activities' },
    { value: 'hiking', label: '🥾 Hiking' },
    { value: 'cycling', label: '🚴 Cycling' },
    { value: 'photography', label: '📷 Photography' },
    { value: 'running', label: '🏃 Running' },
    { value: 'climbing', label: '🧗 Climbing' },
    { value: 'skiing', label: '⛷️ Skiing' },
    { value: 'other', label: '🌟 Other' },
];

export default function ClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activityType, setActivityType] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchClubs();
    }, [search, activityType, page]);

    async function fetchClubs() {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12',
            });
            if (search) params.append('search', search);
            if (activityType) params.append('activity_type', activityType);

            const res = await fetch(`/api/clubs?${params}`);
            const data = await res.json();
            setClubs(data.clubs || []);
            setTotalPages(data.pagination?.totalPages || 1);
        } catch (error) {
            console.error('Error fetching clubs:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Discover <span className="text-primary">Communities</span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Join clubs, meet like-minded adventurers, and explore together.
                            From hiking groups to photography circles, find your tribe.
                        </p>

                        {/* Search Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search clubs..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(1);
                                    }}
                                    className="pl-10 h-12 bg-card border-border/50"
                                />
                            </div>
                            <Link href="/clubs/create">
                                <Button className="h-12 gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Club
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters */}
            <section className="border-b border-border/50 bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                        {activityTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => {
                                    setActivityType(type.value);
                                    setPage(1);
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activityType === type.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                    }`}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Clubs Grid */}
            <section className="py-12">
                <div className="container mx-auto px-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className={`slide-up stagger-${Math.min(i + 1, 6)}`}>
                                    <ClubCardSkeleton />
                                </div>
                            ))}
                        </div>
                    ) : clubs.length === 0 ? (
                        <EmptyState
                            icon="users"
                            title="No clubs found"
                            description={search || activityType ? 'Try adjusting your filters' : 'Be the first to create a club!'}
                            action={{ label: 'Create a Club', href: '/clubs/create' }}
                            secondaryAction={search || activityType ? { label: 'Clear Filters', onClick: () => { setSearch(''); setActivityType(''); } } : undefined}
                        />
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {clubs.map((club) => (
                                    <Link
                                        key={club.id}
                                        href={`/clubs/${club.slug}`}
                                        className="group bg-card rounded-xl overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Cover Image */}
                                        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
                                            {club.cover_image ? (
                                                <Image
                                                    src={club.cover_image}
                                                    alt={club.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-5xl opacity-50">🏔️</span>
                                                </div>
                                            )}
                                            {/* Logo */}
                                            {club.logo && (
                                                <div className="absolute -bottom-6 left-4 w-14 h-14 rounded-xl overflow-hidden border-4 border-card shadow-lg">
                                                    <Image
                                                        src={club.logo}
                                                        alt={`${club.name} logo`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            )}
                                            {/* Activity Badges */}
                                            {club.activity_types && club.activity_types.length > 0 && (
                                                <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end">
                                                    {club.activity_types.map((type) => (
                                                        <Badge key={type} className="capitalize">
                                                            {type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`p-6 ${club.logo ? 'pt-10' : ''}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                                                    {club.name}
                                                    {club.is_verified && (
                                                        <span className="ml-1 text-primary">✓</span>
                                                    )}
                                                </h3>
                                            </div>

                                            {club.tagline && (
                                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                    {club.tagline}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {club.member_count} members
                                                </span>
                                                {club.location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {club.location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-10">
                                    <Button
                                        variant="outline"
                                        disabled={page === 1}
                                        onClick={() => setPage(p => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        disabled={page === totalPages}
                                        onClick={() => setPage(p => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section >

            {/* CTA Section */}
            < section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10" >
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">
                        Can&apos;t find your community?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        Start your own club and bring together adventurers who share your passion.
                    </p>
                    <Link href="/clubs/create">
                        <Button size="lg" className="gap-2">
                            <Plus className="h-5 w-5" />
                            Create Your Club
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section >
        </div >
    );
}
