'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, MapPin, Camera, Loader2, Trash2, Upload, Mountain, List, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

// Dynamic import for map (avoid SSR issues)
const RouteMapEditor = dynamic(
    () => import('@/components/admin/route-map-editor').then(mod => ({ default: mod.RouteMapEditor })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ),
    }
);

interface RoutePoint {
    lat: number;
    lng: number;
    type?: string;
    title?: string;
    description?: string;
    elevation?: number;
    images?: string[];
}

export default function TourRouteEditorPage() {
    const router = useRouter();
    const params = useParams();
    const tourId = params.id as string;

    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [mode, setMode] = useState<'route' | 'meeting'>('route');
    const [routeData, setRouteData] = useState<{ points: RoutePoint[]; distance: number } | null>(null);
    const [meetingPoint, setMeetingPoint] = useState<{ lat: number; lng: number; address?: string } | null>(null);
    const [selectedPointIndex, setSelectedPointIndex] = useState(-1);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !routeData || selectedPointIndex === -1) return;

        setUploading(true);
        const supabase = createClient();
        const uploadedUrls: string[] = [];

        try {
            for (const file of Array.from(e.target.files)) {
                const fileName = `waypoint-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
                const { data, error } = await supabase.storage
                    .from('tour-images')
                    .upload(`routes/${tourId}/${fileName}`, file);

                if (error) {
                    console.error('Upload error:', error);
                    continue;
                }

                const { data: urlData } = supabase.storage
                    .from('tour-images')
                    .getPublicUrl(`routes/${tourId}/${fileName}`);

                if (urlData?.publicUrl) {
                    uploadedUrls.push(urlData.publicUrl);
                }
            }

            if (uploadedUrls.length > 0) {
                const newPoints = [...routeData.points];
                const currentImages = newPoints[selectedPointIndex].images || [];
                newPoints[selectedPointIndex] = {
                    ...newPoints[selectedPointIndex],
                    images: [...currentImages, ...uploadedUrls],
                };
                setRouteData({ ...routeData, points: newPoints });
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload images');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const removeImage = (imageIndex: number) => {
        if (!routeData || selectedPointIndex === -1) return;

        const newPoints = [...routeData.points];
        const currentImages = [...(newPoints[selectedPointIndex].images || [])];
        currentImages.splice(imageIndex, 1);
        newPoints[selectedPointIndex] = {
            ...newPoints[selectedPointIndex],
            images: currentImages,
        };
        setRouteData({ ...routeData, points: newPoints });
    };

    const handleRouteChange = (data: { points: RoutePoint[]; distance: number }) => {
        setRouteData(data);
        if (selectedPointIndex >= data.points.length) {
            setSelectedPointIndex(-1);
        }
    };

    const handlePointUpdate = (field: string, value: string) => {
        if (selectedPointIndex === -1 || !routeData) return;

        const newPoints = [...routeData.points];
        newPoints[selectedPointIndex] = {
            ...newPoints[selectedPointIndex],
            [field]: value,
        };

        setRouteData({ ...routeData, points: newPoints });
    };

    const handleMeetingPointChange = (point: { lat: number; lng: number }) => {
        setMeetingPoint(prev => ({
            ...prev,
            lat: point.lat,
            lng: point.lng,
            address: prev?.address || '',
        }));
    };

    const saveRoute = async () => {
        if (!routeData || routeData.points.length < 2) {
            alert('Please draw a route with at least 2 points');
            return;
        }

        setSaving(true);

        try {
            const routePayload = {
                tourId,
                routeData: {
                    type: 'LineString',
                    coordinates: routeData.points.map(p => [p.lng, p.lat]),
                },
                distanceKm: routeData.distance,
                meetingPoint,
                waypoints: routeData.points
                    .filter(p => p.title || p.description || (p.images && p.images.length > 0))
                    .map((p, index) => ({
                        position: { lat: p.lat, lng: p.lng },
                        type: p.type || 'waypoint',
                        title: p.title || `Waypoint ${index + 1}`,
                        description: p.description,
                        images: p.images,
                    })),
            };

            const res = await fetch('/api/admin/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(routePayload),
            });

            if (res.ok) {
                router.push('/admin/tours');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save route');
            }
        } catch (error) {
            console.error('Failed to save route:', error);
            alert('Failed to save route');
        } finally {
            setSaving(false);
        }
    };

    const selectedPoint = routeData?.points && selectedPointIndex !== -1
        ? routeData.points[selectedPointIndex]
        : null;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/tours">
                        <Button type="button" variant="ghost" size="icon" className="rounded-xl">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Route Editor</h1>
                        <p className="text-muted-foreground">Draw the tour route and add photo points</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Mode Switcher */}
                    <div className="flex rounded-xl overflow-hidden border border-border/50 bg-secondary/30">
                        <button
                            onClick={() => setMode('route')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-apple',
                                mode === 'route' ? 'bg-primary text-white' : 'hover:bg-secondary'
                            )}
                        >
                            Draw Route
                        </button>
                        <button
                            onClick={() => setMode('meeting')}
                            className={cn(
                                'px-4 py-2 text-sm font-medium transition-apple flex items-center gap-2',
                                mode === 'meeting' ? 'bg-red-500 text-white' : 'hover:bg-secondary'
                            )}
                        >
                            <MapPin className="w-4 h-4" />
                            Meeting Point
                        </button>
                    </div>
                    <Button
                        onClick={saveRoute}
                        disabled={saving}
                        className="gradient-primary text-white rounded-xl"
                    >
                        {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Route
                    </Button>
                </div>
            </div>

            {/* Map and Sidebar */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Map */}
                <div className="lg:col-span-2 h-[600px]">
                    <RouteMapEditor
                        onRouteChange={handleRouteChange}
                        onMeetingPointChange={handleMeetingPointChange}
                        meetingPoint={meetingPoint || undefined}
                        existingRoute={routeData?.points}
                        mode={mode}
                        selectedPointIndex={selectedPointIndex}
                        onPointSelect={setSelectedPointIndex}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Meeting Point Card */}
                    {(mode === 'meeting' || meetingPoint) && (
                        <div className={cn(
                            'rounded-2xl border bg-card p-6 space-y-4 transition-apple',
                            mode === 'meeting' ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-border/50'
                        )}>
                            <div className="flex items-center gap-2 text-red-500">
                                <MapPin className="w-5 h-5" />
                                <h3 className="font-semibold">Meeting Point</h3>
                            </div>

                            {!meetingPoint ? (
                                <div className="text-center py-6 text-muted-foreground">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Click the map to set meeting point</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-2 text-xs bg-secondary/50 p-3 rounded-xl">
                                        <div>
                                            <span className="text-muted-foreground">Lat:</span>
                                            <span className="ml-1 font-mono">{meetingPoint.lat.toFixed(6)}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Lng:</span>
                                            <span className="ml-1 font-mono">{meetingPoint.lng.toFixed(6)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="meeting-address">Instructions</Label>
                                        <textarea
                                            id="meeting-address"
                                            className="w-full px-3 py-2 text-sm rounded-xl bg-secondary/50 border border-border/50 min-h-[80px]"
                                            placeholder="e.g. Meet at the parking lot near the coffee shop..."
                                            value={meetingPoint.address || ''}
                                            onChange={(e) => setMeetingPoint({ ...meetingPoint, address: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Selected Point Details */}
                    <div className={cn(
                        'rounded-2xl border bg-card p-6 space-y-4 transition-apple',
                        selectedPoint ? 'border-primary/50 ring-2 ring-primary/20' : 'border-border/50'
                    )}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Camera className="w-5 h-5 text-primary" />
                                <h3 className="font-semibold">Point Details</h3>
                            </div>
                            {selectedPoint && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg">
                                    #{selectedPointIndex + 1}
                                </span>
                            )}
                        </div>

                        {!selectedPoint ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Click a point on the route to add details</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="point-title">Title</Label>
                                    <Input
                                        id="point-title"
                                        value={selectedPoint.title || ''}
                                        onChange={(e) => handlePointUpdate('title', e.target.value)}
                                        placeholder="e.g. Scenic Viewpoint"
                                        className="rounded-xl"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="point-desc">Description</Label>
                                    <textarea
                                        id="point-desc"
                                        className="w-full px-3 py-2 text-sm rounded-xl bg-secondary/50 border border-border/50 min-h-[60px]"
                                        placeholder="Describe this spot..."
                                        value={selectedPoint.description || ''}
                                        onChange={(e) => handlePointUpdate('description', e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <select
                                            value={selectedPoint.type || 'waypoint'}
                                            onChange={(e) => handlePointUpdate('type', e.target.value)}
                                            className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/50"
                                        >
                                            <option value="waypoint">Waypoint</option>
                                            <option value="photo">Photo Spot</option>
                                            <option value="viewpoint">Viewpoint</option>
                                            <option value="rest">Rest Stop</option>
                                            <option value="danger">Warning</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="point-elevation">Elevation (m)</Label>
                                        <Input
                                            id="point-elevation"
                                            type="number"
                                            value={selectedPoint.elevation || ''}
                                            onChange={(e) => handlePointUpdate('elevation', e.target.value)}
                                            placeholder="1250"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Images Section */}
                                <div className="space-y-2">
                                    <Label>Photos</Label>
                                    {selectedPoint.images && selectedPoint.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {selectedPoint.images.map((img, i) => (
                                                <div key={i} className="relative group">
                                                    <img
                                                        src={img}
                                                        alt={`Photo ${i + 1}`}
                                                        className="w-full aspect-square object-cover rounded-lg"
                                                    />
                                                    <button
                                                        onClick={() => removeImage(i)}
                                                        className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 border border-dashed border-border/50 hover:bg-secondary cursor-pointer transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span className="text-sm">Upload Photos</span>
                                            </>
                                        )}
                                    </label>
                                </div>

                                <div className="pt-2 text-xs text-muted-foreground border-t border-border/50">
                                    Lat: {selectedPoint.lat.toFixed(6)}, Lng: {selectedPoint.lng.toFixed(6)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Route Stats */}
                    {routeData && routeData.points.length > 0 && (
                        <div className="rounded-2xl border border-border/50 bg-card p-6">
                            <h3 className="font-semibold mb-4">Route Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-xl bg-secondary/30">
                                    <p className="text-2xl font-bold text-primary">{routeData.points.length}</p>
                                    <p className="text-xs text-muted-foreground">Waypoints</p>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-secondary/30">
                                    <p className="text-2xl font-bold text-primary">{routeData.distance.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">Kilometers</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Waypoints List */}
                    {routeData && routeData.points.length > 0 && (
                        <div className="rounded-2xl border border-border/50 bg-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Waypoints</h3>
                                <List className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {routeData.points.map((point, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedPointIndex(index)}
                                        className={cn(
                                            'w-full p-3 rounded-xl text-left transition-all flex items-center gap-3',
                                            selectedPointIndex === index
                                                ? 'bg-primary/10 border border-primary/50'
                                                : 'bg-secondary/30 hover:bg-secondary/50'
                                        )}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">
                                                {point.title || `Waypoint ${index + 1}`}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                <span className="capitalize">{point.type || 'waypoint'}</span>
                                                {point.images && point.images.length > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Camera className="w-3 h-3" />
                                                        {point.images.length}
                                                    </span>
                                                )}
                                                {point.elevation && (
                                                    <span className="flex items-center gap-1">
                                                        <Mountain className="w-3 h-3" />
                                                        {point.elevation}m
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
