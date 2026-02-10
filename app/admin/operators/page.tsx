'use client';

import { useState, useEffect } from 'react';
import {
    Search, Check, X, Clock, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface OperatorApplication {
    id: string;
    business_name: string;
    experience_description: string;
    offerings_description: string;
    certifications: string[];
    languages: string[];
    status: string;
    rejection_reason: string | null;
    created_at: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string | null;
    };
}

const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/50' },
    approved: { label: 'Approved', color: 'bg-green-500/10 text-green-600 border-green-500/50' },
    rejected: { label: 'Rejected', color: 'bg-red-500/10 text-red-600 border-red-500/50' },
};

export default function AdminOperatorsPage() {
    const [applications, setApplications] = useState<OperatorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, [filter, search]);

    async function fetchApplications() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter) params.append('status', filter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/operator-applications?${params}`);
            if (res.ok) {
                const data = await res.json();
                setApplications(data.applications || []);
            }
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(applicationId: string, action: string, reason?: string) {
        setActionLoading(applicationId);
        try {
            const res = await fetch('/api/admin/operator-applications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: applicationId, action, reason }),
            });

            if (res.ok) {
                fetchApplications();
            } else {
                const error = await res.json();
                alert(error.error || 'Action failed');
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setActionLoading(null);
        }
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Tour Operator Applications</h1>
                    <p className="text-muted-foreground">
                        Review and manage tour operator applications
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by business name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="flex gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            }`}
                        >
                            {config.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            filter === ''
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        }`}
                    >
                        All
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No applications found</h3>
                    <p className="text-muted-foreground">
                        {filter === 'pending'
                            ? 'No applications pending review'
                            : 'No applications match your filters'}
                    </p>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left p-4 font-medium text-muted-foreground">Applicant</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Business Name</th>
                                <th className="text-left p-4 font-medium text-muted-foreground hidden lg:table-cell">Experience</th>
                                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Languages</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Applied</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app) => (
                                <tr key={app.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">
                                                {app.user?.first_name} {app.user?.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {app.user?.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium">{app.business_name}</p>
                                    </td>
                                    <td className="p-4 hidden lg:table-cell">
                                        <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                                            {app.experience_description}
                                        </p>
                                    </td>
                                    <td className="p-4 hidden md:table-cell">
                                        {app.languages.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {app.languages.slice(0, 3).map((lang) => (
                                                    <Badge key={lang} variant="secondary" className="capitalize text-xs">
                                                        {lang}
                                                    </Badge>
                                                ))}
                                                {app.languages.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{app.languages.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={statusConfig[app.status]?.color}
                                        >
                                            {statusConfig[app.status]?.label || app.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                                        {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {app.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleAction(app.id, 'approve')}
                                                        disabled={actionLoading === app.id}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            const reason = prompt('Rejection reason (optional):');
                                                            handleAction(app.id, 'reject', reason || undefined);
                                                        }}
                                                        disabled={actionLoading === app.id}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {app.status === 'rejected' && app.rejection_reason && (
                                                <span className="text-xs text-muted-foreground max-w-[150px] truncate" title={app.rejection_reason}>
                                                    {app.rejection_reason}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
