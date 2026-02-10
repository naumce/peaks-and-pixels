'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Users, MapPin, Calendar, Settings, ChevronRight,
    Clock, MessageSquare, Share2, Heart, MoreHorizontal,
    CheckCircle2, XCircle, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow, format } from 'date-fns';

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
    post_count: number;
    is_verified: boolean;
    is_public: boolean;
    require_approval: boolean;
    owner: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
}

interface Membership {
    role: 'owner' | 'admin' | 'member';
    status: 'pending' | 'active' | 'banned';
}

interface Post {
    id: string;
    content: string;
    images: string[];
    is_pinned: boolean;
    likes_count: number;
    comments_count: number;
    created_at: string;
    author: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
}

interface ClubEvent {
    id: string;
    title: string;
    description: string;
    cover_image: string;
    start_datetime: string;
    location: string;
    is_paid: boolean;
    price: number;
    max_participants: number;
    current_participants: number;
}

interface Member {
    id: string;
    role: string;
    joined_at: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        avatar_url: string;
    };
}

export default function ClubPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [club, setClub] = useState<Club | null>(null);
    const [membership, setMembership] = useState<Membership | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('about');
    const [posts, setPosts] = useState<Post[]>([]);
    const [events, setEvents] = useState<ClubEvent[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetchClub();
    }, [slug]);

    useEffect(() => {
        if (club) {
            if (activeTab === 'feed') fetchPosts();
            if (activeTab === 'events') fetchEvents();
            if (activeTab === 'members') fetchMembers();
        }
    }, [club, activeTab]);

    async function fetchClub() {
        try {
            const res = await fetch(`/api/clubs/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setClub(data.club);
                setMembership(data.membership);
            }
        } catch (error) {
            console.error('Error fetching club:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchPosts() {
        try {
            const res = await fetch(`/api/clubs/${slug}/posts`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data.posts || []);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    }

    async function fetchEvents() {
        try {
            const res = await fetch(`/api/clubs/${slug}/events`);
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    async function fetchMembers() {
        try {
            const res = await fetch(`/api/clubs/${slug}/members`);
            if (res.ok) {
                const data = await res.json();
                setMembers(data.members || []);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    }

    async function handleJoin() {
        setJoining(true);
        try {
            const res = await fetch(`/api/clubs/${slug}/members`, {
                method: 'POST',
            });
            if (res.ok) {
                const data = await res.json();
                setMembership({ role: 'member', status: club?.require_approval ? 'pending' : 'active' });
                fetchClub(); // Refresh club data
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to join');
            }
        } catch (error) {
            console.error('Error joining:', error);
        } finally {
            setJoining(false);
        }
    }

    async function handleLeave() {
        if (!confirm('Are you sure you want to leave this club?')) return;

        try {
            const res = await fetch(`/api/clubs/${slug}/members`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setMembership(null);
                fetchClub();
            }
        } catch (error) {
            console.error('Error leaving:', error);
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
            <div className="min-h-screen bg-background flex flex-col items-center justify-center">
                <div className="text-6xl mb-4">🔍</div>
                <h1 className="text-2xl font-bold mb-2">Club not found</h1>
                <p className="text-muted-foreground mb-6">This club doesn&apos;t exist or has been removed.</p>
                <Link href="/clubs">
                    <Button>Browse Clubs</Button>
                </Link>
            </div>
        );
    }

    const isOwner = membership?.role === 'owner';
    const isAdmin = membership?.role === 'admin';
    const isMember = membership?.status === 'active';
    const isPending = membership?.status === 'pending';

    return (
        <div className="min-h-screen bg-background">
            {/* Cover Image */}
            <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-accent/20">
                {club.cover_image ? (
                    <Image
                        src={club.cover_image}
                        alt={club.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-8xl opacity-30">🏔️</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Club Header */}
            <div className="container mx-auto px-4 -mt-20 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6 mb-8">
                    {/* Logo */}
                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl bg-card flex items-center justify-center shrink-0">
                        {club.logo ? (
                            <Image
                                src={club.logo}
                                alt={`${club.name} logo`}
                                width={128}
                                height={128}
                                className="object-cover"
                            />
                        ) : (
                            <span className="text-5xl">🏔️</span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl md:text-4xl font-bold">{club.name}</h1>
                            {club.is_verified && (
                                <CheckCircle2 className="h-6 w-6 text-primary" />
                            )}
                        </div>
                        {club.tagline && (
                            <p className="text-lg text-muted-foreground mb-3">{club.tagline}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {club.activity_types && club.activity_types.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {club.activity_types.map((type) => (
                                        <Badge key={type} variant="secondary" className="capitalize">
                                            {type}
                                        </Badge>
                                    ))}
                                </div>
                            )}
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
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {club.event_count} events
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {!membership ? (
                            <Button onClick={handleJoin} disabled={joining} className="gap-2">
                                <UserPlus className="h-4 w-4" />
                                {joining ? 'Joining...' : 'Join Club'}
                            </Button>
                        ) : isPending ? (
                            <Button variant="secondary" disabled>
                                Request Pending
                            </Button>
                        ) : isMember && !isOwner ? (
                            <Button variant="outline" onClick={handleLeave}>
                                Leave Club
                            </Button>
                        ) : null}

                        {(isOwner || isAdmin) && (
                            <Link href={`/clubs/${slug}/manage`}>
                                <Button variant="outline" className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Manage
                                </Button>
                            </Link>
                        )}

                        <Button variant="ghost" size="icon">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
                    <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-0">
                        {['about', 'feed', 'events', 'members'].map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3 capitalize"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* About Tab */}
                    <TabsContent value="about" className="py-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">About</h2>
                                    <p className="text-muted-foreground whitespace-pre-wrap">
                                        {club.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-card rounded-xl p-6 border border-border/50">
                                    <h3 className="font-semibold mb-4">Organizer</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                            {club.owner.avatar_url ? (
                                                <Image
                                                    src={club.owner.avatar_url}
                                                    alt={club.owner.first_name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-medium">
                                                    {club.owner.first_name[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {club.owner.first_name} {club.owner.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Club Owner</p>
                                        </div>
                                    </div>
                                </div>

                                {events.length > 0 && (
                                    <div className="bg-card rounded-xl p-6 border border-border/50">
                                        <h3 className="font-semibold mb-4">Upcoming Event</h3>
                                        <div className="text-sm">
                                            <p className="font-medium">{events[0].title}</p>
                                            <p className="text-muted-foreground">
                                                {format(new Date(events[0].start_datetime), 'MMMM d, yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Feed Tab */}
                    <TabsContent value="feed" className="py-8">
                        {!isMember ? (
                            <div className="text-center py-12 bg-card rounded-xl">
                                <div className="text-5xl mb-4">🔒</div>
                                <h3 className="text-xl font-semibold mb-2">Members Only</h3>
                                <p className="text-muted-foreground mb-6">
                                    Join the club to see updates and posts.
                                </p>
                                <Button onClick={handleJoin} disabled={joining}>
                                    Join Club
                                </Button>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                                <p className="text-muted-foreground">
                                    Be the first to share something with the club!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-w-2xl">
                                {posts.map((post) => (
                                    <div key={post.id} className="bg-card rounded-xl p-6 border border-border/50">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                                {post.author.avatar_url ? (
                                                    <Image
                                                        src={post.author.avatar_url}
                                                        alt={post.author.first_name}
                                                        width={40}
                                                        height={40}
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium">
                                                        {post.author.first_name[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <span className="font-medium">
                                                            {post.author.first_name} {post.author.last_name}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                    {post.is_pinned && (
                                                        <Badge variant="secondary">Pinned</Badge>
                                                    )}
                                                </div>
                                                <p className="text-foreground whitespace-pre-wrap mb-4">
                                                    {post.content}
                                                </p>
                                                {post.images && post.images.length > 0 && (
                                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                                        {post.images.map((img, i) => (
                                                            <div key={i} className="relative aspect-video rounded-lg overflow-hidden">
                                                                <Image
                                                                    src={img}
                                                                    alt=""
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                        <Heart className="h-4 w-4" />
                                                        {post.likes_count}
                                                    </button>
                                                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                                                        <MessageSquare className="h-4 w-4" />
                                                        {post.comments_count}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Events Tab */}
                    <TabsContent value="events" className="py-8">
                        {events.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-5xl mb-4">📅</div>
                                <h3 className="text-xl font-semibold mb-2">No upcoming events</h3>
                                <p className="text-muted-foreground">
                                    Check back later for new events!
                                </p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {events.map((event) => (
                                    <div key={event.id} className="bg-card rounded-xl overflow-hidden border border-border/50 hover:shadow-lg transition-shadow">
                                        <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20">
                                            {event.cover_image ? (
                                                <Image
                                                    src={event.cover_image}
                                                    alt={event.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Calendar className="h-12 w-12 opacity-30" />
                                                </div>
                                            )}
                                            {event.is_paid && (
                                                <Badge className="absolute top-3 right-3">
                                                    €{event.price}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                                            <div className="space-y-2 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {format(new Date(event.start_datetime), 'EEEE, MMMM d • h:mm a')}
                                                </div>
                                                {event.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        {event.location}
                                                    </div>
                                                )}
                                                {event.max_participants && (
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        {event.current_participants}/{event.max_participants} going
                                                    </div>
                                                )}
                                            </div>
                                            <Button className="w-full mt-4">
                                                {event.is_paid ? 'Book Now' : 'RSVP'}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Members Tab */}
                    <TabsContent value="members" className="py-8">
                        {!isMember ? (
                            <div className="text-center py-12 bg-card rounded-xl">
                                <div className="text-5xl mb-4">🔒</div>
                                <h3 className="text-xl font-semibold mb-2">Members Only</h3>
                                <p className="text-muted-foreground mb-6">
                                    Join the club to see all members.
                                </p>
                                <Button onClick={handleJoin} disabled={joining}>
                                    Join Club
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/50">
                                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                            {member.user.avatar_url ? (
                                                <Image
                                                    src={member.user.avatar_url}
                                                    alt={member.user.first_name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <span className="text-lg font-medium">
                                                    {member.user.first_name[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {member.user.first_name} {member.user.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {member.role}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
