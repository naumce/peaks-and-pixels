'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Search, Filter, Check, X, Clock, Users,
    ChevronDown, Eye, MoreHorizontal, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Club {
    id: string;
    slug: string;
    name: string;
    tagline: string;
    activity_types: string[];
    location: string;
    status: string;
    is_verified: boolean;
    member_count: number;
    created_at: string;
    owner: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
}

const statusConfig = {
    pending: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-500/50' },
    active: { label: 'Active', color: 'bg-green-500/10 text-green-600 border-green-500/50' },
    suspended: { label: 'Suspended', color: 'bg-red-500/10 text-red-600 border-red-500/50' },
    rejected: { label: 'Rejected', color: 'bg-gray-500/10 text-gray-600 border-gray-500/50' },
};

export default function AdminClubsPage() {
    const [clubs, setClubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchClubs();
    }, [filter, search]);

    async function fetchClubs() {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filter) params.append('status', filter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/clubs?${params}`);
            if (res.ok) {
                const data = await res.json();
                setClubs(data.clubs || []);
            }
        } catch (error) {
            console.error('Error fetching clubs:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAction(clubId: string, action: string, reason?: string) {
        setActionLoading(clubId);
        try {
            const res = await fetch('/api/admin/clubs', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ club_id: clubId, action, reason }),
            });

            if (res.ok) {
                fetchClubs(); // Refresh list
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

    const pendingCount = clubs.filter(c => c.status === 'pending').length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Clubs</h1>
                    <p className="text-muted-foreground">
                        Manage community clubs and approvals
                    </p>
                </div>
            </div>

            {/* Pending Alert */}
            {pendingCount > 0 && filter !== 'pending' && (
                <div className="mb-6 bg-amber-500/10 border border-amber-500/50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <p className="text-amber-600 font-medium">
                            {pendingCount} club{pendingCount !== 1 ? 's' : ''} pending approval
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setFilter('pending')}>
                        Review Now
                    </Button>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clubs..."
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
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                                }`}
                        >
                            {config.label}
                        </button>
                    ))}
                    <button
                        onClick={() => setFilter('')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === ''
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
            ) : clubs.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                    <div className="text-5xl mb-4">🏔️</div>
                    <h3 className="text-xl font-semibold mb-2">No clubs found</h3>
                    <p className="text-muted-foreground">
                        {filter === 'pending'
                            ? 'No clubs pending approval'
                            : 'No clubs match your filters'}
                    </p>
                </div>
            ) : (
                <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                                <th className="text-left p-4 font-medium text-muted-foreground">Club</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Owner</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Activity</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Members</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                                <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clubs.map((club) => (
                                <tr key={club.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-4">
                                        <div>
                                            <Link
                                                href={`/clubs/${club.slug}`}
                                                className="font-medium hover:text-primary transition-colors"
                                            >
                                                {club.name}
                                            </Link>
                                            {club.tagline && (
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {club.tagline}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div>
                                            <p className="font-medium">
                                                {club.owner.first_name} {club.owner.last_name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {club.owner.email}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {club.activity_types && club.activity_types.length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {club.activity_types.map((type) => (
                                                    <Badge key={type} variant="secondary" className="capitalize">
                                                        {type}
                                                    </Badge>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            {club.member_count}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Badge
                                            variant="outline"
                                            className={statusConfig[club.status as keyof typeof statusConfig]?.color}
                                        >
                                            {statusConfig[club.status as keyof typeof statusConfig]?.label || club.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(club.created_at), { addSuffix: true })}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {club.status === 'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleAction(club.id, 'approve')}
                                                        disabled={actionLoading === club.id}
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
                                                            handleAction(club.id, 'reject', reason || undefined);
                                                        }}
                                                        disabled={actionLoading === club.id}
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {club.status === 'active' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1 text-amber-600 hover:text-amber-700"
                                                    onClick={() => {
                                                        const reason = prompt('Suspension reason:');
                                                        if (reason) handleAction(club.id, 'suspend', reason);
                                                    }}
                                                    disabled={actionLoading === club.id}
                                                >
                                                    <AlertTriangle className="h-4 w-4" />
                                                    Suspend
                                                </Button>
                                            )}
                                            {club.status === 'suspended' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1 text-green-600 hover:text-green-700"
                                                    onClick={() => handleAction(club.id, 'activate')}
                                                    disabled={actionLoading === club.id}
                                                >
                                                    <Check className="h-4 w-4" />
                                                    Reactivate
                                                </Button>
                                            )}
                                            <Link href={`/clubs/${club.slug}`}>
                                                <Button size="sm" variant="ghost">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
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
