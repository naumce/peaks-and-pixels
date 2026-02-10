'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, UserPlus, Copy, Check, MoreHorizontal,
    Shield, ShieldAlert, UserMinus, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface Member {
    id: string;
    role: 'owner' | 'admin' | 'member';
    status: 'pending' | 'active' | 'banned';
    joined_at: string;
    user: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        avatar_url: string;
    };
}

export default function ManageMembersPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const inviteLink = typeof window !== 'undefined'
        ? `${window.location.origin}/clubs/${slug}?join=true`
        : '';

    useEffect(() => {
        fetchMembers();
    }, [slug]);

    async function fetchMembers() {
        try {
            const res = await fetch(`/api/clubs/${slug}/members`);
            if (res.ok) {
                const data = await res.json();
                const allMembers = data.members || [];
                setMembers(allMembers.filter((m: Member) => m.status === 'active'));
                setPendingMembers(allMembers.filter((m: Member) => m.status === 'pending'));
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    function copyInviteLink() {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    async function handleMemberAction(memberId: string, action: 'promote' | 'demote' | 'remove' | 'approve' | 'reject') {
        // TODO: Implement member management API
        console.log('Action:', action, 'Member:', memberId);
        fetchMembers();
    }

    const roleIcon = {
        owner: <Crown className="h-4 w-4 text-amber-500" />,
        admin: <Shield className="h-4 w-4 text-blue-500" />,
        member: null,
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href={`/clubs/${slug}/manage`}
                            className="p-2 hover:bg-muted rounded-lg transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Members</h1>
                            <p className="text-sm text-muted-foreground">
                                {members.length} active members
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Invite Link */}
                <div className="bg-card rounded-xl p-6 border border-border/50 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <UserPlus className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold mb-1">Invite Link</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Share this link to invite people to join your club
                            </p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inviteLink}
                                    readOnly
                                    className="flex-1 bg-muted px-4 py-2 rounded-lg text-sm border border-border"
                                />
                                <Button onClick={copyInviteLink} variant="outline" className="gap-2">
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4" />
                                            Copy
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Requests */}
                {pendingMembers.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                            Pending Requests ({pendingMembers.length})
                        </h2>
                        <div className="bg-card rounded-xl border border-amber-500/30 overflow-hidden">
                            {pendingMembers.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-4 p-4 border-b border-border last:border-0"
                                >
                                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                        {member.user.avatar_url ? (
                                            <Image
                                                src={member.user.avatar_url}
                                                alt=""
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-medium">
                                                {member.user.first_name[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">
                                            {member.user.first_name} {member.user.last_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {member.user.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => handleMemberAction(member.id, 'approve')}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleMemberAction(member.id, 'reject')}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Active Members */}
                <div>
                    <h2 className="text-lg font-semibold mb-4">Active Members</h2>
                    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {member.user.avatar_url ? (
                                        <Image
                                            src={member.user.avatar_url}
                                            alt=""
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-lg font-medium">
                                            {member.user.first_name[0]}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium truncate">
                                            {member.user.first_name} {member.user.last_name}
                                        </p>
                                        {roleIcon[member.role]}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Joined {formatDistanceToNow(new Date(member.joined_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="capitalize">
                                    {member.role}
                                </Badge>
                                {member.role !== 'owner' && (
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
