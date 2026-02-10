'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, MapPin, Mountain, Route, Camera } from 'lucide-react';

// Dynamic import for map
const RoutePreviewMap = dynamic(
    () => import('./route-preview-map').then(mod => ({ default: mod.RoutePreviewMap })),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        ),
    }
);

interface RouteData {
    route_data?: { coordinates: [number, number][] };
    distance_km?: number;
    waypoints?: Array<{
        lat: number;
        lng: number;
        type: string;
        title: string;
        description?: string;
        images?: string[];
    }>;
    meeting_point_lat?: number;
    meeting_point_lng?: number;
}

interface TourRouteSectionProps {
    tourId: string;
    tourSlug: string;
}

export function TourRouteSection({ tourId, tourSlug }: TourRouteSectionProps) {
    const [route, setRoute] = useState<RouteData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRoute();
    }, [tourId, tourSlug]);

    const loadRoute = async () => {
        try {
            const res = await fetch(`/api/tours/${tourSlug}/route`);
            if (res.ok) {
                const data = await res.json();
                setRoute(data);
            }
        } catch (error) {
            console.error('Error loading route:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center rounded-2xl bg-secondary/30">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!route || !route.waypoints || route.waypoints.length === 0) {
        return null; // No route data
    }

    const hasPhotos = route.waypoints.some((w) => w.images && w.images.length > 0);

    return (
        <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
                    <Mountain className="w-5 h-5" />
                    <span className="font-semibold">Interactive Route Map</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                    Explore {route.waypoints.length} Waypoints
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Click on waypoints to discover each stop along the journey
                </p>
            </div>

            {/* Route Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                    <Route className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{route.distance_km?.toFixed(1) || 0}km</p>
                    <p className="text-xs text-muted-foreground">Distance</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                    <MapPin className="h-5 w-5 text-primary mx-auto mb-2" />
                    <p className="text-2xl font-bold text-foreground">{route.waypoints.length}</p>
                    <p className="text-xs text-muted-foreground">Waypoints</p>
                </div>
                {hasPhotos && (
                    <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <Camera className="h-5 w-5 text-primary mx-auto mb-2" />
                        <p className="text-2xl font-bold text-foreground">
                            {route.waypoints.filter(w => w.images && w.images.length > 0).length}
                        </p>
                        <p className="text-xs text-muted-foreground">Photo Spots</p>
                    </div>
                )}
                {route.meeting_point_lat && (
                    <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <MapPin className="h-5 w-5 text-red-500 mx-auto mb-2" />
                        <p className="text-xl font-bold text-foreground">Set</p>
                        <p className="text-xs text-muted-foreground">Meeting Point</p>
                    </div>
                )}
            </div>

            {/* Interactive Map */}
            <div className="h-[500px] lg:h-[600px] rounded-2xl overflow-hidden border border-border/50">
                <RoutePreviewMap
                    route={route.route_data}
                    waypoints={route.waypoints}
                    meetingPoint={
                        route.meeting_point_lat && route.meeting_point_lng
                            ? { lat: route.meeting_point_lat, lng: route.meeting_point_lng }
                            : undefined
                    }
                    startPoint={route.waypoints[0] ? { lat: route.waypoints[0].lat, lng: route.waypoints[0].lng } : undefined}
                />
            </div>
        </div>
    );
}
