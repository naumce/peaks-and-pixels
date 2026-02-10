'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Trash2, Calendar, Users, MessageSquare, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationSkeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    type: 'booking' | 'club' | 'event' | 'social' | 'system';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(id: string) {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    async function markAllAsRead() {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }

    async function deleteNotification(id: string) {
        try {
            await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar className="h-5 w-5 text-green-500" />;
            case 'club': return <Users className="h-5 w-5 text-blue-500" />;
            case 'event': return <Calendar className="h-5 w-5 text-purple-500" />;
            case 'social': return <Heart className="h-5 w-5 text-pink-500" />;
            default: return <Bell className="h-5 w-5 text-muted-foreground" />;
        }
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.is_read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Mock data if no notifications
    const displayNotifications = filteredNotifications.length > 0 ? filteredNotifications : [
        {
            id: '1',
            type: 'booking' as const,
            title: 'Booking Confirmed',
            message: 'Your booking for "Triglav Sunrise Expedition" has been confirmed.',
            link: '/account/bookings',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
            id: '2',
            type: 'club' as const,
            title: 'New Club Request',
            message: 'You have been invited to join "Ljubljana Hikers Club".',
            link: '/clubs/ljubljana-hikers',
            is_read: false,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
            id: '3',
            type: 'event' as const,
            title: 'Event Reminder',
            message: 'Don\'t forget: "Weekend at Lake Bled" starts tomorrow!',
            link: '/account/bookings',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
            id: '4',
            type: 'social' as const,
            title: 'New Follower',
            message: 'Ana Horvat started following you.',
            is_read: true,
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        },
    ];

    return (
        <div className="space-y-6 fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" size="sm" onClick={markAllAsRead}>
                            <Check className="h-4 w-4 mr-2" />
                            Mark All Read
                        </Button>
                    )}
                    <Link href="/account/settings">
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                >
                    Unread
                    {unreadCount > 0 && (
                        <Badge className="ml-2 bg-primary-foreground/20">{unreadCount}</Badge>
                    )}
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className={`slide-up stagger-${Math.min(i + 1, 6)}`}>
                            <NotificationSkeleton />
                        </div>
                    ))}
                </div>
            ) : displayNotifications.length === 0 ? (
                <EmptyState
                    icon="notifications"
                    title="No notifications"
                    description={filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}
                    action={filter === 'unread' ? { label: 'View All', onClick: () => setFilter('all') } : undefined}
                />
            ) : (
                <div className="space-y-2">
                    {displayNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-xl border transition-all ${notification.is_read
                                ? 'bg-card/50 border-border/30'
                                : 'bg-card border-primary/20 shadow-sm'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-medium ${notification.is_read ? 'text-muted-foreground' : 'text-foreground'}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.is_read && (
                                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteNotification(notification.id)}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            className="inline-block mt-3 text-sm text-primary hover:underline"
                                        >
                                            View details →
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
