'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Pin, Trash2, Globe, Lock, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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

export default function ManagePostsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [slug]);

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

    async function handlePost() {
        if (!newPost.trim()) return;
        setPosting(true);

        try {
            const res = await fetch(`/api/clubs/${slug}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newPost,
                    is_public: isPublic,
                }),
            });

            if (res.ok) {
                setNewPost('');
                setIsPublic(false);
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

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/clubs/${slug}/manage`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Posts</h1>
                            <p className="text-sm text-muted-foreground">
                                {posts.length} posts
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                {/* New Post */}
                <div className="bg-card rounded-xl p-6 border border-border/50 mb-8">
                    <h3 className="font-semibold mb-4">Create a Post</h3>
                    <Textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="Share an update with your club..."
                        rows={4}
                        className="mb-4"
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="rounded"
                            />
                            <Globe className="h-4 w-4" />
                            <span>Share to public feed</span>
                        </label>
                        <Button
                            onClick={handlePost}
                            disabled={!newPost.trim() || posting}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {posting ? 'Posting...' : 'Post'}
                        </Button>
                    </div>
                </div>

                {/* Posts List */}
                {posts.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                        <div className="text-5xl mb-4">📝</div>
                        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground">
                            Create your first post to share with the club
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-card rounded-xl p-6 border border-border/50"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                                        {post.author.avatar_url ? (
                                            <Image
                                                src={post.author.avatar_url}
                                                alt=""
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
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {post.author.first_name} {post.author.last_name}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {post.is_pinned && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <Pin className="h-3 w-3" />
                                                        Pinned
                                                    </Badge>
                                                )}
                                                {post.is_public ? (
                                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <Lock className="h-4 w-4 text-muted-foreground" />
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <p className="whitespace-pre-wrap">{post.content}</p>

                                        {post.images && post.images.length > 0 && (
                                            <div className="grid grid-cols-2 gap-2 mt-4">
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

                                        <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                            <span>{post.likes_count} likes</span>
                                            <span>{post.comments_count} comments</span>
                                        </div>
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
