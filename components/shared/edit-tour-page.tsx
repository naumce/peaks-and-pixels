'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    ArrowLeft, Loader2, Save, Eye, MapPin, Camera, DollarSign, FileText,
    Route, Upload, X, Plus, Trash2
} from 'lucide-react';

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
    images?: string[];
}

interface EditTourPageProps {
    apiBase: string;
    backLink: string;
    successRedirect: string;
    showFeaturedToggle?: boolean;
}

const TABS = [
    { id: 'basics', label: 'Basics', icon: FileText },
    { id: 'route', label: 'Route', icon: Route },
    { id: 'details', label: 'Details', icon: Camera },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
];

export function EditTourPage({ apiBase, backLink, successRedirect, showFeaturedToggle = true }: EditTourPageProps) {
    const params = useParams();
    const router = useRouter();
    const tourId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('basics');

    const [formData, setFormData] = useState({
        name: '', tagline: '', description: '', difficulty: 'moderate',
        duration_days: 1, location_area: '', meeting_point: '',
        base_price: 89, max_participants: 12, min_participants: 2,
        whats_included: '', whats_not_included: '', what_to_bring: '',
        status: 'draft', is_featured: false, photo_opportunities: true,
        itinerary: [] as { time: string; title: string; description: string }[],
    });

    const [routeData, setRouteData] = useState<{ points: RoutePoint[]; distance: number } | null>(null);
    const [meetingPoint, setMeetingPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [routeMode, setRouteMode] = useState<'route' | 'meeting'>('route');
    const [selectedPointIndex, setSelectedPointIndex] = useState(-1);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [slug, setSlug] = useState<string>('');

    useEffect(() => { loadTour(); }, [tourId]);

    const loadTour = async () => {
        try {
            const res = await fetch(`${apiBase}/${tourId}`);
            if (!res.ok) throw new Error('Failed to load tour');
            const tour = await res.json();

            setFormData({
                name: tour.name || '', tagline: tour.tagline || '', description: tour.description || '',
                difficulty: tour.difficulty || 'moderate', duration_days: tour.duration_minutes ? Math.round(tour.duration_minutes / 480) : 1,
                location_area: tour.location_area || '', meeting_point: tour.meeting_point || '',
                base_price: tour.base_price || 89, max_participants: tour.max_participants || 12,
                min_participants: tour.min_participants || 2,
                whats_included: Array.isArray(tour.whats_included) ? tour.whats_included.join('\n') : '',
                whats_not_included: Array.isArray(tour.whats_not_included) ? tour.whats_not_included.join('\n') : '',
                what_to_bring: Array.isArray(tour.what_to_bring) ? tour.what_to_bring.join('\n') : '',
                status: tour.status || 'draft', is_featured: tour.is_featured || false,
                photo_opportunities: tour.photo_opportunities !== false,
                itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
            });
            setSlug(tour.slug || '');
            if (tour.cover_image) setCoverImage(tour.cover_image);
            if (tour.route_data?.features) {
                const points = tour.route_data.features.map((f: any) => ({
                    lat: f.geometry?.coordinates?.[1] || 0, lng: f.geometry?.coordinates?.[0] || 0,
                    type: f.properties?.type || 'waypoint', title: f.properties?.title || '',
                    description: f.properties?.description || '', images: f.properties?.images || [],
                }));
                setRouteData({ points, distance: tour.distance_km || 0 });
            }
            if (tour.meeting_point_lat && tour.meeting_point_lng) {
                setMeetingPoint({ lat: tour.meeting_point_lat, lng: tour.meeting_point_lng });
            }
        } catch (err) {
            console.error('Error loading tour:', err);
            setError('Failed to load tour');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true); setError('');
        try {
            const tourData = {
                name: formData.name, tagline: formData.tagline, description: formData.description,
                difficulty: formData.difficulty, duration_minutes: formData.duration_days * 480,
                duration_display: `${formData.duration_days} day${formData.duration_days > 1 ? 's' : ''}`,
                location_area: formData.location_area, meeting_point: formData.meeting_point,
                base_price: formData.base_price, max_participants: formData.max_participants,
                min_participants: formData.min_participants,
                whats_included: formData.whats_included.split('\n').filter(i => i.trim()),
                whats_not_included: formData.whats_not_included.split('\n').filter(i => i.trim()),
                what_to_bring: formData.what_to_bring.split('\n').filter(i => i.trim()),
                status: formData.status,
                is_featured: showFeaturedToggle ? formData.is_featured : undefined,
                photo_opportunities: formData.photo_opportunities,
                itinerary: formData.itinerary.filter(item => item.title.trim()),
                cover_image: coverImage, featured_images: coverImage ? [coverImage] : [],
                route_data: routeData?.points ? {
                    type: 'FeatureCollection',
                    features: routeData.points.map((p, i) => ({
                        type: 'Feature',
                        properties: { index: i, title: p.title, type: p.type, description: p.description, images: p.images || [] },
                        geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
                    })),
                    route: { type: 'LineString', coordinates: routeData.points.map(p => [p.lng, p.lat]) }
                } : null,
                distance_km: routeData?.distance || 0,
                meeting_point_lat: meetingPoint?.lat || null, meeting_point_lng: meetingPoint?.lng || null,
            };

            const res = await fetch(`${apiBase}/${tourId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tourData) });
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to save tour'); }
            router.push(successRedirect); router.refresh();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        setUploadingCover(true);
        const reader = new FileReader();
        reader.onloadend = () => { setCoverImage(reader.result as string); setUploadingCover(false); };
        reader.readAsDataURL(file);
    };

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full" asChild><Link href={backLink}><ArrowLeft className="h-5 w-5" /></Link></Button>
                    <div><h1 className="text-2xl font-bold text-foreground">Edit Tour</h1><p className="text-muted-foreground">{formData.name || 'Loading...'}</p></div>
                </div>
                <div className="flex gap-2">
                    {slug && <Button variant="outline" className="rounded-xl" asChild><Link href={`/tours/${slug}`} target="_blank"><Eye className="h-4 w-4 mr-2" />Preview</Link></Button>}
                    <Button onClick={handleSave} disabled={saving} className="gradient-primary text-white rounded-xl glow-hover">
                        {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4 mr-2" />Save Changes</>)}
                    </Button>
                </div>
            </div>

            {error && <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">{error}</div>}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {TABS.map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap', activeTab === tab.id ? 'bg-primary text-white' : 'bg-secondary/50 text-muted-foreground hover:bg-secondary')}>
                        <tab.icon className="h-4 w-4" />{tab.label}
                    </button>
                ))}
            </div>

            {/* BASICS TAB */}
            {activeTab === 'basics' && (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Cover Image</h2>
                            <div className="relative h-48 rounded-xl overflow-hidden bg-secondary/30">
                                {coverImage ? (
                                    <><img src={coverImage} alt="Cover" className="w-full h-full object-cover" /><button onClick={() => setCoverImage(null)} className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"><X className="h-4 w-4" /></button></>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-full cursor-pointer hover:bg-secondary/50 transition-all">
                                        <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                                        {uploadingCover ? <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> : <><Upload className="h-8 w-8 text-muted-foreground mb-2" /><span className="text-sm text-muted-foreground">Click to upload cover image</span></>}
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
                            <div className="space-y-2"><Label>Tour Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Matka Canyon Adventure" className="h-12 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Short Description *</Label><Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="A stunning day hike..." className="h-12 rounded-xl" /></div>
                            <div className="space-y-2"><Label>Full Description</Label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed tour description..." rows={4} className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" /></div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Difficulty</Label><select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground"><option value="easy">Easy</option><option value="moderate">Moderate</option><option value="hard">Hard</option><option value="expert">Expert</option></select></div>
                                <div className="space-y-2"><Label>Location Area</Label><Input value={formData.location_area} onChange={(e) => setFormData({ ...formData, location_area: e.target.value })} placeholder="Matka, Macedonia" className="h-12 rounded-xl" /></div>
                            </div>
                            <div className="space-y-2"><Label>Meeting Point</Label><Input value={formData.meeting_point} onChange={(e) => setFormData({ ...formData, meeting_point: e.target.value })} placeholder="Hotel Continental, Skopje" className="h-12 rounded-xl" /></div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                            <h2 className="text-lg font-semibold text-foreground">Status</h2>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground">
                                <option value="draft">Draft</option>
                                <option value="active">Active</option>
                                <option value="archived">Archived</option>
                            </select>
                            {showFeaturedToggle && (
                                <label className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 cursor-pointer">
                                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="h-4 w-4 rounded" />
                                    <div><span className="font-medium text-foreground">Featured Tour</span><p className="text-xs text-muted-foreground">Display on homepage</p></div>
                                </label>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ROUTE TAB */}
            {activeTab === 'route' && (
                <div className="space-y-6">
                    <div className="flex gap-2 mb-4">
                        <Button variant={routeMode === 'route' ? 'default' : 'outline'} onClick={() => setRouteMode('route')} className="rounded-xl"><Route className="h-4 w-4 mr-2" />Route Points</Button>
                        <Button variant={routeMode === 'meeting' ? 'default' : 'outline'} onClick={() => setRouteMode('meeting')} className="rounded-xl"><MapPin className="h-4 w-4 mr-2" />Meeting Point</Button>
                    </div>
                    <div className="h-[500px] rounded-2xl overflow-hidden border border-border/50">
                        <RouteMapEditor mode={routeMode} onRouteChange={setRouteData} onMeetingPointChange={setMeetingPoint} existingRoute={routeData?.points} meetingPoint={meetingPoint} selectedPointIndex={selectedPointIndex} onPointSelect={setSelectedPointIndex} />
                    </div>
                    {routeData && routeData.points.length > 0 && (
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                            <p className="text-sm text-muted-foreground"><strong className="text-foreground">{routeData.points.length}</strong> waypoints • <strong className="text-foreground ml-1">{routeData.distance.toFixed(1)}</strong> km</p>
                        </div>
                    )}
                </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <Label className="text-base flex items-center gap-2"><span className="text-xl">✅</span> Included</Label>
                        <textarea value={formData.whats_included} onChange={(e) => setFormData({ ...formData, whats_included: e.target.value })} placeholder="Professional guide&#10;Transportation&#10;Lunch" rows={6} className="w-full px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <Label className="text-base flex items-center gap-2"><span className="text-xl">❌</span> Not Included</Label>
                        <textarea value={formData.whats_not_included} onChange={(e) => setFormData({ ...formData, whats_not_included: e.target.value })} placeholder="Personal expenses&#10;Tips" rows={6} className="w-full px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                    </div>
                    <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <Label className="text-base flex items-center gap-2"><span className="text-xl">🎒</span> What to Bring</Label>
                        <textarea value={formData.what_to_bring} onChange={(e) => setFormData({ ...formData, what_to_bring: e.target.value })} placeholder="Comfortable shoes&#10;Water bottle&#10;Camera" rows={3} className="w-full px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                    </div>
                    <div className="lg:col-span-2">
                        <label className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-all">
                            <input type="checkbox" checked={formData.photo_opportunities} onChange={(e) => setFormData({ ...formData, photo_opportunities: e.target.checked })} className="w-5 h-5 rounded border-border accent-primary" />
                            <div className="flex-1"><div className="flex items-center gap-2"><span className="text-xl">📸</span><span className="font-medium text-foreground">Photo Opportunities Included</span></div><p className="text-sm text-muted-foreground mt-0.5">Show guests that this tour has dedicated photo stops</p></div>
                        </label>
                    </div>
                    <div className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                        <div><Label className="text-base flex items-center gap-2"><span className="text-xl">🗓️</span> Tour Itinerary</Label><p className="text-sm text-muted-foreground mt-1">Add the timeline of activities</p></div>
                        <div className="space-y-3">
                            {formData.itinerary.map((item, index) => (
                                <div key={index} className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                    <div className="w-20"><Input value={item.time} onChange={(e) => { const n = [...formData.itinerary]; n[index].time = e.target.value; setFormData({ ...formData, itinerary: n }); }} placeholder="08:00" className="h-10 text-center text-sm" /></div>
                                    <div className="flex-1 space-y-2">
                                        <Input value={item.title} onChange={(e) => { const n = [...formData.itinerary]; n[index].title = e.target.value; setFormData({ ...formData, itinerary: n }); }} placeholder="Activity title" className="h-10" />
                                        <Input value={item.description} onChange={(e) => { const n = [...formData.itinerary]; n[index].description = e.target.value; setFormData({ ...formData, itinerary: n }); }} placeholder="Brief description..." />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-10 w-10 flex-shrink-0" onClick={() => setFormData({ ...formData, itinerary: formData.itinerary.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full rounded-xl border-dashed border-2" onClick={() => setFormData({ ...formData, itinerary: [...formData.itinerary, { time: '', title: '', description: '' }] })}><Plus className="h-4 w-4 mr-2" /> Add Itinerary Item</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
                <div className="max-w-xl mx-auto space-y-6">
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                        <div className="text-center mb-8">
                            <p className="text-muted-foreground mb-2">Price per person</p>
                            <div className="flex items-center justify-center gap-2"><span className="text-4xl text-muted-foreground">€</span><input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })} className="text-7xl font-bold bg-transparent text-foreground w-40 text-center focus:outline-none" /></div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2"><Label>Min Participants</Label><Input type="number" min="1" value={formData.min_participants} onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) || 1 })} className="h-12 rounded-xl text-center" /></div>
                            <div className="space-y-2"><Label>Max Participants</Label><Input type="number" min="1" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })} className="h-12 rounded-xl text-center" /></div>
                        </div>
                    </div>
                    <div className="space-y-2"><Label>Duration</Label><div className="flex items-center gap-4"><Input type="number" min="1" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })} className="h-14 w-24 rounded-xl text-center text-xl" /><span className="text-muted-foreground">day{formData.duration_days > 1 ? 's' : ''}</span></div></div>
                </div>
            )}
        </div>
    );
}
