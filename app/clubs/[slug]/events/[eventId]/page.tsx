'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowLeft, Calendar, MapPin, Users, Clock,
    Ticket, Share2, Heart, CheckCircle, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/components/providers/auth-provider';

interface ClubEvent {
    id: string;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    max_participants: number;
    current_participants: number;
    is_paid: boolean;
    price: number;
    cover_image: string;
    created_at: string;
    organizer: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
}

interface Club {
    id: string;
    name: string;
    slug: string;
    logo_url: string;
}

export default function ClubEventDetailPage({
    params
}: {
    params: Promise<{ slug: string; eventId: string }>
}) {
    const { slug, eventId } = use(params);
    const { user } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [event, setEvent] = useState<ClubEvent | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRegistered, setIsRegistered] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchClub();
        fetchEvent();
    }, [slug, eventId]);

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

    async function fetchEvent() {
        try {
            const res = await fetch(`/api/clubs/${slug}/events/${eventId}`);
            if (res.ok) {
                const data = await res.json();
                setEvent(data.event);
                setIsRegistered(data.isRegistered);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister() {
        if (!user || registering) return;

        setRegistering(true);
        try {
            const res = await fetch(`/api/clubs/${slug}/events/${eventId}/register`, {
                method: 'POST',
            });
            if (res.ok) {
                setIsRegistered(true);
                if (event) {
                    setEvent({
                        ...event,
                        current_participants: (event.current_participants || 0) + 1
                    });
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setRegistering(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!club || !event) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl font-semibold mb-4">Event not found</p>
                    <Link href={`/clubs/${slug}/events`}>
                        <Button variant="outline">Back to Events</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const spotsLeft = event.max_participants
        ? event.max_participants - (event.current_participants || 0)
        : null;
    const isFull = spotsLeft !== null && spotsLeft <= 0;
    const eventDate = new Date(event.event_date);
    const isPast = eventDate < new Date();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/clubs/${slug}/events`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                            {club.logo_url ? (
                                <Image
                                    src={club.logo_url}
                                    alt=""
                                    width={40}
                                    height={40}
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-lg">🏔️</span>
                            )}
                        </div>
                        <div className="flex-1">
                            <Link
                                href={`/clubs/${slug}`}
                                className="font-medium hover:text-primary transition-colors"
                            >
                                {club.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">Event Details</p>
                        </div>
                        <Button variant="ghost" size="icon">
                            <Share2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {event.cover_image && (
                <div className="relative h-64 md:h-96 bg-muted">
                    <Image
                        src={event.cover_image}
                        alt=""
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title & Badges */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {isPast && (
                                    <Badge variant="secondary">Past Event</Badge>
                                )}
                                {event.is_paid && (
                                    <Badge className="bg-primary">€{event.price}</Badge>
                                )}
                                {!event.is_paid && (
                                    <Badge variant="outline" className="border-green-500 text-green-500">
                                        Free
                                    </Badge>
                                )}
                            </div>
                            <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                        </div>

                        {/* Event Info Cards */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="bg-card rounded-xl p-4 border border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Date</p>
                                        <p className="font-medium">
                                            {format(eventDate, 'EEEE, MMMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {event.start_time && (
                                <div className="bg-card rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Clock className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Time</p>
                                            <p className="font-medium">
                                                {event.start_time}
                                                {event.end_time && ` - ${event.end_time}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {event.location && (
                                <div className="bg-card rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Location</p>
                                            <p className="font-medium">{event.location}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {event.max_participants && (
                                <div className="bg-card rounded-xl p-4 border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Capacity</p>
                                            <p className="font-medium">
                                                {event.current_participants || 0} / {event.max_participants} spots
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="bg-card rounded-xl p-6 border border-border/50">
                            <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                            <div className="prose prose-invert max-w-none">
                                <p className="whitespace-pre-wrap text-muted-foreground">
                                    {event.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>

                        {/* Organizer */}
                        {event.organizer && (
                            <div className="bg-card rounded-xl p-6 border border-border/50">
                                <h2 className="text-xl font-semibold mb-4">Organizer</h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        {event.organizer.avatar_url ? (
                                            <Image
                                                src={event.organizer.avatar_url}
                                                alt=""
                                                width={48}
                                                height={48}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {event.organizer.first_name} {event.organizer.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Event Organizer</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Registration */}
                    <div>
                        <div className="sticky top-24 bg-card rounded-xl border border-border/50 overflow-hidden">
                            <div className="p-6">
                                {event.is_paid && (
                                    <div className="text-center mb-4">
                                        <span className="text-3xl font-bold">€{event.price}</span>
                                        <span className="text-muted-foreground"> / person</span>
                                    </div>
                                )}

                                {spotsLeft !== null && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Spots available</span>
                                            <span className={spotsLeft <= 5 ? 'text-amber-500 font-medium' : ''}>
                                                {spotsLeft} left
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all"
                                                style={{
                                                    width: `${((event.current_participants || 0) / event.max_participants) * 100}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isPast ? (
                                    <Button disabled className="w-full" size="lg">
                                        Event Has Ended
                                    </Button>
                                ) : isRegistered ? (
                                    <Button disabled className="w-full gap-2" size="lg" variant="outline">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        You're Registered
                                    </Button>
                                ) : isFull ? (
                                    <Button disabled className="w-full" size="lg">
                                        Event is Full
                                    </Button>
                                ) : user ? (
                                    <Button
                                        onClick={handleRegister}
                                        disabled={registering}
                                        className="w-full gap-2"
                                        size="lg"
                                    >
                                        <Ticket className="h-5 w-5" />
                                        {registering ? 'Registering...' : 'Register Now'}
                                    </Button>
                                ) : (
                                    <Link href={`/auth/login?redirect=/clubs/${slug}/events/${eventId}`}>
                                        <Button className="w-full" size="lg">
                                            Sign In to Register
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            <div className="px-6 pb-6 pt-2 border-t border-border">
                                <p className="text-xs text-muted-foreground text-center">
                                    By registering, you agree to attend and follow the event guidelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
