import { useRef, useState, useMemo, useEffect, FC } from 'react';
import { useData } from '../context/DataContext';
import { MOCK_DESTINATIONS } from '../constants';
import { Loader as Loader2, Brain as Train, Warehouse } from 'lucide-react';
import { RakeSuggestion } from '../types';

declare const L: any;

const LogisticsMapPage: FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const inventoryMarkersRef = useRef<{ [key: string]: any }>({});
    const rakeMarkersRef = useRef<{ [key: string]: any }>({});
    const routeLayerRef = useRef<any>(null);

    const { inventories, rakePlans } = useData();
    const [mapStatus, setMapStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [selectedRakeId, setSelectedRakeId] = useState<string | null>(null);

    const inTransitPlans = useMemo(() => {
        return rakePlans.filter(plan => plan.status === 'dispatched');
    }, [rakePlans]);

    const drawHighlightRoute = (plan: RakeSuggestion) => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const source = inventories.find(inv => inv.baseName === plan.base);
        const destCoords = MOCK_DESTINATIONS[plan.destination];

        if (!source || !destCoords) return;

        if (routeLayerRef.current) {
            map.removeLayer(routeLayerRef.current);
        }

        const latlngs = [
            [source.lat, source.lon],
            [destCoords.lat, destCoords.lon]
        ];

        routeLayerRef.current = L.polyline(latlngs, {
            color: '#FF6600',
            weight: 3,
            dashArray: '10, 10',
            opacity: 0.8
        }).addTo(map);
    };

    const removeHighlightRoute = () => {
        const map = mapInstanceRef.current;
        if (!map || !routeLayerRef.current) return;
        map.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
    };

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
            if (typeof L === 'undefined') {
                setMapStatus('error');
                return;
            }

            const map = L.map(mapContainerRef.current, {
                center: [22, 82],
                zoom: 5,
                zoomControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(map);

            mapInstanceRef.current = map;
            setMapStatus('loaded');

            map.on('click', () => {
                setSelectedRakeId(null);
            });

        } catch (error) {
            console.error("Map initialization failed:", error);
            setMapStatus('error');
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (mapStatus !== 'loaded' || !map) return;

        Object.values(inventoryMarkersRef.current).forEach((marker: any) => marker.remove());
        inventoryMarkersRef.current = {};

        inventories.forEach(inv => {
            const icon = L.divIcon({
                html: `<div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF6600" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/>
                        <path d="M6 18h12"/>
                        <path d="M6 14h12"/>
                        <path d="m6 10 6-3 6 3"/>
                    </svg>
                </div>`,
                className: '',
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            const marker = L.marker([inv.lat, inv.lon], { icon })
                .bindPopup(`<strong>${inv.baseName}</strong><br/>Available Rakes: ${inv.availableRakes}`)
                .addTo(map);

            inventoryMarkersRef.current[inv.baseId] = marker;
        });
    }, [mapStatus, inventories]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (mapStatus !== 'loaded' || !map) return;

        const currentMarkerIds = Object.keys(rakeMarkersRef.current);
        const inTransitPlanIds = inTransitPlans.map(p => p.rakeId);

        currentMarkerIds.forEach(rakeId => {
            if (!inTransitPlanIds.includes(rakeId)) {
                rakeMarkersRef.current[rakeId].remove();
                delete rakeMarkersRef.current[rakeId];
            }
        });

        inTransitPlans.forEach(plan => {
            const { rakeId, currentLat, currentLon } = plan;
            if (typeof currentLat !== 'number' || typeof currentLon !== 'number') return;

            if (rakeMarkersRef.current[rakeId]) {
                rakeMarkersRef.current[rakeId].setLatLng([currentLat, currentLon]);
            } else {
                const icon = L.divIcon({
                    html: `<div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); cursor: pointer;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#003366" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect width="16" height="16" x="4" y="3" rx="2"/>
                            <path d="M4 11h16"/>
                            <path d="M12 3v8"/>
                            <path d="m8 19-2 3"/>
                            <path d="m18 22-2-3"/>
                            <path d="M8 15h0"/>
                            <path d="M16 15h0"/>
                        </svg>
                    </div>`,
                    className: '',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });

                const marker = L.marker([currentLat, currentLon], { icon })
                    .addTo(map);

                marker.on('click', (e: any) => {
                    L.DomEvent.stopPropagation(e);
                    setSelectedRakeId(plan.rakeId);
                });

                rakeMarkersRef.current[rakeId] = marker;
            }
        });
    }, [inTransitPlans, mapStatus]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        removeHighlightRoute();

        if (selectedRakeId) {
            const plan = inTransitPlans.find(p => p.rakeId === selectedRakeId);
            if (plan && typeof plan.currentLat === 'number' && typeof plan.currentLon === 'number') {
                drawHighlightRoute(plan);

                const progress = (plan.progress || 0) * 100;
                const content = `
                    <div style="width: 250px; padding: 8px;">
                        <h4 style="font-weight: bold; color: #003366; margin: 0 0 4px 0;">${plan.rakeId}</h4>
                        <p style="font-size: 14px; color: #666; margin: 0 0 8px 0;">${plan.base} → ${plan.destination}</p>
                        <div style="width: 100%; background: #e5e7eb; border-radius: 9999px; height: 10px; margin-bottom: 4px;">
                            <div style="background: #16a34a; height: 10px; border-radius: 9999px; width: ${progress}%;"></div>
                        </div>
                        <p style="font-size: 12px; color: #999; text-align: right; margin: 0;">${Math.round(progress)}% Complete</p>
                    </div>
                `;

                const popup = L.popup({
                    closeButton: false,
                    offset: [0, -18]
                })
                    .setLatLng([plan.currentLat, plan.currentLon])
                    .setContent(content)
                    .openOn(map);
            }
        }
    }, [selectedRakeId, inTransitPlans, inventories]);

    return (
        <div className="h-full flex flex-col">
            <div className="p-6 pb-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 border-b dark:border-gray-700">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Live Logistics Network</h1>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time overview of plant locations and in-transit rakes.</p>
            </div>
            <div className="flex-grow relative bg-gray-200">
                <div ref={mapContainerRef} className="absolute inset-0"></div>

                {mapStatus === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-80 p-4 pointer-events-none">
                        <div className="flex items-center gap-2 text-gray-600"><Loader2 className="animate-spin" /><span>Loading map...</span></div>
                    </div>
                )}

                {mapStatus === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-100 p-4 pointer-events-none">
                        <p className="text-red-700 font-semibold text-center">
                            Could not load map services. Please check your network connection and refresh the page.
                        </p>
                    </div>
                )}

                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10 w-48">
                    <h3 className="font-bold mb-2 text-sm dark:text-gray-200">Legend</h3>
                    <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                        <li className="flex items-center">
                            <Warehouse size={18} className="text-sail-orange mr-2" />
                            <span>Steel Plant</span>
                        </li>
                        <li className="flex items-center">
                            <Train size={18} className="text-sail-blue mr-2" />
                            <span>Active Rake</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default LogisticsMapPage;
