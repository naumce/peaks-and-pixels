'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, Camera, Mountain, Info, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Waypoint {
    lat: number;
    lng: number;
    type: string;
    title: string;
    description?: string;
    images?: string[];
}

interface TourRouteMapProps {
    routeData?: { coordinates: [number, number][] };
    waypoints: Waypoint[];
    meetingPoint?: { lat: number; lng: number };
}

export function TourRouteMap({ routeData, waypoints, meetingPoint }: TourRouteMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapRef = useRef<any>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const markersRef = useRef<any[]>([]);

    const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
    const [mapLoaded, setMapLoaded] = useState(false);

    // Calculate center from waypoints
    const centerLat = waypoints.length > 0
        ? waypoints.reduce((sum, w) => sum + w.lat, 0) / waypoints.length
        : 41.1783;
    const centerLng = waypoints.length > 0
        ? waypoints.reduce((sum, w) => sum + w.lng, 0) / waypoints.length
        : 20.6783;

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'photo': return '#a855f7';
            case 'viewpoint': return '#10b981';
            case 'rest': return '#3b82f6';
            case 'danger': return '#ef4444';
            default: return '#3b82f6';
        }
    };

    const getMarkerIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Camera className="w-4 h-4" />;
            case 'viewpoint': return <Mountain className="w-4 h-4" />;
            case 'rest': return <Info className="w-4 h-4" />;
            case 'danger': return <AlertTriangle className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    // Initialize map
    useEffect(() => {
        if (!mapContainerRef.current || !MAPBOX_TOKEN || mapRef.current) return;

        import('mapbox-gl').then((mapboxgl) => {
            mapboxgl.default.accessToken = MAPBOX_TOKEN;

            const map = new mapboxgl.default.Map({
                container: mapContainerRef.current!,
                style: mapStyle,
                center: [centerLng, centerLat],
                zoom: 12,
                pitch: 45,
                bearing: 0,
            });

            map.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

            map.on('load', () => {
                // Add terrain
                map.addSource('mapbox-dem', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
                    tileSize: 512,
                    maxzoom: 14,
                });
                map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });

                // Add route source
                const routeCoords = routeData?.coordinates || waypoints.map(w => [w.lng, w.lat]);
                map.addSource('route', {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        properties: {},
                        geometry: {
                            type: 'LineString',
                            coordinates: routeCoords,
                        },
                    },
                });

                // Route line glow
                map.addLayer({
                    id: 'route-glow',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 12,
                        'line-opacity': 0.3,
                        'line-blur': 8,
                    },
                });

                // Route line
                map.addLayer({
                    id: 'route-line',
                    type: 'line',
                    source: 'route',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#3b82f6',
                        'line-width': 4,
                        'line-opacity': 1,
                    },
                });

                setMapLoaded(true);
            });

            mapRef.current = map;
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [centerLat, centerLng, mapStyle, routeData, waypoints]);

    // Add markers
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        import('mapbox-gl').then((mapboxgl) => {
            // Clear existing markers
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];

            // Add waypoint markers
            waypoints.forEach((wp, i) => {
                const isSelected = selectedWaypoint === i;
                const el = document.createElement('div');
                el.className = 'waypoint-marker';
                el.innerHTML = `
                    <div class="relative cursor-pointer transition-all ${isSelected ? 'scale-125' : ''}">
                        <div class="w-10 h-10 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white ${isSelected ? 'w-14 h-14 ring-4 ring-white/50' : ''}" style="background: ${getMarkerColor(wp.type)}">
                            <span class="text-xs font-bold">${i + 1}</span>
                        </div>
                    </div>
                `;

                el.addEventListener('click', () => {
                    flyToWaypoint(i);
                });

                const marker = new mapboxgl.default.Marker({ element: el })
                    .setLngLat([wp.lng, wp.lat])
                    .addTo(mapRef.current);

                markersRef.current.push(marker);
            });

            // Add meeting point marker
            if (meetingPoint) {
                const el = document.createElement('div');
                el.innerHTML = `
                    <div class="flex flex-col items-center animate-bounce">
                        <div class="bg-red-500 text-white p-3 rounded-full shadow-2xl border-2 border-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div class="mt-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                            MEET HERE
                        </div>
                    </div>
                `;

                const marker = new mapboxgl.default.Marker({ element: el })
                    .setLngLat([meetingPoint.lng, meetingPoint.lat])
                    .addTo(mapRef.current);

                markersRef.current.push(marker);
            }
        });
    }, [waypoints, meetingPoint, selectedWaypoint, mapLoaded]);

    const flyToWaypoint = (index: number) => {
        const wp = waypoints[index];
        if (wp && mapRef.current) {
            mapRef.current.flyTo({
                center: [wp.lng, wp.lat],
                zoom: 15,
                pitch: 60,
                bearing: Math.random() * 90 - 45,
                duration: 2000,
            });
        }
        setSelectedWaypoint(index);
    };

    const nextWaypoint = () => {
        if (selectedWaypoint === null) {
            flyToWaypoint(0);
        } else if (selectedWaypoint < waypoints.length - 1) {
            flyToWaypoint(selectedWaypoint + 1);
        }
    };

    const prevWaypoint = () => {
        if (selectedWaypoint !== null && selectedWaypoint > 0) {
            flyToWaypoint(selectedWaypoint - 1);
        }
    };

    const switchStyle = (style: string) => {
        setMapStyle(style);
        if (mapRef.current) {
            mapRef.current.setStyle(style);
        }
    };

    const hasMapboxToken = !!MAPBOX_TOKEN;
    const selected = selectedWaypoint !== null ? waypoints[selectedWaypoint] : null;

    return (
        <div className="relative w-full h-full">
            {!hasMapboxToken ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                    <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Map Coming Soon</h3>
                        <p className="text-muted-foreground text-sm">Interactive route preview</p>
                    </div>
                </div>
            ) : (
                <div ref={mapContainerRef} className="w-full h-full" />
            )}

            {/* Style Switcher */}
            {hasMapboxToken && (
                <div className="absolute top-4 right-14 flex rounded-xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 z-10">
                    <button
                        onClick={() => switchStyle('mapbox://styles/mapbox/outdoors-v12')}
                        className={cn(
                            'px-3 py-1.5 text-xs font-medium transition-all',
                            mapStyle.includes('outdoors')
                                ? 'bg-white text-black'
                                : 'text-white/70 hover:text-white'
                        )}
                    >
                        Topo
                    </button>
                    <button
                        onClick={() => switchStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                        className={cn(
                            'px-3 py-1.5 text-xs font-medium transition-all',
                            mapStyle.includes('satellite')
                                ? 'bg-white text-black'
                                : 'text-white/70 hover:text-white'
                        )}
                    >
                        Satellite
                    </button>
                </div>
            )}

            {/* Navigation Controls */}
            {hasMapboxToken && waypoints.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={prevWaypoint}
                        disabled={selectedWaypoint === null || selectedWaypoint === 0}
                        className="rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-black/80 h-12 w-12"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Button>

                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 text-white text-sm font-medium">
                        {selectedWaypoint !== null ? (
                            <span>{selectedWaypoint + 1} / {waypoints.length}</span>
                        ) : (
                            <span>Click a waypoint</span>
                        )}
                    </div>

                    <Button
                        size="icon"
                        variant="secondary"
                        onClick={nextWaypoint}
                        disabled={selectedWaypoint === waypoints.length - 1}
                        className="rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-black/80 h-12 w-12"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                </div>
            )}

            {/* Waypoint Info Panel */}
            {hasMapboxToken && selected && (
                <div className="absolute top-4 left-4 md:w-80 glass rounded-2xl p-5 z-20 animate-in slide-in-from-left-4 duration-300 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="rounded-xl p-3 text-white shadow-lg"
                                style={{ background: getMarkerColor(selected.type) }}
                            >
                                {getMarkerIcon(selected.type)}
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground text-lg">{selected.title}</h3>
                                <p className="text-xs text-muted-foreground capitalize">
                                    Stop {(selectedWaypoint || 0) + 1} • {selected.type}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedWaypoint(null)}
                            className="p-2 rounded-full hover:bg-secondary transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {selected.description && (
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{selected.description}</p>
                    )}

                    {selected.images && selected.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {selected.images.slice(0, 4).map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`${selected.title} photo ${i + 1}`}
                                    className="w-full aspect-square object-cover rounded-xl shadow-lg"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Mapbox GL CSS */}
            <style jsx global>{`
                @import url('https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css');
                .mapboxgl-ctrl-logo { display: none !important; }
            `}</style>
        </div>
    );
}
