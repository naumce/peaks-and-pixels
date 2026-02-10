'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Briefcase, Award, Globe, Loader2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const certificationOptions = [
    { value: 'mountain_guide', label: 'Mountain Guide' },
    { value: 'first_aid', label: 'First Aid' },
    { value: 'photography', label: 'Photography Pro' },
    { value: 'wilderness_survival', label: 'Wilderness Survival' },
    { value: 'scuba', label: 'Scuba Certified' },
    { value: 'kayak_instructor', label: 'Kayak Instructor' },
    { value: 'ski_instructor', label: 'Ski Instructor' },
    { value: 'other', label: 'Other' },
];

const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'macedonian', label: 'Macedonian' },
    { value: 'albanian', label: 'Albanian' },
    { value: 'serbian', label: 'Serbian' },
    { value: 'german', label: 'German' },
    { value: 'french', label: 'French' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'italian', label: 'Italian' },
];

interface Application {
    id: string;
    status: string;
    rejection_reason: string | null;
    created_at: string;
}

export default function BecomeOperatorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [pendingApp, setPendingApp] = useState<Application | null>(null);
    const [lastRejection, setLastRejection] = useState<Application | null>(null);

    const [formData, setFormData] = useState({
        business_name: '',
        experience_description: '',
        offerings_description: '',
        certifications: [] as string[],
        languages: [] as string[],
    });

    useEffect(() => {
        async function checkExisting() {
            try {
                // Check if user is already an operator (guide) — redirect to dashboard
                const profileRes = await fetch('/api/operator/profile');
                if (profileRes.ok) {
                    router.replace('/dashboard');
                    return;
                }

                const res = await fetch('/api/operator-applications');
                if (res.ok) {
                    const data = await res.json();
                    const apps = data.applications || [];
                    const pending = apps.find((a: Application) => a.status === 'pending');
                    const rejected = apps.find((a: Application) => a.status === 'rejected');
                    if (pending) setPendingApp(pending);
                    else if (rejected) setLastRejection(rejected);
                }
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        }
        checkExisting();
    }, [router]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/operator-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to submit application');
                return;
            }

            setSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Success state after submission
    if (submitted) {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                    We'll review your application and notify you when a decision is made.
                    This usually takes 1-3 business days.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/account">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    // Pending application state
    if (pendingApp) {
        return (
            <div className="max-w-lg mx-auto text-center py-16">
                <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Application Under Review</h2>
                <p className="text-muted-foreground mb-6">
                    Your tour operator application is being reviewed by our team.
                    We'll notify you once a decision is made.
                </p>
                <Button variant="outline" asChild>
                    <Link href="/account">Back to Dashboard</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/account"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mb-2">Become a Tour Operator</h1>
                <p className="text-muted-foreground">
                    Apply to create and sell tours on Peaks & Pixels. Share your expertise with adventurers.
                </p>
            </div>

            {/* Rejection notice */}
            {lastRejection && (
                <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <p className="font-medium text-red-600 dark:text-red-400">Previous application was not approved</p>
                            {lastRejection.rejection_reason && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    Reason: {lastRejection.rejection_reason}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-1">
                                You can submit a new application below.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Business Info */}
                <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Business Information
                    </h2>

                    <div className="space-y-2">
                        <Label htmlFor="business_name">Business / Operator Name *</Label>
                        <Input
                            id="business_name"
                            value={formData.business_name}
                            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                            placeholder="e.g., Balkan Adventures, Mountain Spirit Tours"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="experience">Your Experience *</Label>
                        <Textarea
                            id="experience"
                            value={formData.experience_description}
                            onChange={(e) => setFormData({ ...formData, experience_description: e.target.value })}
                            placeholder="Tell us about your experience leading tours or outdoor activities. How long have you been doing this? What kind of groups have you worked with?"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="offerings">What You Plan to Offer *</Label>
                        <Textarea
                            id="offerings"
                            value={formData.offerings_description}
                            onChange={(e) => setFormData({ ...formData, offerings_description: e.target.value })}
                            placeholder="Describe the types of tours or experiences you want to create. What locations? What activities? What makes your tours unique?"
                            rows={4}
                            required
                        />
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            Certifications
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Select all that apply</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {certificationOptions.map((cert) => {
                            const isSelected = formData.certifications.includes(cert.value);
                            return (
                                <button
                                    key={cert.value}
                                    type="button"
                                    onClick={() => {
                                        const certs = isSelected
                                            ? formData.certifications.filter(c => c !== cert.value)
                                            : [...formData.certifications, cert.value];
                                        setFormData({ ...formData, certifications: certs });
                                    }}
                                    className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    {cert.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Languages */}
                <div className="bg-card rounded-xl p-6 border border-border/50 space-y-6">
                    <div>
                        <h2 className="font-semibold text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary" />
                            Languages
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">Which languages can you lead tours in?</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {languageOptions.map((lang) => {
                            const isSelected = formData.languages.includes(lang.value);
                            return (
                                <button
                                    key={lang.value}
                                    type="button"
                                    onClick={() => {
                                        const langs = isSelected
                                            ? formData.languages.filter(l => l !== lang.value)
                                            : [...formData.languages, lang.value];
                                        setFormData({ ...formData, languages: langs });
                                    }}
                                    className={`p-3 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                                        isSelected
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-border hover:border-primary/50'
                                    }`}
                                >
                                    {lang.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Notice */}
                <div className="bg-amber-500/10 border border-amber-500/50 rounded-xl p-4 text-sm">
                    <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                        Review Process
                    </p>
                    <p className="text-muted-foreground">
                        Your application will be reviewed by our team. This usually takes 1-3 business days.
                        Once approved, you'll be able to create and manage tours from your dashboard.
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
                        disabled={submitting || !formData.business_name || !formData.experience_description || !formData.offerings_description}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Application'
                        )}
                    </Button>
                    <Link href="/account">
                        <Button type="button" variant="outline" size="lg">
                            Cancel
                        </Button>
                    </Link>
                </div>
            </form>
        </div>
    );
}
