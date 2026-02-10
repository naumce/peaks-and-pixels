'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function NewEventPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_datetime: '',
        end_datetime: '',
        location: '',
        meeting_point: '',
        max_participants: '',
        is_paid: false,
        price: '',
        is_public: true,
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`/api/clubs/${slug}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
                    price: formData.is_paid && formData.price ? parseFloat(formData.price) : null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create event');
                return;
            }

            router.push(`/clubs/${slug}/manage/events`);
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/clubs/${slug}/manage/events`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Create Event</h1>
                            <p className="text-sm text-muted-foreground">
                                Organize a new activity for your club
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Info */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Event Details
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="title">Event Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Saturday Morning Hike"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Tell participants what to expect..."
                                rows={4}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="start">Start Date & Time *</Label>
                                <Input
                                    id="start"
                                    type="datetime-local"
                                    value={formData.start_datetime}
                                    onChange={(e) => setFormData({ ...formData, start_datetime: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">End Date & Time</Label>
                                <Input
                                    id="end"
                                    type="datetime-local"
                                    value={formData.end_datetime}
                                    onChange={(e) => setFormData({ ...formData, end_datetime: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            Location
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g., Triglav National Park"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="meeting_point">Meeting Point</Label>
                            <Input
                                id="meeting_point"
                                value={formData.meeting_point}
                                onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })}
                                placeholder="e.g., Parking lot at the trailhead"
                            />
                        </div>
                    </div>

                    {/* Participants */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Participants
                        </h2>

                        <div className="space-y-2">
                            <Label htmlFor="max">Maximum Participants</Label>
                            <Input
                                id="max"
                                type="number"
                                min="1"
                                value={formData.max_participants}
                                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                                placeholder="Leave empty for unlimited"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Pricing
                        </h2>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.is_paid}
                                onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                                className="w-5 h-5 rounded"
                            />
                            <span className="font-medium">This is a paid event</span>
                        </label>

                        {formData.is_paid && (
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (EUR) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    required={formData.is_paid}
                                />
                            </div>
                        )}
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
                            disabled={loading || !formData.title || !formData.start_datetime}
                        >
                            {loading ? 'Creating...' : 'Create Event'}
                        </Button>
                        <Link href={`/clubs/${slug}/manage/events`}>
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
