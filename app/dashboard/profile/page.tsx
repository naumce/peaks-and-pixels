'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Loader2, Save, User, Languages, Award, CheckCircle, X
} from 'lucide-react';

interface OperatorProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    languages: string[] | null;
    certifications: string[] | null;
    is_available: boolean;
}

export default function DashboardProfilePage() {
    const [profile, setProfile] = useState<OperatorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Editable fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [specialtiesInput, setSpecialtiesInput] = useState('');
    const [languagesInput, setLanguagesInput] = useState('');
    const [certificationsInput, setCertificationsInput] = useState('');

    useEffect(() => {
        fetch('/api/operator/profile')
            .then(res => res.json())
            .then((data: OperatorProfile) => {
                setProfile(data);
                setFirstName(data.first_name || '');
                setLastName(data.last_name || '');
                setPhone(data.phone || '');
                setBio(data.bio || '');
                setIsAvailable(data.is_available ?? true);
                setSpecialtiesInput((data.specialties || []).join(', '));
                setLanguagesInput((data.languages || []).join(', '));
                setCertificationsInput((data.certifications || []).join(', '));
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const parseList = (input: string) =>
                input.split(',').map(s => s.trim()).filter(Boolean);

            const res = await fetch('/api/operator/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone || null,
                    bio: bio || null,
                    is_available: isAvailable,
                    specialties: parseList(specialtiesInput),
                    languages: parseList(languagesInput),
                    certifications: parseList(certificationsInput),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Operator Profile</h1>
                    <p className="text-muted-foreground">Manage your guide profile visible to customers</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="gradient-primary text-white rounded-xl glow-hover"
                >
                    {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : saved ? (
                        <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                        <Save className="h-4 w-4 mr-2" />
                    )}
                    {saved ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>

            {/* Availability Toggle */}
            <div className="rounded-2xl border border-border/50 bg-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Availability</h3>
                        <p className="text-sm text-muted-foreground">
                            Toggle your availability for new tour bookings
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge className={isAvailable
                            ? 'bg-green-400/10 text-green-400 border-green-400/20 border'
                            : 'bg-muted text-muted-foreground border-border border'
                        }>
                            {isAvailable ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Switch
                            checked={isAvailable}
                            onCheckedChange={setIsAvailable}
                        />
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <User className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        value={profile?.email || ''}
                        disabled
                        className="rounded-xl bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                </div>

                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+389 XX XXX XXX"
                        className="rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell customers about yourself, your experience, and what makes your tours special..."
                        rows={4}
                        className="rounded-xl resize-none"
                    />
                </div>
            </div>

            {/* Specialties & Skills */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Specialties & Skills</h3>
                </div>

                <div className="space-y-2">
                    <Label>Specialties</Label>
                    <Input
                        value={specialtiesInput}
                        onChange={(e) => setSpecialtiesInput(e.target.value)}
                        placeholder="e.g. Mountain hiking, Photography tours, Cultural walks"
                        className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Comma-separated list of your specialties</p>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Languages
                    </Label>
                    <Input
                        value={languagesInput}
                        onChange={(e) => setLanguagesInput(e.target.value)}
                        placeholder="e.g. English, Macedonian, Albanian"
                        className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Languages you can guide tours in</p>
                </div>

                <div className="space-y-2">
                    <Label>Certifications</Label>
                    <Input
                        value={certificationsInput}
                        onChange={(e) => setCertificationsInput(e.target.value)}
                        placeholder="e.g. First Aid, Mountain Guide License, Wilderness Safety"
                        className="rounded-xl"
                    />
                    <p className="text-xs text-muted-foreground">Professional certifications and licenses</p>
                </div>
            </div>
        </div>
    );
}
