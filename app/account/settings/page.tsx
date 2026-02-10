'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Bell, Mail, Shield, Moon, Globe,
    Save, Loader2, Check, AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/providers/toast-provider';
import { createClient } from '@/lib/supabase/client';

interface UserSettings {
    email_notifications: boolean;
    push_notifications: boolean;
    marketing_emails: boolean;
    tour_reminders: boolean;
    club_updates: boolean;
    preferred_language: string;
    theme: 'light' | 'dark' | 'system';
}

export default function SettingsPage() {
    const router = useRouter();
    const toast = useToast();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [settings, setSettings] = useState<UserSettings>({
        email_notifications: true,
        push_notifications: true,
        marketing_emails: false,
        tour_reminders: true,
        club_updates: true,
        preferred_language: 'en',
        theme: 'dark',
    });

    useEffect(() => {
        fetchUserAndSettings();
    }, []);

    async function fetchUserAndSettings() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }
            setUser(user);

            // Fetch user settings from database if exists
            const { data: userSettings } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (userSettings) {
                setSettings({
                    email_notifications: userSettings.email_notifications ?? true,
                    push_notifications: userSettings.push_notifications ?? true,
                    marketing_emails: userSettings.marketing_emails ?? false,
                    tour_reminders: userSettings.tour_reminders ?? true,
                    club_updates: userSettings.club_updates ?? true,
                    preferred_language: userSettings.preferred_language ?? 'en',
                    theme: userSettings.theme ?? 'dark',
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!user) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    ...settings,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;

            toast.success('Settings saved', 'Your preferences have been updated.');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save', 'Please try again.');
        } finally {
            setSaving(false);
        }
    }

    async function handlePasswordReset() {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            toast.success('Email sent', 'Check your inbox for the password reset link.');
        } catch (error) {
            console.error('Password reset error:', error);
            toast.error('Failed to send email', 'Please try again.');
        }
    }

    function toggleSetting(key: keyof UserSettings) {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 fade-in">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Notifications */}
            <section className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Notifications</h2>
                        <p className="text-sm text-muted-foreground">Choose what you want to be notified about</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { key: 'email_notifications', label: 'Email notifications', desc: 'Get notified about bookings and updates' },
                        { key: 'push_notifications', label: 'Push notifications', desc: 'Receive push notifications on your device' },
                        { key: 'tour_reminders', label: 'Tour reminders', desc: 'Get reminded about upcoming tours' },
                        { key: 'club_updates', label: 'Club updates', desc: 'Receive updates from clubs you follow' },
                        { key: 'marketing_emails', label: 'Marketing emails', desc: 'Receive promotional offers and news' },
                    ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-muted/50 transition-colors">
                            <div>
                                <p className="font-medium">{item.label}</p>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => toggleSetting(item.key as keyof UserSettings)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings[item.key as keyof UserSettings] ? 'bg-primary' : 'bg-muted'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings[item.key as keyof UserSettings] ? 'translate-x-7' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Security */}
            <section className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Security</h2>
                        <p className="text-sm text-muted-foreground">Manage your account security</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Email address</p>
                                <p className="text-sm text-muted-foreground">{user?.email}</p>
                            </div>
                            <Badge variant="secondary">Verified</Badge>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">Last changed: Unknown</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handlePasswordReset}>
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Preferences */}
            <section className="bg-card rounded-2xl border border-border/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <Globe className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold">Preferences</h2>
                        <p className="text-sm text-muted-foreground">Customize your experience</p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Language</Label>
                        <select
                            value={settings.preferred_language}
                            onChange={(e) => setSettings(prev => ({ ...prev, preferred_language: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary"
                        >
                            <option value="en">English</option>
                            <option value="sl">Slovenščina</option>
                            <option value="hr">Hrvatski</option>
                            <option value="de">Deutsch</option>
                        </select>
                    </div>

                    <div>
                        <Label className="text-sm text-muted-foreground mb-2 block">Theme</Label>
                        <select
                            value={settings.theme}
                            onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as any }))}
                            className="w-full p-3 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary"
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="bg-card rounded-2xl border border-destructive/30 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
                        <p className="text-sm text-muted-foreground">Irreversible account actions</p>
                    </div>
                </div>

                <Button variant="destructive" className="w-full sm:w-auto">
                    Delete My Account
                </Button>
            </section>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
