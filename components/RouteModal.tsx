import { useRef, useState, useEffect, FC } from 'react';
import { X, MapPin, Truck, Clock } from 'lucide-react';
import { RakeSuggestion, Inventory } from '../types';
import { MOCK_DESTINATIONS } from '../constants';

declare const L: any;

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface RouteModalProps {
  plan: RakeSuggestion;
  source: Inventory;
  onClose: () => void;
}

const RouteModal: FC<RouteModalProps> = ({ plan, source, onClose }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const destCoords = MOCK_DESTINATIONS[plan.destination];
  const distance = destCoords ? getDistance(source.lat, source.lon, destCoords.lat, destCoords.lon) : 0;
  const estimatedTime = Math.round(distance / 50);

  const [mapStatus, setMapStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!mapContainerRef.current || !destCoords || mapInstanceRef.current) {
      return;
    }

    try {
      if (typeof L === 'undefined') {
        setMapStatus('error');
        return;
      }

      const origin = { lat: source.lat, lng: source.lon };
      const destination = { lat: destCoords.lat, lng: destCoords.lon };

      const map = L.map(mapContainerRef.current, {
        center: [(origin.lat + destination.lat) / 2, (origin.lng + destination.lng) / 2],
        zoom: 5,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      const originIcon = L.divIcon({
        html: `<div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #16a34a; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const destIcon = L.divIcon({
        html: `<div style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: #dc2626; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      L.marker([origin.lat, origin.lng], { icon: originIcon })
        .bindPopup(`<strong>${source.baseName}</strong><br/>Origin`)
        .addTo(map);

      L.marker([destination.lat, destination.lng], { icon: destIcon })
        .bindPopup(`<strong>${plan.destination}</strong><br/>Destination`)
        .addTo(map);

      const latlngs = [
        [origin.lat, origin.lng],
        [destination.lat, destination.lng]
      ];

      L.polyline(latlngs, {
        color: '#0077B6',
        weight: 4,
        dashArray: '10, 10',
        opacity: 0.7
      }).addTo(map);

      const bounds = L.latLngBounds(latlngs);
      map.fitBounds(bounds, { padding: [50, 50] });

      setTimeout(() => {
        map.invalidateSize();
        setMapStatus('loaded');
      }, 100);

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
  }, [source, plan, destCoords]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Route Simulation: {plan.rakeId}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Route Details</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin size={20} className="text-green-600 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Origin</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{source.baseName}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPin size={20} className="text-red-600 mt-1 mr-3 flex-shrink-0" />
                   <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Destination</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{plan.destination}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck size={20} className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                   <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Distance</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{Math.round(distance).toLocaleString()} km</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock size={20} className="text-orange-600 mt-1 mr-3 flex-shrink-0" />
                   <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Travel Time</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">~{estimatedTime} hours</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative bg-gray-200 dark:bg-gray-700 rounded-lg h-64 md:h-auto min-h-[250px] overflow-hidden">
                <div ref={mapContainerRef} className="absolute inset-0"></div>
                {mapStatus === 'loading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200/80 p-4 pointer-events-none">
                        <p className="text-gray-500 dark:text-gray-300">Loading map...</p>
                    </div>
                )}
                {mapStatus === 'error' && (
                     <div className="absolute inset-0 flex items-center justify-center bg-red-100 p-4 pointer-events-none">
                        <p className="text-red-600 text-center text-sm font-medium">Failed to load map</p>
                    </div>
                )}
                {mapStatus === 'loaded' && (
                    <div className="absolute bottom-2 left-2 right-2 bg-blue-100/80 backdrop-blur-sm border-l-4 border-blue-500 text-blue-800 p-2 text-center text-xs font-medium z-10" role="alert">
                        Route visualization is a simulation. Actual rail routes may vary.
                    </div>
                )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600 text-right">
             <button onClick={onClose} className="px-4 py-2 bg-sail-orange text-white rounded-md hover:bg-orange-700">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default RouteModal;
