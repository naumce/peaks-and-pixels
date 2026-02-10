'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, ScaleControl, MapRef } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Camera, Undo, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface RoutePoint {
    lat: number;
    lng: number;
    type?: string;
    title?: string;
    description?: string;
    elevation?: number;
    images?: string[];
}

interface RouteMapEditorProps {
    center?: [number, number];
    zoom?: number;
    onRouteChange: (data: { points: RoutePoint[]; distance: number }) => void;
    onMeetingPointChange?: (point: { lat: number; lng: number }) => void;
    existingRoute?: RoutePoint[];
    meetingPoint?: { lat: number; lng: number };
    mode: 'route' | 'meeting';
    selectedPointIndex?: number;
    onPointSelect?: (index: number) => void;
}

export function RouteMapEditor({
    center = [41.1783, 20.6783],
    zoom = 12,
    onRouteChange,
    onMeetingPointChange,
    existingRoute,
    meetingPoint,
    mode,
    selectedPointIndex = -1,
    onPointSelect,
}: RouteMapEditorProps) {
    const mapRef = useRef<MapRef>(null);
    const [viewState, setViewState] = useState({
        latitude: center[0],
        longitude: center[1],
        zoom: zoom,
        bearing: 0,
        pitch: 45,
    });

    const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');

    // Use ref to always have current route points (avoid stale closures)
    const routePointsRef = useRef<RoutePoint[]>([]);
    useEffect(() => {
        routePointsRef.current = routePoints;
    }, [routePoints]);

    // Load existing route
    useEffect(() => {
        if (existingRoute && Array.isArray(existingRoute) && existingRoute.length > 0) {
            setRoutePoints(existingRoute);
        }
    }, [existingRoute]);

    const calculateDistance = useCallback((points: RoutePoint[]) => {
        let distance = 0;
        for (let i = 1; i < points.length; i++) {
            const lat1 = points[i - 1].lat * Math.PI / 180;
            const lat2 = points[i].lat * Math.PI / 180;
            const dLat = (points[i].lat - points[i - 1].lat) * Math.PI / 180;
            const dLng = (points[i].lng - points[i - 1].lng) * Math.PI / 180;

            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distance += 6371 * c;
        }
        return distance;
    }, []);

    // Handle map click - add new point
    const handleMapClick = useCallback((event: mapboxgl.MapLayerMouseEvent) => {
        const { lng, lat } = event.lngLat;

        if (mode === 'meeting') {
            if (onMeetingPointChange) {
                onMeetingPointChange({ lat, lng });
            }
        } else {
            const currentPoints = routePointsRef.current;
            const newPoint: RoutePoint = { lat, lng, type: 'waypoint', images: [] };
            const newRoute = [...currentPoints, newPoint];
            setRoutePoints(newRoute);
            onRouteChange({
                points: newRoute,
                distance: calculateDistance(newRoute),
            });
            if (onPointSelect) onPointSelect(newRoute.length - 1);
        }
    }, [mode, onMeetingPointChange, onRouteChange, calculateDistance, onPointSelect]);

    // Handle marker click - select point
    const handleMarkerClick = useCallback((index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (onPointSelect) onPointSelect(index);
    }, [onPointSelect]);

    // Handle marker drag end - update point position
    const handleMarkerDragEnd = useCallback((index: number, lng: number, lat: number) => {
        const currentPoints = routePointsRef.current;
        const newRoute = [...currentPoints];
        newRoute[index] = { ...newRoute[index], lng, lat };
        setRoutePoints(newRoute);
        onRouteChange({
            points: newRoute,
            distance: calculateDistance(newRoute),
        });
    }, [onRouteChange, calculateDistance]);

    // Handle right click - remove point
    const handleMarkerRightClick = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        const currentPoints = routePointsRef.current;
        const newRoute = currentPoints.filter((_, i) => i !== index);
        setRoutePoints(newRoute);
        onRouteChange({
            points: newRoute,
            distance: calculateDistance(newRoute),
        });
        if (onPointSelect) onPointSelect(-1);
    }, [onRouteChange, calculateDistance, onPointSelect]);

    const undoLastPoint = useCallback(() => {
        const currentPoints = routePointsRef.current;
        const newRoute = currentPoints.slice(0, -1);
        setRoutePoints(newRoute);
        onRouteChange({
            points: newRoute,
            distance: calculateDistance(newRoute),
        });
    }, [onRouteChange, calculateDistance]);

    const clearRoute = useCallback(() => {
        setRoutePoints([]);
        onRouteChange({ points: [], distance: 0 });
        if (onPointSelect) onPointSelect(-1);
    }, [onRouteChange, onPointSelect]);

    const getMarkerColor = (type: string, isSelected: boolean) => {
        if (isSelected) return 'bg-yellow-400 border-black';
        switch (type) {
            case 'photo': return 'bg-purple-500 border-white';
            case 'viewpoint': return 'bg-green-500 border-white';
            case 'rest': return 'bg-blue-500 border-white';
            case 'danger': return 'bg-red-500 border-white';
            default: return 'bg-blue-500 border-white';
        }
    };

    // GeoJSON for the line
    const routeGeoJSON = {
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: routePoints.map(p => [p.lng, p.lat]),
        },
    };

    const hasMapboxToken = !!MAPBOX_TOKEN;

    if (!hasMapboxToken) {
        return (
            <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur">
                <div className="text-center p-8">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Mapbox Token Required</h3>
                    <p className="text-muted-foreground mb-4">
                        Add <code className="px-2 py-1 bg-secondary rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to your <code className="px-2 py-1 bg-secondary rounded">.env.local</code>
                    </p>
                    <a
                        href="https://account.mapbox.com/access-tokens/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        Get a free token →
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                mapboxAccessToken={MAPBOX_TOKEN}
                onClick={handleMapClick}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
            >
                <Source
                    id="mapbox-dem"
                    type="raster-dem"
                    url="mapbox://mapbox.mapbox-terrain-dem-v1"
                    tileSize={512}
                    maxzoom={14}
                />

                <NavigationControl position="top-right" />
                <ScaleControl position="bottom-left" />

                {/* Route Line */}
                {routePoints.length > 1 && (
                    <Source id="route-data" type="geojson" data={routeGeoJSON}>
                        {/* Route glow */}
                        <Layer
                            id="route-glow"
                            type="line"
                            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                            paint={{
                                'line-color': mapStyle.includes('satellite') ? '#fbbf24' : '#3b82f6',
                                'line-width': 12,
                                'line-opacity': 0.3,
                                'line-blur': 8,
                            }}
                        />
                        {/* Main route line */}
                        <Layer
                            id="route-line"
                            type="line"
                            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                            paint={{
                                'line-color': mapStyle.includes('satellite') ? '#fbbf24' : '#3b82f6',
                                'line-width': 4,
                                'line-opacity': 1,
                            }}
                        />
                    </Source>
                )}

                {/* Meeting Point Marker */}
                {meetingPoint && (
                    <Marker
                        longitude={meetingPoint.lng}
                        latitude={meetingPoint.lat}
                        anchor="bottom"
                        draggable={mode === 'meeting'}
                        onDragEnd={(evt) => {
                            if (onMeetingPointChange) {
                                onMeetingPointChange({
                                    lat: evt.lngLat.lat,
                                    lng: evt.lngLat.lng,
                                });
                            }
                        }}
                    >
                        <div className="flex flex-col items-center animate-bounce">
                            <div className="bg-red-500 text-white p-3 rounded-full shadow-2xl border-2 border-white">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="mt-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                MEETING POINT
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Route Point Markers */}
                {routePoints.map((p, i) => {
                    const isSelected = selectedPointIndex === i;
                    const hasPhotos = p.images && p.images.length > 0;

                    return (
                        <Marker
                            key={`pt-${i}-${p.lat}-${p.lng}`}
                            longitude={p.lng}
                            latitude={p.lat}
                            anchor="center"
                            draggable={true}
                            onDragEnd={(evt) => {
                                handleMarkerDragEnd(i, evt.lngLat.lng, evt.lngLat.lat);
                            }}
                        >
                            <div
                                className={cn(
                                    'rounded-full border-2 shadow-xl flex items-center justify-center text-white font-bold cursor-pointer transition-all',
                                    getMarkerColor(p.type || 'waypoint', isSelected),
                                    isSelected ? 'scale-125 ring-4 ring-yellow-400 w-11 h-11' : 'w-9 h-9',
                                    hasPhotos && !isSelected ? 'ring-4 ring-purple-400 ring-opacity-50' : ''
                                )}
                                onClick={(e) => handleMarkerClick(i, e)}
                                onContextMenu={(e) => handleMarkerRightClick(i, e)}
                                title={p.title || `Point ${i + 1} - Click to edit, Right-click to delete`}
                            >
                                <span className="text-xs font-bold">{i + 1}</span>
                            </div>
                        </Marker>
                    );
                })}
            </Map>

            {/* Style Switcher */}
            <div className="absolute top-4 right-14 flex rounded-xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 z-10">
                <button
                    onClick={() => setMapStyle('mapbox://styles/mapbox/outdoors-v12')}
                    className={cn(
                        'px-4 py-2 text-xs font-medium transition-all',
                        mapStyle.includes('outdoors')
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white'
                    )}
                >
                    Topo
                </button>
                <button
                    onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                    className={cn(
                        'px-4 py-2 text-xs font-medium transition-all',
                        mapStyle.includes('satellite')
                            ? 'bg-white text-black'
                            : 'text-white/70 hover:text-white'
                    )}
                >
                    Satellite
                </button>
            </div>

            {/* Floating Control Panel */}
            {mode === 'route' && (
                <div className="absolute top-4 left-4 flex gap-2 z-10">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={undoLastPoint}
                        disabled={routePoints.length === 0}
                        className="rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-black/80 shadow-2xl"
                    >
                        <Undo className="w-4 h-4 mr-1" />
                        Undo
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={clearRoute}
                        disabled={routePoints.length === 0}
                        className="rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-red-500/80 shadow-2xl"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Reset
                    </Button>
                </div>
            )}

            {/* Mode Indicator */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl text-sm z-10 border border-white/10 shadow-2xl">
                {mode === 'meeting' ? (
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-white font-medium">Click to set meeting point</span>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                            <span className="text-white font-medium">Route Drawing</span>
                        </div>
                        <p className="text-white/60 text-xs pl-6">
                            Click to add • Drag to move • Right-click to delete
                        </p>
                    </div>
                )}
            </div>

            {/* Stats Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xl px-5 py-3 rounded-2xl z-10 border border-white/10 shadow-2xl">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{routePoints.length}</p>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">Points</p>
                    </div>
                    <div className="w-px h-8 bg-white/20" />
                    <div className="text-center">
                        <p className="text-2xl font-bold text-white">{calculateDistance(routePoints).toFixed(1)}</p>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">KM</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
