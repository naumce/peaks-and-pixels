'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
    ArrowLeft, ArrowRight, Save, Check, Loader2,
    FileText, MapPin, Camera, DollarSign, Sparkles,
    Route, PartyPopper, Image, Upload
} from 'lucide-react';

const RouteMapEditor = dynamic(
    () => import('@/components/admin/route-map-editor').then(mod => ({ default: mod.RouteMapEditor })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl">
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

interface CreateTourWizardProps {
    apiEndpoint: string;
    backLink: string;
    successRedirect: string;
    showFeaturedToggle?: boolean;
}

const TABS = [
    { id: 'basics', label: 'Basics', icon: FileText, description: 'Name & description' },
    { id: 'route', label: 'Route', icon: Route, description: 'Draw the path' },
    { id: 'details', label: 'Details', icon: Camera, description: "What's included" },
    { id: 'pricing', label: 'Pricing', icon: DollarSign, description: 'Set your price' },
    { id: 'publish', label: 'Publish', icon: Sparkles, description: 'Go live!' },
];

export function CreateTourWizard({ apiEndpoint, backLink, successRedirect, showFeaturedToggle = true }: CreateTourWizardProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('basics');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        tagline: '',
        description: '',
        difficulty: 'moderate',
        duration_days: 1,
        location_area: '',
        meeting_point: '',
        base_price: 89,
        max_participants: 12,
        min_participants: 2,
        whats_included: 'Professional guide\nTransportation\nLunch',
        whats_not_included: 'Personal expenses\nTips',
        what_to_bring: 'Comfortable shoes\nWater bottle\nCamera',
        status: 'draft',
        is_featured: false,
        notifications_required: [] as string[],
        photo_opportunities: true,
        itinerary: [] as { time: string; title: string; description: string }[],
    });

    const [routeData, setRouteData] = useState<{ points: RoutePoint[]; distance: number } | null>(null);
    const [meetingPoint, setMeetingPoint] = useState<{ lat: number; lng: number } | null>(null);
    const [routeMode, setRouteMode] = useState<'route' | 'meeting'>('route');
    const [selectedPointIndex, setSelectedPointIndex] = useState(-1);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [uploadingCover, setUploadingCover] = useState(false);

    const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
    const progress = ((currentTabIndex + 1) / TABS.length) * 100;

    const canProceed = () => {
        switch (activeTab) {
            case 'basics':
                return formData.name && formData.tagline && formData.location_area;
            case 'route':
                return true;
            case 'details':
                return true;
            case 'pricing':
                return formData.base_price > 0;
            default:
                return true;
        }
    };

    const nextTab = () => {
        const idx = TABS.findIndex(t => t.id === activeTab);
        if (idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
    };

    const prevTab = () => {
        const idx = TABS.findIndex(t => t.id === activeTab);
        if (idx > 0) setActiveTab(TABS[idx - 1].id);
    };

    const handleSave = async (publish = false) => {
        setSaving(true);
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
                status: publish ? 'active' : formData.status,
                is_featured: showFeaturedToggle ? formData.is_featured : false,
                cover_image: coverImage,
                route_data: routeData?.points ? {
                    type: 'FeatureCollection',
                    features: routeData.points.map((p, i) => ({
                        type: 'Feature',
                        properties: { index: i, title: p.title, type: p.type, description: p.description, images: p.images || [] },
                        geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
                    })), route: {
                        type: 'LineString',
                        coordinates: routeData.points.map(p => [p.lng, p.lat]),
                    }
                } : null,
                distance_km: routeData?.distance || 0,
                meeting_point_lat: meetingPoint?.lat || null,
                meeting_point_lng: meetingPoint?.lng || null,
                itinerary: formData.itinerary.filter(item => item.title.trim()),
                photo_opportunities: formData.photo_opportunities,
            };

            const res = await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tourData),
            });

            if (res.ok) {
                setSaved(true);
                setTimeout(() => {
                    router.push(successRedirect);
                }, 1500);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to save tour');
            }
        } catch (error) {
            console.error('Failed to save:', error);
            alert('Failed to save tour');
        } finally {
            setSaving(false);
        }
    };

    if (saved) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
                <div className="text-center animate-in zoom-in-50 fade-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <PartyPopper className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Tour Created! 🎉</h1>
                    <p className="text-muted-foreground">Redirecting to tours page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Floating Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href={backLink}>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Create Tour</h1>
                                <p className="text-sm text-muted-foreground">{formData.name || 'Untitled Tour'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleSave(false)}>
                                <Save className="h-4 w-4 mr-2" />
                                Save Draft
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pt-28 pb-24 max-w-6xl mx-auto px-6">
                <div className="grid lg:grid-cols-[280px_1fr] gap-8">
                    {/* Tab Navigation */}
                    <div className="space-y-2">
                        {TABS.map((tab, idx) => {
                            const isActive = activeTab === tab.id;
                            const isPast = idx < currentTabIndex;
                            const Icon = tab.icon;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group',
                                        isActive
                                            ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25'
                                            : isPast
                                                ? 'bg-secondary/50 hover:bg-secondary'
                                                : 'hover:bg-secondary/50'
                                    )}
                                >
                                    <div className={cn(
                                        'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                                        isActive
                                            ? 'bg-white/20'
                                            : isPast
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-secondary group-hover:bg-secondary'
                                    )}>
                                        {isPast && !isActive ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className={cn('font-semibold', isActive ? 'text-white' : 'text-foreground')}>{tab.label}</p>
                                        <p className={cn('text-sm', isActive ? 'text-white/70' : 'text-muted-foreground')}>{tab.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[600px]">
                        {/* BASICS TAB */}
                        {activeTab === 'basics' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Let&apos;s start with the basics</h2>
                                    <p className="text-muted-foreground">Give your tour a name and description that will attract adventurers.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-base">Tour Name *</Label>
                                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Matka Canyon Adventure" className="h-14 text-lg rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="tagline" className="text-base">Short Description *</Label>
                                        <Input id="tagline" value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="A stunning day hike through beautiful canyon..." className="h-14 rounded-xl" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-base">Full Description</Label>
                                        <textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the experience in detail..." rows={6} className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="location_area" className="text-base">Location *</Label>
                                            <Input id="location_area" value={formData.location_area} onChange={(e) => setFormData({ ...formData, location_area: e.target.value })} placeholder="Matka, Macedonia" className="h-14 rounded-xl" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="difficulty" className="text-base">Difficulty</Label>
                                            <select id="difficulty" value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="w-full h-14 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground">
                                                <option value="easy">Easy</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="hard">Hard</option>
                                                <option value="expert">Expert</option>
                                            </select>
                                        </div>
                                    </div>
                                    {/* Cover Photo */}
                                    <div className="space-y-2">
                                        <Label className="text-base flex items-center gap-2"><Image className="w-4 h-4" /> Cover Photo</Label>
                                        <p className="text-sm text-muted-foreground">This image will be used as thumbnail for the tour</p>
                                        {coverImage ? (
                                            <div className="relative rounded-2xl overflow-hidden border border-border/50 group">
                                                <img src={coverImage} alt="Cover" className="w-full h-64 object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button variant="destructive" size="sm" onClick={() => setCoverImage(null)} className="rounded-full">Remove Cover</Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center gap-4 p-12 rounded-2xl bg-secondary/30 border-2 border-dashed border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors">
                                                <input type="file" accept="image/*" onChange={async (e) => {
                                                    if (!e.target.files?.[0]) return;
                                                    setUploadingCover(true);
                                                    const file = e.target.files[0];
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => { setCoverImage(reader.result as string); setUploadingCover(false); };
                                                    reader.readAsDataURL(file);
                                                    e.target.value = '';
                                                }} className="hidden" />
                                                {uploadingCover ? (
                                                    <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
                                                ) : (
                                                    <>
                                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Upload className="w-8 h-8 text-primary" /></div>
                                                        <div className="text-center"><p className="font-medium text-foreground">Click to upload cover photo</p><p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p></div>
                                                    </>
                                                )}
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ROUTE TAB */}
                        {activeTab === 'route' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground mb-2">Draw the adventure</h2>
                                        <p className="text-muted-foreground">Click on the map to create waypoints. Drag to reposition.</p>
                                    </div>
                                    <div className="flex rounded-xl overflow-hidden border border-border/50 bg-secondary/30">
                                        <button onClick={() => setRouteMode('route')} className={cn('px-4 py-2 text-sm font-medium transition-all flex items-center gap-2', routeMode === 'route' ? 'bg-primary text-white' : 'hover:bg-secondary')}>
                                            <Route className="w-4 h-4" /> Route
                                        </button>
                                        <button onClick={() => setRouteMode('meeting')} className={cn('px-4 py-2 text-sm font-medium transition-all flex items-center gap-2', routeMode === 'meeting' ? 'bg-red-500 text-white' : 'hover:bg-secondary')}>
                                            <MapPin className="w-4 h-4" /> Meeting
                                        </button>
                                    </div>
                                </div>
                                <div className="h-[550px]">
                                    <RouteMapEditor onRouteChange={setRouteData} onMeetingPointChange={setMeetingPoint} existingRoute={routeData?.points} meetingPoint={meetingPoint || undefined} mode={routeMode} selectedPointIndex={selectedPointIndex} onPointSelect={setSelectedPointIndex} />
                                </div>
                                {selectedPointIndex >= 0 && routeData?.points[selectedPointIndex] && (
                                    <div className="p-6 rounded-2xl border border-border/50 bg-card animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center"><Camera className="w-5 h-5 text-primary" /></div>
                                            <div><h3 className="font-semibold">Waypoint #{selectedPointIndex + 1}</h3><p className="text-sm text-muted-foreground">Add details and photos for this stop</p></div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input value={routeData.points[selectedPointIndex].title || ''} onChange={(e) => { const newPoints = [...routeData.points]; newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], title: e.target.value }; setRouteData({ ...routeData, points: newPoints }); }} placeholder="Scenic Viewpoint" className="rounded-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <select value={routeData.points[selectedPointIndex].type || 'waypoint'} onChange={(e) => { const newPoints = [...routeData.points]; newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], type: e.target.value }; setRouteData({ ...routeData, points: newPoints }); }} className="w-full h-10 px-3 rounded-xl bg-secondary/50 border border-border/50">
                                                        <option value="waypoint">Waypoint</option>
                                                        <option value="photo">📷 Photo Spot</option>
                                                        <option value="viewpoint">🏔️ Viewpoint</option>
                                                        <option value="rest">☕ Rest Stop</option>
                                                        <option value="danger">⚠️ Warning</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Description</Label>
                                                <textarea value={routeData.points[selectedPointIndex].description || ''} onChange={(e) => { const newPoints = [...routeData.points]; newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], description: e.target.value }; setRouteData({ ...routeData, points: newPoints }); }} placeholder="Describe what visitors will see or experience at this point..." rows={3} className="w-full px-3 py-2 text-sm rounded-xl bg-secondary/50 border border-border/50 resize-none" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Photos</Label>
                                                {routeData.points[selectedPointIndex].images && routeData.points[selectedPointIndex].images!.length > 0 && (
                                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                                        {routeData.points[selectedPointIndex].images!.map((img, imgIdx) => (
                                                            <div key={imgIdx} className="relative group aspect-square">
                                                                <img src={img} alt={`Photo ${imgIdx + 1}`} className="w-full h-full object-cover rounded-lg" />
                                                                <button onClick={() => { const newPoints = [...routeData.points]; const currentImages = [...(newPoints[selectedPointIndex].images || [])]; currentImages.splice(imgIdx, 1); newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], images: currentImages }; setRouteData({ ...routeData, points: newPoints }); }} className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                <label className="flex items-center justify-center gap-2 p-4 rounded-xl bg-secondary/30 border-2 border-dashed border-border/50 hover:bg-secondary/50 cursor-pointer transition-colors">
                                                    <input type="file" accept="image/*" multiple onChange={async (e) => {
                                                        if (!e.target.files) return;
                                                        const files = Array.from(e.target.files);
                                                        const newImageUrls: string[] = [];
                                                        for (const file of files) {
                                                            const reader = new FileReader();
                                                            const url = await new Promise<string>((resolve) => { reader.onloadend = () => resolve(reader.result as string); reader.readAsDataURL(file); });
                                                            newImageUrls.push(url);
                                                        }
                                                        const newPoints = [...routeData.points];
                                                        const currentImages = newPoints[selectedPointIndex].images || [];
                                                        newPoints[selectedPointIndex] = { ...newPoints[selectedPointIndex], images: [...currentImages, ...newImageUrls] };
                                                        setRouteData({ ...routeData, points: newPoints });
                                                        e.target.value = '';
                                                    }} className="hidden" />
                                                    <Camera className="w-5 h-5 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Click to add photos</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* DETAILS TAB */}
                        {activeTab === 'details' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">What&apos;s included?</h2>
                                    <p className="text-muted-foreground">Let guests know exactly what they&apos;re getting.</p>
                                </div>
                                <div className="grid lg:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-base flex items-center gap-2"><span className="text-xl">✅</span> Included</Label>
                                        <textarea value={formData.whats_included} onChange={(e) => setFormData({ ...formData, whats_included: e.target.value })} placeholder="Professional guide&#10;Transportation&#10;Lunch" rows={6} className="w-full px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-base flex items-center gap-2"><span className="text-xl">❌</span> Not Included</Label>
                                        <textarea value={formData.whats_not_included} onChange={(e) => setFormData({ ...formData, whats_not_included: e.target.value })} placeholder="Personal expenses&#10;Tips" rows={6} className="w-full px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-base flex items-center gap-2"><span className="text-xl">🎒</span> What to Bring</Label>
                                    <textarea value={formData.what_to_bring} onChange={(e) => setFormData({ ...formData, what_to_bring: e.target.value })} placeholder="Comfortable shoes&#10;Water bottle&#10;Camera" rows={4} className="w-full px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
                                </div>
                                {/* Emergency Services */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div>
                                        <Label className="text-base flex items-center gap-2"><span className="text-xl">🚨</span> Notify Emergency Services</Label>
                                        <p className="text-sm text-muted-foreground mt-1">Select which services need to be notified before this tour</p>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {[
                                            { id: 'mountain_rescue', label: 'Mountain Rescue Service', icon: '🏔️', description: 'For hiking & climbing routes' },
                                            { id: 'police', label: 'Local Police', icon: '👮', description: 'General safety notification' },
                                            { id: 'cave_rescue', label: 'Cave Rescue Team', icon: '🦇', description: 'For cave & spelunking tours' },
                                            { id: 'forest_patrol', label: 'Forest Patrol', icon: '🌲', description: 'For wilderness areas' },
                                            { id: 'water_rescue', label: 'Water Rescue Service', icon: '🌊', description: 'For water activities' },
                                            { id: 'alpine_club', label: 'Alpine Club', icon: '⛰️', description: 'Mountain coordination' },
                                        ].map((service) => (
                                            <label key={service.id} className={cn('flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all', formData.notifications_required.includes(service.id) ? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20' : 'bg-secondary/30 border-border/50 hover:bg-secondary/50')}>
                                                <input type="checkbox" checked={formData.notifications_required.includes(service.id)} onChange={(e) => { if (e.target.checked) { setFormData({ ...formData, notifications_required: [...formData.notifications_required, service.id] }); } else { setFormData({ ...formData, notifications_required: formData.notifications_required.filter(id => id !== service.id) }); } }} className="mt-1 h-4 w-4 rounded border-border" />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2"><span className="text-lg">{service.icon}</span><span className="font-medium text-foreground">{service.label}</span></div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {formData.notifications_required.length > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                            <span className="text-blue-500">ℹ️</span>
                                            <p className="text-sm text-blue-600 dark:text-blue-400"><strong>{formData.notifications_required.length}</strong> service{formData.notifications_required.length > 1 ? 's' : ''} will be notified before each tour</p>
                                        </div>
                                    )}
                                </div>
                                {/* Photo Opportunities */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <label className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-all">
                                        <input type="checkbox" checked={formData.photo_opportunities} onChange={(e) => setFormData({ ...formData, photo_opportunities: e.target.checked })} className="w-5 h-5 rounded border-border accent-primary" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2"><span className="text-xl">📸</span><span className="font-medium text-foreground">Photo Opportunities Included</span></div>
                                            <p className="text-sm text-muted-foreground mt-0.5">Show guests that this tour has dedicated photo stops</p>
                                        </div>
                                    </label>
                                </div>
                                {/* Itinerary */}
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <div>
                                        <Label className="text-base flex items-center gap-2"><span className="text-xl">🗓️</span> Tour Itinerary</Label>
                                        <p className="text-sm text-muted-foreground mt-1">Add the timeline of activities for your tour</p>
                                    </div>
                                    <div className="space-y-3">
                                        {formData.itinerary.map((item, index) => (
                                            <div key={index} className="flex gap-3 p-4 rounded-xl bg-secondary/30 border border-border/50">
                                                <div className="w-20"><Input value={item.time} onChange={(e) => { const newItinerary = [...formData.itinerary]; newItinerary[index].time = e.target.value; setFormData({ ...formData, itinerary: newItinerary }); }} placeholder="08:00" className="h-10 text-center text-sm" /></div>
                                                <div className="flex-1 space-y-2">
                                                    <Input value={item.title} onChange={(e) => { const newItinerary = [...formData.itinerary]; newItinerary[index].title = e.target.value; setFormData({ ...formData, itinerary: newItinerary }); }} placeholder="Activity title" className="h-10" />
                                                    <Input value={item.description} onChange={(e) => { const newItinerary = [...formData.itinerary]; newItinerary[index].description = e.target.value; setFormData({ ...formData, itinerary: newItinerary }); }} placeholder="Brief description..." />
                                                </div>
                                                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-10 w-10 flex-shrink-0" onClick={() => { const newItinerary = formData.itinerary.filter((_, i) => i !== index); setFormData({ ...formData, itinerary: newItinerary }); }}>✕</Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" className="w-full rounded-xl border-dashed border-2" onClick={() => setFormData({ ...formData, itinerary: [...formData.itinerary, { time: '', title: '', description: '' }] })}>
                                            <span className="mr-2">+</span> Add Itinerary Item
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRICING TAB */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground mb-2">Set your price</h2>
                                    <p className="text-muted-foreground">Competitive pricing attracts more bookings.</p>
                                </div>
                                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                                    <div className="text-center mb-8">
                                        <p className="text-muted-foreground mb-2">Price per person</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-4xl text-muted-foreground">€</span>
                                            <input type="number" value={formData.base_price} onChange={(e) => setFormData({ ...formData, base_price: parseInt(e.target.value) || 0 })} className="text-7xl font-bold bg-transparent text-foreground w-40 text-center focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-6 max-w-md mx-auto">
                                        <div className="space-y-2"><Label>Min Participants</Label><Input type="number" min="1" value={formData.min_participants} onChange={(e) => setFormData({ ...formData, min_participants: parseInt(e.target.value) || 1 })} className="h-12 rounded-xl text-center" /></div>
                                        <div className="space-y-2"><Label>Max Participants</Label><Input type="number" min="1" value={formData.max_participants} onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 1 })} className="h-12 rounded-xl text-center" /></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Duration</Label>
                                    <div className="flex items-center gap-4">
                                        <Input type="number" min="1" value={formData.duration_days} onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })} className="h-14 w-24 rounded-xl text-center text-xl" />
                                        <span className="text-muted-foreground">day{formData.duration_days > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PUBLISH TAB */}
                        {activeTab === 'publish' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center py-8">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6"><Sparkles className="w-10 h-10 text-white" /></div>
                                    <h2 className="text-3xl font-bold text-foreground mb-2">Ready to go live?</h2>
                                    <p className="text-muted-foreground max-w-md mx-auto">Review your tour details and publish when you&apos;re ready.</p>
                                </div>
                                <div className="p-6 rounded-2xl border border-border/50 bg-card space-y-4">
                                    <h3 className="font-semibold text-lg">{formData.name || 'Untitled Tour'}</h3>
                                    <p className="text-muted-foreground">{formData.tagline}</p>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-3 py-1 rounded-full bg-secondary text-sm">📍 {formData.location_area}</span>
                                        <span className="px-3 py-1 rounded-full bg-secondary text-sm">💪 {formData.difficulty}</span>
                                        <span className="px-3 py-1 rounded-full bg-secondary text-sm">💶 €{formData.base_price}</span>
                                        <span className="px-3 py-1 rounded-full bg-secondary text-sm">👥 {formData.min_participants}-{formData.max_participants}</span>
                                        {routeData && routeData.points.length > 0 && (
                                            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">🗺️ {routeData.points.length} waypoints • {routeData.distance.toFixed(1)}km</span>
                                        )}
                                    </div>
                                </div>
                                {showFeaturedToggle && (
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                                        <input type="checkbox" id="is_featured" checked={formData.is_featured} onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })} className="h-5 w-5 rounded" />
                                        <div>
                                            <Label htmlFor="is_featured" className="cursor-pointer font-medium">Feature this tour</Label>
                                            <p className="text-sm text-muted-foreground">Display prominently on the homepage</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-4">
                                    <Button variant="outline" size="lg" className="flex-1 h-14 rounded-xl" onClick={() => handleSave(false)} disabled={saving}>Save as Draft</Button>
                                    <Button size="lg" className="flex-1 h-14 rounded-xl gradient-primary text-white glow-hover" onClick={() => handleSave(true)} disabled={saving}>
                                        {saving ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Publishing...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Publish Tour</>)}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Floating Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50">
                <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Button variant="ghost" size="lg" onClick={prevTab} disabled={currentTabIndex === 0} className="rounded-xl"><ArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
                    <div className="flex items-center gap-2">
                        {TABS.map((_, idx) => (<div key={idx} className={cn('w-2 h-2 rounded-full transition-all', idx === currentTabIndex ? 'w-8 bg-primary' : idx < currentTabIndex ? 'bg-primary/50' : 'bg-secondary')} />))}
                    </div>
                    {activeTab !== 'publish' ? (
                        <Button size="lg" onClick={nextTab} disabled={!canProceed()} className="rounded-xl gradient-primary text-white">Continue <ArrowRight className="w-5 h-5 ml-2" /></Button>
                    ) : (
                        <div className="w-[120px]" />
                    )}
                </div>
            </div>
        </div>
    );
}
