'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Plus, Calendar, MapPin, Users, Clock,
    MoreHorizontal, Edit, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface ClubEvent {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    start_datetime: string;
    end_datetime: string;
    location: string;
    is_paid: boolean;
    price: number;
    max_participants: number;
    current_participants: number;
    status: string;
}

export default function ManageEventsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [pastEvents, setPastEvents] = useState<ClubEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

    useEffect(() => {
        fetchEvents();
    }, [slug]);

    async function fetchEvents() {
        try {
            const [upcomingRes, pastRes] = await Promise.all([
                fetch(`/api/clubs/${slug}/events?status=upcoming`),
                fetch(`/api/clubs/${slug}/events?status=past`)
            ]);

            if (upcomingRes.ok) {
                const data = await upcomingRes.json();
                setEvents(data.events || []);
            }
            if (pastRes.ok) {
                const data = await pastRes.json();
                setPastEvents(data.events || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const displayedEvents = tab === 'upcoming' ? events : pastEvents;

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/clubs/${slug}/manage`}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Events</h1>
                                <p className="text-sm text-muted-foreground">
                                    {events.length} upcoming, {pastEvents.length} past
                                </p>
                            </div>
                        </div>
                        <Link href={`/clubs/${slug}/manage/events/new`}>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Event
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setTab('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'upcoming'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        Upcoming ({events.length})
                    </button>
                    <button
                        onClick={() => setTab('past')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'past'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                            }`}
                    >
                        Past ({pastEvents.length})
                    </button>
                </div>

                {/* Events List */}
                {displayedEvents.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                        <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-xl font-semibold mb-2">No {tab} events</h3>
                        <p className="text-muted-foreground mb-6">
                            {tab === 'upcoming'
                                ? 'Create your first event to get started'
                                : 'Past events will appear here'}
                        </p>
                        {tab === 'upcoming' && (
                            <Link href={`/clubs/${slug}/manage/events/new`}>
                                <Button>Create Event</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayedEvents.map((event) => (
                            <div
                                key={event.id}
                                className="bg-card rounded-xl border border-border/50 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="flex">
                                    {/* Date Badge */}
                                    <div className="w-24 bg-muted flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-2xl font-bold">
                                            {format(new Date(event.start_datetime), 'd')}
                                        </span>
                                        <span className="text-sm text-muted-foreground uppercase">
                                            {format(new Date(event.start_datetime), 'MMM')}
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {format(new Date(event.start_datetime), 'h:mm a')}
                                                    </span>
                                                    {event.location && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-4 w-4" />
                                                            {event.location}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {event.current_participants}
                                                        {event.max_participants && `/${event.max_participants}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {event.is_paid && (
                                                    <Badge>€{event.price}</Badge>
                                                )}
                                                <Badge variant="secondary" className="capitalize">
                                                    {event.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 p-4 border-l border-border">
                                        <Button variant="ghost" size="icon">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
