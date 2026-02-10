'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, Globe, Lock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const activityTypes = [
    { value: 'hiking', label: '🥾 Hiking', description: 'Trails, peaks, nature walks' },
    { value: 'cycling', label: '🚴 Cycling', description: 'Road, MTB, gravel' },
    { value: 'photography', label: '📷 Photography', description: 'Landscape, wildlife, portraits' },
    { value: 'running', label: '🏃 Running', description: 'Trail running, marathons' },
    { value: 'climbing', label: '🧗 Climbing', description: 'Rock climbing, bouldering' },
    { value: 'skiing', label: '⛷️ Skiing', description: 'Alpine, touring, cross-country' },
    { value: 'kayaking', label: '🛶 Kayaking', description: 'Rivers, lakes, sea' },
    { value: 'other', label: '🌟 Other', description: 'Any outdoor activity' },
];

export default function CreateClubPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        activity_types: [] as string[],
        location: '',
        is_public: true,
        require_approval: false,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/clubs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create club');
                return;
            }

            // Redirect to success or pending page
            router.push(`/clubs/${data.club.slug}?created=true`);
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/clubs"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Clubs
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create a Club</h1>
                    <p className="text-muted-foreground">
                        Start a community for adventurers who share your passion.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg">Basic Information</h2>

                        <div className="space-y-2">
                            <Label htmlFor="name">Club Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Ljubljana Trail Runners"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">Tagline</Label>
                            <Input
                                id="tagline"
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                placeholder="A short description of your club"
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground">
                                {formData.tagline.length}/100 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell people what your club is about, what activities you organize, who can join..."
                                rows={5}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Ljubljana, Slovenia"
                            />
                        </div>
                    </div>

                    {/* Activity Types */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <div>
                            <h2 className="font-semibold text-lg">Activity Types</h2>
                            <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {activityTypes.map((type) => {
                                const isSelected = formData.activity_types.includes(type.value);
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => {
                                            const types = isSelected
                                                ? formData.activity_types.filter(t => t !== type.value)
                                                : [...formData.activity_types, type.value];
                                            setFormData({ ...formData, activity_types: types });
                                        }}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{type.label.split(' ')[0]}</div>
                                        <div className="text-sm font-medium">{type.label.split(' ').slice(1).join(' ')}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg">Privacy Settings</h2>

                        <div className="space-y-4">
                            <label className="flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={formData.is_public}
                                    onChange={() => setFormData({ ...formData, is_public: true })}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Globe className="h-4 w-4" />
                                        Public
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Anyone can find and see your club
                                    </p>
                                </div>
                            </label>

                            <label className="flex items-start gap-4 p-4 rounded-xl border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                                <input
                                    type="radio"
                                    name="visibility"
                                    checked={!formData.is_public}
                                    onChange={() => setFormData({ ...formData, is_public: false })}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium">
                                        <Lock className="h-4 w-4" />
                                        Private
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Only members can see and find your club
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <label className="flex items-start gap-4 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.require_approval}
                                    onChange={(e) => setFormData({ ...formData, require_approval: e.target.checked })}
                                    className="mt-1"
                                />
                                <div>
                                    <div className="flex items-center gap-2 font-medium">
                                        <Users className="h-4 w-4" />
                                        Require approval to join
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        New members must be approved by an admin
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 text-sm">
                        <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                            Admin Approval Required
                        </p>
                        <p className="text-muted-foreground">
                            Your club will be reviewed by our team before going live.
                            This usually takes 1-2 business days.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/50 rounded-xl p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="flex-1"
                            disabled={loading || !formData.name}
                        >
                            {loading ? 'Creating...' : 'Create Club'}
                        </Button>
                        <Link href="/clubs">
                            <Button type="button" variant="outline" size="lg">
                                Cancel
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
