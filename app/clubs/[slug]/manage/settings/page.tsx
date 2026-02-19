'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const activityTypes = [
    { value: 'hiking', label: '🥾 Hiking' },
    { value: 'photography', label: '📷 Photography' },
    { value: 'cycling', label: '🚴 Cycling' },
    { value: 'running', label: '🏃 Running' },
    { value: 'skiing', label: '⛷️ Skiing' },
    { value: 'climbing', label: '🧗 Climbing' },
    { value: 'kayaking', label: '🛶 Kayaking' },
    { value: 'camping', label: '🏕️ Camping' },
    { value: 'birdwatching', label: '🦅 Birdwatching' },
    { value: 'other', label: '🎯 Other' },
];

interface Club {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    activity_types: string[];
    location: string;
    is_private: boolean;
    require_approval: boolean;
    cover_image: string;
    logo: string;
}

export default function ClubSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [club, setClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchClub();
    }, [slug]);

    async function fetchClub() {
        try {
            const res = await fetch(`/api/clubs/${slug}`);
            if (res.ok) {
                const data = await res.json();
                setClub({
                    ...data.club,
                    is_private: !data.club.is_public,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!club) return;

        setSaving(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch(`/api/clubs/${slug}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: club.name,
                    tagline: club.tagline,
                    description: club.description,
                    activity_types: club.activity_types || [],
                    location: club.location,
                    is_public: !club.is_private,
                    require_approval: club.require_approval,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to save');
                return;
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setSaving(false);
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
                            <h1 className="text-2xl font-bold">Club Settings</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your club profile and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <form onSubmit={handleSave} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg">Basic Information</h2>

                        <div className="space-y-2">
                            <Label htmlFor="name">Club Name *</Label>
                            <Input
                                id="name"
                                value={club.name}
                                onChange={(e) => setClub({ ...club, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                value={club.tagline || ''}
                                onChange={(e) => setClub({ ...club, tagline: e.target.value })}
                                placeholder="A short catchphrase for your club"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={club.description || ''}
                                onChange={(e) => setClub({ ...club, description: e.target.value })}
                                rows={6}
                                placeholder="Tell people what your club is about..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Activity Types</Label>
                            <div className="flex flex-wrap gap-2">
                                {activityTypes.map((type) => {
                                    const selected = (club.activity_types || []).includes(type.value);
                                    return (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                const current = club.activity_types || [];
                                                const updated = selected
                                                    ? current.filter((t) => t !== type.value)
                                                    : [...current, type.value];
                                                setClub({ ...club, activity_types: updated });
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                                selected
                                                    ? 'bg-primary text-primary-foreground border-primary'
                                                    : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                                            }`}
                                        >
                                            {type.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {(club.activity_types || []).length > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    Selected: {club.activity_types.join(', ')}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={club.location || ''}
                                onChange={(e) => setClub({ ...club, location: e.target.value })}
                                placeholder="e.g., Ljubljana, Slovenia"
                            />
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg">Privacy & Access</h2>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={club.is_private}
                                onChange={(e) => setClub({ ...club, is_private: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded"
                            />
                            <div>
                                <p className="font-medium">Private Club</p>
                                <p className="text-sm text-muted-foreground">
                                    Only members can see club posts and events
                                </p>
                            </div>
                        </label>

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={club.require_approval}
                                onChange={(e) => setClub({ ...club, require_approval: e.target.checked })}
                                className="mt-1 w-5 h-5 rounded"
                            />
                            <div>
                                <p className="font-medium">Require Approval to Join</p>
                                <p className="text-sm text-muted-foreground">
                                    New members must be approved by an admin
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/10 border border-green-500/50 rounded-xl p-4 text-sm text-green-600">
                            Settings saved successfully!
                        </div>
                    )}

                    {/* Save Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full gap-2"
                        disabled={saving}
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>

                    {/* Danger Zone */}
                    <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 space-y-4">
                        <h2 className="font-semibold text-lg flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Deleting your club will permanently remove all members, posts, and events.
                            This action cannot be undone.
                        </p>
                        <Button
                            type="button"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => {
                                if (confirm('Are you sure you want to delete this club? This cannot be undone.')) {
                                    // TODO: Implement delete
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Club
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
