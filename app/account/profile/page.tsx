'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User, Mail, Phone, Globe } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    preferred_language: string;
    marketing_consent: boolean;
    sms_consent: boolean;
}

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [profile, setProfile] = useState<Profile | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        preferred_language: 'en',
        marketing_consent: false,
        sms_consent: false,
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/auth/login');
            return;
        }

        const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (data) {
            setProfile(data);
            setFormData({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                phone: data.phone || '',
                preferred_language: data.preferred_language || 'en',
                marketing_consent: data.marketing_consent || false,
                sms_consent: data.sms_consent || false,
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const { error } = await supabase
            .from('users')
            .update({
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone || null,
                preferred_language: formData.preferred_language,
                marketing_consent: formData.marketing_consent,
                sms_consent: formData.sms_consent,
            })
            .eq('id', user.id);

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            router.refresh();
        }

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in max-w-2xl">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl ${message.type === 'error'
                        ? 'bg-red-400/10 text-red-400 border border-red-400/20'
                        : 'bg-green-400/10 text-green-400 border border-green-400/20'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Personal Information */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            className="h-12 rounded-xl"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                    </Label>
                    <Input
                        value={profile?.email || ''}
                        disabled
                        className="h-12 rounded-xl bg-secondary/30"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone Number
                    </Label>
                    <Input
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+389 70 123 456"
                        className="h-12 rounded-xl"
                    />
                </div>

                <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Preferred Language
                    </Label>
                    <select
                        value={formData.preferred_language}
                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                        className="w-full h-12 px-4 rounded-xl bg-secondary/50 border border-border/50 text-foreground"
                    >
                        <option value="en">English</option>
                        <option value="mk">Macedonian</option>
                        <option value="de">German</option>
                    </select>
                </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Communication Preferences</h2>

                <label className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-all">
                    <input
                        type="checkbox"
                        checked={formData.marketing_consent}
                        onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-border accent-primary"
                    />
                    <div>
                        <p className="font-medium text-foreground">Email Updates</p>
                        <p className="text-sm text-muted-foreground">Receive news about new tours and special offers</p>
                    </div>
                </label>

                <label className="flex items-start gap-4 p-4 rounded-xl bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-all">
                    <input
                        type="checkbox"
                        checked={formData.sms_consent}
                        onChange={(e) => setFormData({ ...formData, sms_consent: e.target.checked })}
                        className="w-5 h-5 mt-0.5 rounded border-border accent-primary"
                    />
                    <div>
                        <p className="font-medium text-foreground">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Get important updates about your bookings via SMS</p>
                    </div>
                </label>
            </div>

            {/* Save Button */}
            <Button
                onClick={handleSave}
                disabled={saving}
                className="gradient-primary text-white rounded-xl glow-hover"
            >
                {saving ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </>
                )}
            </Button>
        </div>
    );
}
