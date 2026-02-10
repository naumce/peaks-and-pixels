'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Heart, MessageCircle, Share2, MoreHorizontal,
    ArrowLeft, Globe, Lock, Pin, Calendar, MapPin,
    Plus, ImageIcon, Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
}

interface Club {
    id: string;
    name: string;
    slug: string;
    description: string;
    cover_image: string;
    logo_url: string;
    member_count: number;
}

export default function ClubFeedPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { user } = useAuth();
    const [club, setClub] = useState<Club | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [posting, setPosting] = useState(false);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchClub();
        fetchPosts();
    }, [slug]);

    async function fetchClub() {
        try {
            const res = await fetch(`/api/clubs/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setClub(data.club);
                setIsMember(data.isMember);
            }
        } catch (error) {
            console.error('Error:', error);
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
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreatePost(e: React.FormEvent) {
        e.preventDefault();
        if (!newPost.trim() || posting) return;

        setPosting(true);
        try {
            const res = await fetch(`/api/clubs/${slug}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newPost }),
            });

            if (res.ok) {
                setNewPost('');
                fetchPosts();
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setPosting(false);
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
            {/* Club Header */}
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
                            {club.logo_url ? (
                                <Image
                                    src={club.logo_url}
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
                            <p className="text-sm text-muted-foreground">Club Feed</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* Create Post */}
                {isMember && user && (
                    <form onSubmit={handleCreatePost} className="bg-card rounded-xl border border-border/50 p-4 mb-6">
                        <Textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="Share something with the club..."
                            rows={3}
                            className="mb-3 resize-none"
                        />
                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </button>
                            <Button
                                type="submit"
                                size="sm"
                                disabled={!newPost.trim() || posting}
                                className="gap-2"
                            >
                                <Send className="h-4 w-4" />
                                {posting ? 'Posting...' : 'Post'}
                            </Button>
                        </div>
                    </form>
                )}

                {/* Posts Feed */}
                {posts.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border/50">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            {isMember
                                ? "Be the first to share something with the club!"
                                : "Join the club to see and create posts."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <article
                                key={post.id}
                                className="bg-card rounded-xl border border-border/50 overflow-hidden"
                            >
                                {/* Post Header */}
                                <div className="p-4 flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {post.author.avatar_url ? (
                                            <Image
                                                src={post.author.avatar_url}
                                                alt=""
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-medium text-primary">
                                                {post.author.first_name?.[0]}{post.author.last_name?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">
                                                {post.author.first_name} {post.author.last_name}
                                            </span>
                                            {post.is_pinned && (
                                                <Pin className="h-3 w-3 text-primary" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                        </p>
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
                                    <div className={`grid gap-1 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                                        }`}>
                                        {post.images.slice(0, 4).map((img, i) => (
                                            <div key={i} className="relative aspect-[4/3]">
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
                    </div>
                )}
            </div>
        </div>
    );
}
