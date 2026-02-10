'use client';

import { useRef, useState, useEffect } from 'react';
import Map, { Source, Layer, Marker, NavigationControl, ScaleControl, MapRef, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Flag, Camera, Mountain, Info, AlertTriangle, Play, Pause, X, ChevronLeft, ChevronRight, Maximize2, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

interface Waypoint {
    lat: number;
    lng: number;
    type: string;
    title: string;
    description?: string;
    elevation?: number;
    images?: string[];
}

interface RoutePreviewMapProps {
    route: any;
    waypoints: Waypoint[];
    startPoint?: { lat: number; lng: number };
    meetingPoint?: { lat: number; lng: number };
    onWaypointClick?: (index: number) => void;
}

export function RoutePreviewMap({
    route,
    waypoints,
    startPoint,
    meetingPoint,
    onWaypointClick
}: RoutePreviewMapProps) {
    const mapRef = useRef<MapRef>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [viewState, setViewState] = useState(() => {
        if (waypoints.length > 0) {
            const avgLat = waypoints.reduce((sum, w) => sum + w.lat, 0) / waypoints.length;
            const avgLng = waypoints.reduce((sum, w) => sum + w.lng, 0) / waypoints.length;
            return { latitude: avgLat, longitude: avgLng, zoom: 12, bearing: 0, pitch: 0 };
        }
        return { latitude: 41.1783, longitude: 20.6783, zoom: 11, bearing: 0, pitch: 0 };
    });

    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/outdoors-v12');
    const [selectedWaypoint, setSelectedWaypoint] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [traveledProgress, setTraveledProgress] = useState(0);

    // Auto-play through waypoints
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(async () => {
            const current = selectedWaypoint;
            if (current === null || current >= waypoints.length - 1) {
                setIsAutoPlaying(false);
                return;
            }

            setIsTransitioning(true);
            setSelectedWaypoint(null);
            await new Promise(resolve => setTimeout(resolve, 200));

            const next = current + 1;
            setTraveledProgress(next / Math.max(waypoints.length - 1, 1));
            flyToWaypoint(next);
            await new Promise(resolve => setTimeout(resolve, 1600));

            setSelectedWaypoint(next);
            setCurrentImageIndex(0);
            setIsTransitioning(false);
        }, 6000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, selectedWaypoint, waypoints.length]);

    const flyToWaypoint = (index: number) => {
        if (mapRef.current && waypoints[index]) {
            const wp = waypoints[index];
            const hasImages = wp.images && wp.images.length > 0;
            const estimatedPopupHeight = hasImages ? 400 : 350;

            mapRef.current.flyTo({
                center: [wp.lng, wp.lat],
                zoom: 15,
                duration: 1500,
                essential: true,
                padding: { top: estimatedPopupHeight + 50, bottom: 50, left: 50, right: 50 }
            });
        }
    };

    const handleWaypointClick = async (index: number) => {
        setIsAutoPlaying(false);
        setSelectedWaypoint(null);
        flyToWaypoint(index);
        await new Promise(resolve => setTimeout(resolve, 1600));
        setSelectedWaypoint(index);
        setCurrentImageIndex(0);
        setTraveledProgress(index / Math.max(waypoints.length - 1, 1));
        onWaypointClick?.(index);
    };

    const closePopup = () => {
        setSelectedWaypoint(null);
        setCurrentImageIndex(0);
        setIsAutoPlaying(false);
    };

    const nextWaypoint = async () => {
        if (selectedWaypoint === null || selectedWaypoint >= waypoints.length - 1) return;
        setIsTransitioning(true);
        setSelectedWaypoint(null);
        await new Promise(resolve => setTimeout(resolve, 200));
        const next = selectedWaypoint + 1;
        setTraveledProgress(next / Math.max(waypoints.length - 1, 1));
        flyToWaypoint(next);
        await new Promise(resolve => setTimeout(resolve, 1600));
        setSelectedWaypoint(next);
        setCurrentImageIndex(0);
        setIsTransitioning(false);
        onWaypointClick?.(next);
    };

    const prevWaypoint = async () => {
        if (selectedWaypoint === null || selectedWaypoint <= 0) return;
        setIsTransitioning(true);
        setSelectedWaypoint(null);
        await new Promise(resolve => setTimeout(resolve, 200));
        const prev = selectedWaypoint - 1;
        setTraveledProgress(prev / Math.max(waypoints.length - 1, 1));
        flyToWaypoint(prev);
        await new Promise(resolve => setTimeout(resolve, 1600));
        setSelectedWaypoint(prev);
        setCurrentImageIndex(0);
        setIsTransitioning(false);
        onWaypointClick?.(prev);
    };

    const startAutoPlay = () => {
        if (waypoints.length === 0) return;
        setSelectedWaypoint(0);
        setTraveledProgress(0);
        flyToWaypoint(0);
        setTimeout(() => setIsAutoPlaying(true), 1600);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && containerRef.current) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const selectedWP = selectedWaypoint !== null ? waypoints[selectedWaypoint] : null;

    const getMarkerIcon = (type: string) => {
        switch (type) {
            case 'photo': return <Camera className="w-4 h-4" />;
            case 'viewpoint': return <Mountain className="w-4 h-4" />;
            case 'rest': return <Info className="w-4 h-4" />;
            case 'danger': return <AlertTriangle className="w-4 h-4" />;
            default: return null;
        }
    };

    const getMarkerColor = (type: string) => {
        switch (type) {
            case 'photo': return 'bg-purple-500 border-white';
            case 'viewpoint': return 'bg-green-500 border-white';
            case 'rest': return 'bg-blue-500 border-white';
            case 'danger': return 'bg-red-500 border-white';
            default: return 'bg-blue-500 border-white';
        }
    };

    // Build route GeoJSON
    const routeGeoJSON = route?.coordinates ? {
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: route.coordinates }
    } : null;

    // Traveled portion
    const traveledCoords = routeGeoJSON && traveledProgress > 0
        ? route.coordinates.slice(0, Math.max(Math.floor(route.coordinates.length * traveledProgress), 2))
        : [];
    const traveledGeoJSON = traveledCoords.length > 1 ? {
        type: 'Feature' as const,
        properties: {},
        geometry: { type: 'LineString' as const, coordinates: traveledCoords }
    } : null;

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <div className="text-center p-8">
                    <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Mapbox token required</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative w-full h-full rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
            {/* Traveling Indicator */}
            {isTransitioning && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Traveling along the trail...</span>
                    <Navigation className="w-5 h-5 animate-spin" />
                </div>
            )}

            {/* Controls */}
            <div className="absolute top-4 left-4 z-20 flex gap-2">
                <Button
                    onClick={() => isAutoPlaying ? setIsAutoPlaying(false) : startAutoPlay()}
                    size="sm"
                    className={cn(
                        "rounded-full shadow-xl",
                        isAutoPlaying ? "bg-orange-500 hover:bg-orange-600" : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    )}
                >
                    {isAutoPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isAutoPlaying ? 'Stop Tour' : 'Auto-Play Tour'}
                </Button>
                <Button
                    onClick={toggleFullscreen}
                    size="sm"
                    variant="secondary"
                    className="rounded-full shadow-xl"
                >
                    <Maximize2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Style Switcher */}
            <div className="absolute top-4 right-14 z-20 flex rounded-xl overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10">
                <button
                    onClick={() => setMapStyle('mapbox://styles/mapbox/outdoors-v12')}
                    className={cn(
                        'px-4 py-2 text-xs font-medium transition-all',
                        mapStyle.includes('outdoors') ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                    )}
                >
                    Topo
                </button>
                <button
                    onClick={() => setMapStyle('mapbox://styles/mapbox/satellite-streets-v12')}
                    className={cn(
                        'px-4 py-2 text-xs font-medium transition-all',
                        mapStyle.includes('satellite') ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                    )}
                >
                    Satellite
                </button>
            </div>

            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                mapboxAccessToken={MAPBOX_TOKEN}
                terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
            >
                <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
                <NavigationControl position="top-right" />
                <ScaleControl position="bottom-left" />

                {/* Full Route (gray) */}
                {routeGeoJSON && (
                    <Source id="route-full" type="geojson" data={routeGeoJSON}>
                        <Layer
                            id="route-line-inactive"
                            type="line"
                            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                            paint={{ 'line-color': '#94a3b8', 'line-width': 4, 'line-opacity': 0.4 }}
                        />
                    </Source>
                )}

                {/* Traveled Route (colorful) */}
                {traveledGeoJSON && (
                    <Source id="route-traveled" type="geojson" data={traveledGeoJSON}>
                        <Layer
                            id="route-traveled-glow"
                            type="line"
                            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                            paint={{
                                'line-color': mapStyle.includes('satellite') ? '#fbbf24' : '#3b82f6',
                                'line-width': 8, 'line-opacity': 0.3, 'line-blur': 4
                            }}
                        />
                        <Layer
                            id="route-traveled-main"
                            type="line"
                            layout={{ 'line-join': 'round', 'line-cap': 'round' }}
                            paint={{
                                'line-color': mapStyle.includes('satellite') ? '#fbbf24' : '#3b82f6',
                                'line-width': 5, 'line-opacity': 1
                            }}
                        />
                    </Source>
                )}

                {/* Meeting Point */}
                {meetingPoint && (
                    <Marker longitude={meetingPoint.lng} latitude={meetingPoint.lat} anchor="bottom">
                        <div className="flex flex-col items-center animate-bounce">
                            <div className="bg-red-500 text-white p-2 rounded-full shadow-xl border-2 border-white">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div className="mt-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                                MEET HERE
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Start Point */}
                {startPoint && (
                    <Marker longitude={startPoint.lng} latitude={startPoint.lat} anchor="bottom">
                        <div className="flex flex-col items-center animate-bounce">
                            <div className="bg-green-500 text-white p-2 rounded-full shadow-xl border-2 border-white">
                                <Flag className="w-6 h-6" />
                            </div>
                            <div className="mt-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full shadow-lg">
                                START
                            </div>
                        </div>
                    </Marker>
                )}

                {/* Waypoints */}
                {waypoints.map((waypoint, i) => {
                    const hasPhotos = waypoint.images && waypoint.images.length > 0;
                    const isSelected = selectedWaypoint === i;

                    return (
                        <Marker key={`wp-${i}`} longitude={waypoint.lng} latitude={waypoint.lat} anchor="center">
                            <button onClick={() => handleWaypointClick(i)} className="relative group cursor-pointer">
                                <div className={cn(
                                    'rounded-full border-2 shadow-xl transition-all flex items-center justify-center text-white font-bold',
                                    getMarkerColor(waypoint.type),
                                    hasPhotos ? 'ring-4 ring-purple-400 ring-opacity-50' : '',
                                    isSelected ? 'scale-150 ring-8 w-11 h-11' : 'w-9 h-9 group-hover:scale-125'
                                )}>
                                    {getMarkerIcon(waypoint.type) || <span className="text-sm">{i + 1}</span>}
                                </div>
                                <div className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                    {i + 1}
                                </div>
                                {hasPhotos && (
                                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                                        📷
                                    </div>
                                )}
                            </button>
                        </Marker>
                    );
                })}

                {/* Popup */}
                {selectedWP && !isTransitioning && (
                    <Popup
                        longitude={selectedWP.lng}
                        latitude={selectedWP.lat}
                        anchor="bottom"
                        onClose={closePopup}
                        closeOnClick={false}
                        closeButton={false}
                        offset={25}
                        className="!bg-transparent !shadow-none !p-0"
                    >
                        <div className="relative w-[360px] rounded-2xl overflow-hidden shadow-2xl bg-black animate-in fade-in zoom-in-95">
                            {/* Image Section */}
                            {selectedWP.images && selectedWP.images.length > 0 ? (
                                <div className="relative w-full h-[240px] bg-black">
                                    <img
                                        src={selectedWP.images[currentImageIndex]}
                                        alt={selectedWP.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Image Navigation */}
                                    {selectedWP.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + selectedWP.images!.length) % selectedWP.images!.length); }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % selectedWP.images!.length); }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {selectedWP.images.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                                        className={cn('w-2 h-2 rounded-full transition-all', idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50')}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                        <div className="text-xs font-semibold text-white/70 mb-1">Point {selectedWaypoint! + 1} of {waypoints.length}</div>
                                        <h3 className="text-lg font-bold">{selectedWP.title}</h3>
                                        {selectedWP.elevation && <div className="text-sm text-white/90 mt-1">🏔️ {selectedWP.elevation}m</div>}
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-[200px] bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 flex items-center justify-center p-6">
                                    <div className="text-center text-white">
                                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                                            <Info className="w-6 h-6" />
                                        </div>
                                        <div className="text-xs text-white/70 mb-1">Point {selectedWaypoint! + 1} of {waypoints.length}</div>
                                        <h3 className="text-lg font-bold">{selectedWP.title}</h3>
                                        {selectedWP.elevation && <div className="text-sm text-white/90 mt-1">🏔️ {selectedWP.elevation}m</div>}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            {selectedWP.description && (
                                <div className="p-4 bg-card">
                                    <p className="text-sm text-muted-foreground">{selectedWP.description}</p>
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="p-3 bg-card border-t border-border/50">
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); prevWaypoint(); }}
                                        disabled={selectedWaypoint === 0 || isTransitioning}
                                        variant="outline"
                                        size="sm"
                                        className="rounded-lg"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                    </Button>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); nextWaypoint(); }}
                                        disabled={selectedWaypoint === waypoints.length - 1 || isTransitioning}
                                        size="sm"
                                        className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600"
                                    >
                                        {selectedWaypoint === waypoints.length - 1 ? 'Summit 🏔️' : <>Next <ChevronRight className="w-4 h-4 ml-1" /></>}
                                    </Button>
                                </div>
                            </div>

                            {/* Close */}
                            <button
                                onClick={(e) => { e.stopPropagation(); closePopup(); }}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </Popup>
                )}
            </Map>

            {/* Progress Bar */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-black/60 backdrop-blur-xl rounded-full p-3 border border-white/10">
                    <div className="flex items-center gap-4">
                        <span className="text-white text-sm font-medium">{waypoints.length} stops</span>
                        <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                                style={{ width: `${traveledProgress * 100}%` }}
                            />
                        </div>
                        <span className="text-white text-sm font-medium">{Math.round(traveledProgress * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
