'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Heart, MessageCircle, Share2, MoreHorizontal,
    Users, Compass, Plus, Globe, Lock, Pin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/components/providers/auth-provider';

interface Post {
    id: string;
    content: string;
    images: string[];
    is_public: boolean;
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
    club: {
        id: string;
        name: string;
        slug: string;
        logo: string;
    };
}

interface MyClub {
    id: string;
    name: string;
    slug: string;
    logo: string;
    member_count: number;
}

export default function FeedPage() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [myClubs, setMyClubs] = useState<MyClub[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        if (!authLoading) {
            if (user) {
                fetchFeed();
                fetchMyClubs();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    async function fetchFeed(loadMore = false) {
        try {
            const currentOffset = loadMore ? offset : 0;
            const res = await fetch(`/api/feed?limit=20&offset=${currentOffset}`);
            if (res.ok) {
                const data = await res.json();
                if (loadMore) {
                    setPosts([...posts, ...(data.posts || [])]);
                } else {
                    setPosts(data.posts || []);
                }
                setHasMore(data.hasMore);
                setOffset(currentOffset + 20);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function fetchMyClubs() {
        try {
            const res = await fetch('/api/clubs?member=true&limit=10');
            if (res.ok) {
                const data = await res.json();
                setMyClubs(data.clubs || []);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-24 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="h-10 w-10 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Your Personal Feed</h1>
                        <p className="text-muted-foreground mb-8">
                            Sign in to see posts from clubs you've joined and discover new communities.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Link href="/auth/login">
                                <Button size="lg" className="w-full">Sign In</Button>
                            </Link>
                            <Link href="/clubs">
                                <Button size="lg" variant="outline" className="w-full">
                                    Browse Clubs
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">Feed</h1>
                        <Link href="/clubs">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Compass className="h-4 w-4" />
                                Discover Clubs
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - My Clubs */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                                <div className="p-4 border-b border-border flex items-center justify-between">
                                    <h2 className="font-semibold">My Clubs</h2>
                                    <Link href="/clubs/create">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                                {myClubs.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-muted-foreground">
                                        <p>You haven't joined any clubs yet</p>
                                        <Link href="/clubs" className="text-primary hover:underline">
                                            Browse clubs
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {myClubs.map((club) => (
                                            <Link
                                                key={club.id}
                                                href={`/clubs/${club.slug}`}
                                                className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                    {club.logo ? (
                                                        <Image
                                                            src={club.logo}
                                                            alt=""
                                                            width={40}
                                                            height={40}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="h-5 w-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{club.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {club.member_count} members
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Feed */}
                    <div className="lg:col-span-3 space-y-6">
                        {posts.length === 0 ? (
                            <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                                    Join some clubs to start seeing posts from your communities here.
                                </p>
                                <Link href="/clubs">
                                    <Button>Discover Clubs</Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                {posts.map((post) => (
                                    <article
                                        key={post.id}
                                        className="bg-card rounded-xl border border-border/50 overflow-hidden"
                                    >
                                        {/* Post Header */}
                                        <div className="p-4 flex items-start gap-4">
                                            <Link href={`/clubs/${post.club.slug}`}>
                                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                                                    {post.club.logo ? (
                                                        <Image
                                                            src={post.club.logo}
                                                            alt=""
                                                            width={48}
                                                            height={48}
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Users className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Link
                                                        href={`/clubs/${post.club.slug}`}
                                                        className="font-semibold hover:text-primary transition-colors"
                                                    >
                                                        {post.club.name}
                                                    </Link>
                                                    {post.is_pinned && (
                                                        <Pin className="h-3 w-3 text-primary" />
                                                    )}
                                                    {post.is_public ? (
                                                        <Globe className="h-3 w-3 text-muted-foreground" />
                                                    ) : (
                                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        {post.author.first_name} {post.author.last_name}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Post Content */}
                                        <div className="px-4 pb-4">
                                            <p className="whitespace-pre-wrap">{post.content}</p>
                                        </div>

                                        {/* Post Images */}
                                        {post.images && post.images.length > 0 && (
                                            <div className={`grid gap-1 ${post.images.length === 1 ? 'grid-cols-1' :
                                                    post.images.length === 2 ? 'grid-cols-2' :
                                                        'grid-cols-2'
                                                }`}>
                                                {post.images.slice(0, 4).map((img, i) => (
                                                    <div
                                                        key={i}
                                                        className={`relative aspect-[4/3] ${post.images.length === 3 && i === 0 ? 'row-span-2 aspect-square' : ''
                                                            }`}
                                                    >
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

                                        {/* Post Actions */}
                                        <div className="px-4 py-3 border-t border-border flex items-center gap-6">
                                            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                                <Heart className="h-5 w-5" />
                                                <span className="text-sm">{post.likes_count}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                                                <MessageCircle className="h-5 w-5" />
                                                <span className="text-sm">{post.comments_count}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors ml-auto">
                                                <Share2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </article>
                                ))}

                                {/* Load More */}
                                {hasMore && (
                                    <div className="text-center py-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => fetchFeed(true)}
                                        >
                                            Load More
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
