'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Save, Eye } from 'lucide-react';

interface TourFormProps {
    tour?: {
        id: string;
        slug: string;
        name: string;
        tagline: string;
        description: string;
        difficulty: string;
        duration_days: number;
        location_area: string;
        meeting_point: string;
        base_price: number;
        max_participants: number;
        min_participants: number;
        whats_included: string[];
        whats_not_included: string[];
        what_to_bring: string[];
        status: string;
        is_featured: boolean;
    };
    isEdit?: boolean;
}

export function TourForm({ tour, isEdit = false }: TourFormProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: tour?.name || '',
        tagline: tour?.tagline || '',
        description: tour?.description || '',
        difficulty: tour?.difficulty || 'moderate',
        duration_days: tour?.duration_days || 1,
        location_area: tour?.location_area || '',
        meeting_point: tour?.meeting_point || '',
        base_price: tour?.base_price || 89,
        max_participants: tour?.max_participants || 12,
        min_participants: tour?.min_participants || 2,
        whats_included: tour?.whats_included?.join('\n') || 'Professional guide\nTransportation\nLunch',
        whats_not_included: tour?.whats_not_included?.join('\n') || 'Personal expenses\nTips',
        what_to_bring: tour?.what_to_bring?.join('\n') || 'Comfortable shoes\nWater bottle\nCamera',
        status: tour?.status || 'draft',
        is_featured: tour?.is_featured || false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const tourData = {
                name: formData.name,
                tagline: formData.tagline,
                description: formData.description,
                difficulty: formData.difficulty,
                duration_days: formData.duration_days,
                location_area: formData.location_area,
                meeting_point: formData.meeting_point,
                base_price: formData.base_price,
                max_participants: formData.max_participants,
                min_participants: formData.min_participants,
                whats_included: formData.whats_included.split('\n').filter(i => i.trim()),
                whats_not_included: formData.whats_not_included.split('\n').filter(i => i.trim()),
                what_to_bring: formData.what_to_bring.split('\n').filter(i => i.trim()),
                status: formData.status,
                is_featured: formData.is_featured,
            };

            const url = isEdit ? `/api/admin/tours/${tour?.id}` : '/api/admin/tours';
            const method = isEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tourData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to save tour');
            }

            router.push('/admin/tours');
            router.refresh();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tours">
                        <Button type="button" variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            {isEdit ? 'Edit Tour' : 'Create New Tour'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEdit ? `Editing: ${tour?.name}` : 'Fill in the details below'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {isEdit && tour?.slug && (
                        <Button type="button" variant="outline" className="rounded-xl" asChild>
                            <Link href={`/tours/${tour.slug}`} target="_blank">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Link>
                        </Button>
                    )}
                    <Button type="submit" className="gradient-primary text-white rounded-xl" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {isEdit ? 'Save Changes' : 'Create Tour'}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                    {error}
                </div>
            )}

            {/* Form sections */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

                        <div className="space-y-2">
                            <Label htmlFor="name">Tour Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Matka Canyon Adventure"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tagline">Short Description *</Label>
                            <Input
                                id="tagline"
                                value={formData.tagline}
                                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                placeholder="A stunning day hike through beautiful canyon..."
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Full Description *</Label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detailed tour description..."
                                rows={6}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                                required
                            />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="difficulty">Difficulty *</Label>
                                <select
                                    id="difficulty"
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="hard">Hard</option>
                                    <option value="expert">Expert</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration_days">Duration (days) *</Label>
                                <Input
                                    id="duration_days"
                                    type="number"
                                    min="1"
                                    value={formData.duration_days}
                                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                                    className="h-12 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Location</h2>

                        <div className="space-y-2">
                            <Label htmlFor="location_area">Location Area *</Label>
                            <Input
                                id="location_area"
                                value={formData.location_area}
                                onChange={(e) => setFormData({ ...formData, location_area: e.target.value })}
                                placeholder="Matka, Macedonia"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meeting_point">Meeting Point *</Label>
                            <Input
                                id="meeting_point"
                                value={formData.meeting_point}
                                onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                                placeholder="Hotel Continental, Skopje"
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Tour Details</h2>

                        <div className="space-y-2">
                            <Label htmlFor="whats_included">What&apos;s Included (one per line)</Label>
                            <textarea
                                id="whats_included"
                                value={formData.whats_included}
                                onChange={(e) => setFormData({ ...formData, whats_included: e.target.value })}
                                placeholder="Professional guide&#10;Transportation&#10;Lunch"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="whats_not_included">What&apos;s Not Included (one per line)</Label>
                            <textarea
                                id="whats_not_included"
                                value={formData.whats_not_included}
                                onChange={(e) => setFormData({ ...formData, whats_not_included: e.target.value })}
                                placeholder="Personal expenses&#10;Tips"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="what_to_bring">What to Bring (one per line)</Label>
                            <textarea
                                id="what_to_bring"
                                value={formData.what_to_bring}
                                onChange={(e) => setFormData({ ...formData, what_to_bring: e.target.value })}
                                placeholder="Comfortable shoes&#10;Water bottle&#10;Camera"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Pricing */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Pricing & Capacity</h2>

                        <div className="space-y-2">
                            <Label htmlFor="base_price">Base Price (€) *</Label>
                            <Input
                                id="base_price"
                                type="number"
                                min="0"
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) })}
                                className="h-12 rounded-xl"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="min_participants">Min Participants</Label>
                                <Input
                                    id="min_participants"
                                    type="number"
                                    min="1"
                                    value={formData.min_participants}
                                    onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) })}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="max_participants">Max Participants</Label>
                                <Input
                                    id="max_participants"
                                    type="number"
                                    min="1"
                                    value={formData.max_participants}
                                    onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-foreground">Status</h2>

                        <div className="space-y-2">
                            <Label htmlFor="status">Tour Status</Label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground"
                            >
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30">
                            <input
                                type="checkbox"
                                id="is_featured"
                                checked={formData.is_featured}
                                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                                className="h-4 w-4 rounded"
                            />
                            <div>
                                <Label htmlFor="is_featured" className="cursor-pointer">Featured Tour</Label>
                                <p className="text-xs text-muted-foreground">Display on homepage</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
