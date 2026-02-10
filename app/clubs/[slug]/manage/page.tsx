'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Settings, Users, Calendar, MessageSquare,
    BarChart3, Plus, Edit, Eye, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Club {
    id: string;
    slug: string;
    name: string;
    status: string;
    member_count: number;
    event_count: number;
    post_count: number;
}

interface Stats {
    upcomingEvents: number;
}

export default function ClubManagePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [club, setClub] = useState<Club | null>(null);
    const [stats, setStats] = useState<Stats>({ upcomingEvents: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClub();
    }, [slug]);

    async function fetchClub() {
        try {
            const res = await fetch(`/api/clubs/${slug}`);
            if (res.ok) {
                const data = await res.json();
                // Check if user has permission
                if (!data.membership || !['owner', 'admin'].includes(data.membership.role)) {
                    router.push(`/clubs/${slug}`);
                    return;
                }
                setClub(data.club);
                setStats(data.stats);
            } else {
                router.push('/clubs');
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

    if (!club) return null;

    const statCards = [
        { label: 'Members', value: club.member_count, icon: Users, color: 'text-blue-500' },
        { label: 'Events', value: club.event_count, icon: Calendar, color: 'text-green-500' },
        { label: 'Posts', value: club.post_count, icon: MessageSquare, color: 'text-purple-500' },
        { label: 'Upcoming', value: stats.upcomingEvents, icon: Clock, color: 'text-orange-500' },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/clubs/${slug}`}
                                className="p-2 hover:bg-muted rounded-lg transition-colors"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">{club.name}</h1>
                                <p className="text-sm text-muted-foreground">Club Management</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link href={`/clubs/${slug}`}>
                                <Button variant="outline" className="gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Public Page
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Status Banner */}
                    {club.status === 'pending' && (
                        <div className="mt-4 bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 text-sm">
                            <p className="font-medium text-amber-600 dark:text-amber-400">
                                ⏳ Pending Approval
                            </p>
                            <p className="text-muted-foreground">
                                Your club is being reviewed. It will be visible to the public once approved.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="bg-card rounded-xl p-6 border border-border/50">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <Link
                        href={`/clubs/${slug}/manage/events/new`}
                        className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-green-500/10 rounded-lg">
                                <Calendar className="h-6 w-6 text-green-500" />
                            </div>
                            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold mb-1">Create Event</h3>
                        <p className="text-sm text-muted-foreground">
                            Organize a new activity for your members
                        </p>
                    </Link>

                    <Link
                        href={`/clubs/${slug}/manage/posts/new`}
                        className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-500/10 rounded-lg">
                                <MessageSquare className="h-6 w-6 text-purple-500" />
                            </div>
                            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold mb-1">New Post</h3>
                        <p className="text-sm text-muted-foreground">
                            Share news or updates with your club
                        </p>
                    </Link>

                    <Link
                        href={`/clubs/${slug}/manage/settings`}
                        className="bg-card rounded-xl p-6 border border-border/50 hover:border-primary/50 transition-colors group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gray-500/10 rounded-lg">
                                <Settings className="h-6 w-6 text-gray-500" />
                            </div>
                            <Edit className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <h3 className="font-semibold mb-1">Club Settings</h3>
                        <p className="text-sm text-muted-foreground">
                            Edit profile, privacy, and more
                        </p>
                    </Link>
                </div>

                {/* Management Links */}
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-semibold">Management</h2>
                    </div>
                    <div className="divide-y divide-border">
                        <Link
                            href={`/clubs/${slug}/manage/members`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Members</p>
                                    <p className="text-sm text-muted-foreground">
                                        Manage members, invites, and roles
                                    </p>
                                </div>
                            </div>
                            <span className="text-muted-foreground">{club.member_count}</span>
                        </Link>

                        <Link
                            href={`/clubs/${slug}/manage/events`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Events</p>
                                    <p className="text-sm text-muted-foreground">
                                        View and manage club events
                                    </p>
                                </div>
                            </div>
                            <span className="text-muted-foreground">{club.event_count}</span>
                        </Link>

                        <Link
                            href={`/clubs/${slug}/manage/posts`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Posts</p>
                                    <p className="text-sm text-muted-foreground">
                                        View and manage feed posts
                                    </p>
                                </div>
                            </div>
                            <span className="text-muted-foreground">{club.post_count}</span>
                        </Link>

                        <Link
                            href={`/clubs/${slug}/manage/analytics`}
                            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">Analytics</p>
                                    <p className="text-sm text-muted-foreground">
                                        Member growth and engagement stats
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
