'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    ArrowLeft, Plus, Calendar, Clock, Users, Trash2,
    Loader2, Check, X
} from 'lucide-react';

interface TourInstance {
    id: string;
    start_datetime: string;
    end_datetime: string;
    capacity_max: number;
    capacity_booked: number;
    price_override: number | null;
    status: 'scheduled' | 'full' | 'cancelled' | 'completed';
}

interface Tour {
    id: string;
    name: string;
    base_price: number;
    max_participants: number;
    duration_minutes: number;
}

interface SchedulePageProps {
    apiBase: string;
    backLink: string;
}

export function SchedulePage({ apiBase, backLink }: SchedulePageProps) {
    const params = useParams();
    const tourId = params.id as string;

    const [tour, setTour] = useState<Tour | null>(null);
    const [instances, setInstances] = useState<TourInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [newInstance, setNewInstance] = useState({
        date: '', time: '09:00', duration_hours: 8, capacity: 12, price_override: '',
    });

    useEffect(() => { loadData(); }, [tourId]);

    const loadData = async () => {
        try {
            const tourRes = await fetch(`${apiBase}/${tourId}`);
            if (tourRes.ok) {
                const tourData = await tourRes.json();
                setTour(tourData);
                setNewInstance(prev => ({
                    ...prev,
                    capacity: tourData.max_participants || 12,
                    duration_hours: Math.round((tourData.duration_minutes || 480) / 60),
                }));
            }
            const instancesRes = await fetch(`${apiBase}/${tourId}/instances`);
            if (instancesRes.ok) {
                setInstances(await instancesRes.json());
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddInstance = async () => {
        if (!newInstance.date || !newInstance.time) return;
        setSaving(true);
        try {
            const startDateTime = new Date(`${newInstance.date}T${newInstance.time}`);
            const endDateTime = new Date(startDateTime.getTime() + newInstance.duration_hours * 60 * 60 * 1000);

            const res = await fetch(`${apiBase}/${tourId}/instances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start_datetime: startDateTime.toISOString(),
                    end_datetime: endDateTime.toISOString(),
                    capacity_max: newInstance.capacity,
                    price_override: newInstance.price_override ? parseFloat(newInstance.price_override) : null,
                }),
            });

            if (res.ok) {
                await loadData();
                setShowForm(false);
                setNewInstance({
                    date: '', time: '09:00',
                    duration_hours: tour?.duration_minutes ? Math.round(tour.duration_minutes / 60) : 8,
                    capacity: tour?.max_participants || 12, price_override: '',
                });
            }
        } catch (error) {
            console.error('Error creating instance:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteInstance = async (instanceId: string) => {
        if (!confirm('Are you sure you want to delete this scheduled date?')) return;
        try {
            await fetch(`${apiBase}/${tourId}/instances/${instanceId}`, { method: 'DELETE' });
            await loadData();
        } catch (error) {
            console.error('Error deleting instance:', error);
        }
    };

    const handleUpdateStatus = async (instanceId: string, status: string) => {
        try {
            await fetch(`${apiBase}/${tourId}/instances/${instanceId}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }),
            });
            await loadData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-green-400/10 text-green-400 border-green-400/20';
            case 'full': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'cancelled': return 'bg-red-400/10 text-red-400 border-red-400/20';
            case 'completed': return 'bg-muted text-muted-foreground border-border';
            default: return 'bg-muted text-muted-foreground border-border';
        }
    };

    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const formatTime = (dateStr: string) => new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-8 fade-in">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="rounded-full" asChild><Link href={backLink}><ArrowLeft className="h-5 w-5" /></Link></Button>
                <div className="flex-1"><h1 className="text-2xl font-bold text-foreground">Schedule Tour Dates</h1><p className="text-muted-foreground">{tour?.name || 'Loading...'}</p></div>
                <Button className="gradient-primary text-white rounded-xl glow-hover" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Add Date</Button>
            </div>

            {showForm && (
                <div className="rounded-2xl border border-primary/30 bg-card p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-semibold text-foreground">Add New Tour Date</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2"><Label>Date *</Label><Input type="date" value={newInstance.date} onChange={(e) => setNewInstance({ ...newInstance, date: e.target.value })} min={new Date().toISOString().split('T')[0]} className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={newInstance.time} onChange={(e) => setNewInstance({ ...newInstance, time: e.target.value })} className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>Duration (hours)</Label><Input type="number" min="1" value={newInstance.duration_hours} onChange={(e) => setNewInstance({ ...newInstance, duration_hours: parseInt(e.target.value) || 1 })} className="rounded-xl" /></div>
                        <div className="space-y-2"><Label>Max Participants</Label><Input type="number" min="1" value={newInstance.capacity} onChange={(e) => setNewInstance({ ...newInstance, capacity: parseInt(e.target.value) || 1 })} className="rounded-xl" /></div>
                    </div>
                    <div className="space-y-2">
                        <Label>Price Override (optional)</Label>
                        <div className="flex items-center gap-2"><span className="text-muted-foreground">€</span><Input type="number" placeholder={`Leave empty to use base price (€${tour?.base_price || 0})`} value={newInstance.price_override} onChange={(e) => setNewInstance({ ...newInstance, price_override: e.target.value })} className="rounded-xl max-w-xs" /></div>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={handleAddInstance} disabled={saving || !newInstance.date} className="gradient-primary text-white rounded-xl">
                            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}Add Tour Date
                        </Button>
                        <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">Cancel</Button>
                    </div>
                </div>
            )}

            {instances.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border border-dashed border-border">
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4"><Calendar className="h-8 w-8 text-muted-foreground" /></div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No dates scheduled</h3>
                    <p className="text-muted-foreground mb-6">Add tour dates so guests can book.</p>
                    <Button className="gradient-primary text-white rounded-xl" onClick={() => setShowForm(true)}><Plus className="h-4 w-4 mr-2" />Schedule First Date</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Scheduled Dates ({instances.length})</h2>
                    <div className="grid gap-4">
                        {instances.map((instance) => (
                            <div key={instance.id} className="rounded-xl border border-border/50 bg-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Calendar className="h-6 w-6 text-primary" /></div>
                                        <div><p className="font-semibold text-foreground">{formatDate(instance.start_datetime)}</p><p className="text-sm text-muted-foreground"><Clock className="inline h-3 w-3 mr-1" />{formatTime(instance.start_datetime)} - {formatTime(instance.end_datetime)}</p></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="text-sm"><span className="font-semibold text-foreground">{instance.capacity_booked}</span><span className="text-muted-foreground">/{instance.capacity_max}</span></span></div>
                                <div className="text-sm"><span className="font-semibold text-foreground">€{instance.price_override || tour?.base_price || 0}</span>{instance.price_override && <span className="text-xs text-muted-foreground ml-1">(custom)</span>}</div>
                                <Badge className={`${getStatusColor(instance.status)} border capitalize`}>{instance.status}</Badge>
                                <div className="flex gap-2">
                                    {instance.status === 'scheduled' && <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:text-red-600" onClick={() => handleUpdateStatus(instance.id, 'cancelled')}><X className="h-4 w-4" /></Button>}
                                    {instance.status === 'cancelled' && <Button variant="outline" size="sm" className="rounded-lg text-green-500 hover:text-green-600" onClick={() => handleUpdateStatus(instance.id, 'scheduled')}><Check className="h-4 w-4" /></Button>}
                                    <Button variant="outline" size="sm" className="rounded-lg text-muted-foreground hover:text-red-500" onClick={() => handleDeleteInstance(instance.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
