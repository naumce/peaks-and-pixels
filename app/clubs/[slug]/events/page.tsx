'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Calendar, MapPin, Users, Clock,
    Ticket, ChevronRight, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ClubEvent {
    id: string;
    title: string;
    description: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    max_participants: number;
    current_participants: number;
    is_paid: boolean;
    price: number;
    cover_image: string;
}

interface Club {
    id: string;
    name: string;
    slug: string;
    logo: string;
}

export default function ClubEventsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [club, setClub] = useState<Club | null>(null);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        fetchClub();
        fetchEvents();
    }, [slug, filter]);

    async function fetchClub() {
        try {
            const res = await fetch(`/api/clubs/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setClub(data.club);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function fetchEvents() {
        try {
            const res = await fetch(`/api/clubs/${slug}/events?status=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p>Club not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/clubs/${slug}`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                            {club.logo ? (
                                <Image
                                    src={club.logo}
                                    alt=""
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-xl">🏔️</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="font-bold text-lg">{club.name}</h1>
                            <p className="text-sm text-muted-foreground">Club Events</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'upcoming'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'past'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Past Events
                    </button>
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                            {filter === 'upcoming' ? 'No upcoming events' : 'No past events'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {filter === 'upcoming'
                                ? 'Check back later for new events from this club.'
                                : 'This club hasn\'t hosted any events yet.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                href={`/clubs/${slug}/events/${event.id}`}
                                className="group bg-card rounded-xl border border-border/50 overflow-hidden hover:border-primary/50 transition-all"
                            >
                                {/* Event Image */}
                                <div className="aspect-[16/9] relative bg-muted">
                                    {event.cover_image ? (
                                        <Image
                                            src={event.cover_image}
                                            alt=""
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Calendar className="h-12 w-12 text-muted-foreground/50" />
                                        </div>
                                    )}
                                    {event.is_paid && (
                                        <Badge className="absolute top-3 right-3 bg-primary">
                                            €{event.price}
                                        </Badge>
                                    )}
                                </div>

                                {/* Event Details */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                        {event.title}
                                    </h3>

                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 shrink-0" />
                                            <span>
                                                {format(new Date(event.start_datetime), 'EEE, MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span>
                                                {format(new Date(event.start_datetime), 'h:mm a')}
                                                {event.end_datetime && ` - ${format(new Date(event.end_datetime), 'h:mm a')}`}
                                            </span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{event.location}</span>
                                            </div>
                                        )}
                                        {event.max_participants && (
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 shrink-0" />
                                                <span>
                                                    {event.current_participants || 0} / {event.max_participants} spots
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-4 pb-4">
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                        <span className="text-sm text-primary font-medium">
                                            View Details
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-primary" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
