import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RamenShop } from '../types/ramen';
import { getStyleInfo } from '../data/ramenStyles';
import { Locate, Navigation, Footprints } from 'lucide-react';

interface RamenMapProps {
  shops: RamenShop[];
  userLat: number;
  userLng: number;
  userLabel: string;
  selectedShop: RamenShop | null;
  onSelectShop: (shop: RamenShop) => void;
  radiusMeters?: number;
}

export const RamenMap: React.FC<RamenMapProps> = ({
  shops,
  userLat,
  userLng,
  userLabel,
  selectedShop,
  onSelectShop,
  radiusMeters = 1500,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Avoid double initialization
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLat, userLng],
        zoom: 15,
        zoomControl: false,
      });

      // CartoDB Dark Matter / Stadia dark tiles for sleek Japanese night ramen aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      // Add Zoom control to bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update User Marker & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
    }

    // Custom Traveler Pulsing Pin
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="position: relative; width: 24px; height: 24px;">
          <div style="position: absolute; inset: 0; background: #3b82f6; opacity: 0.3; border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; inset: 3px; background: #2563eb; border: 2.5px solid white; border-radius: 9999px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.4);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    userMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family: inherit; font-size: 12px; color: #1c1917; font-weight: 700;">📍 ${userLabel}</div>`
      );

    // Search Radius Visual Circle
    radiusCircleRef.current = L.circle([userLat, userLng], {
      radius: radiusMeters,
      color: '#f59e0b',
      fillColor: '#f59e0b',
      fillOpacity: 0.05,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

    map.setView([userLat, userLng], 15);
  }, [userLat, userLng, userLabel, radiusMeters]);

  // Update Ramen Shop Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    const bounds = L.latLngBounds([userLat, userLng], [userLat, userLng]);

    shops.forEach((shop) => {
      if (!shop.lat || !shop.lng) return;

      bounds.extend([shop.lat, shop.lng]);

      const isSelected = selectedShop?.id === shop.id;
      const primaryStyle = shop.keito?.[0] ? getStyleInfo(shop.keito[0]) : null;
      const brothColor = primaryStyle ? primaryStyle.brothColor : '#f59e0b';
      const distanceDisplay = shop.distance_m
        ? shop.distance_m < 1000
          ? `${shop.distance_m}m`
          : `${(shop.distance_m / 1000).toFixed(1)}km`
        : '';

      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          background: ${isSelected ? '#f59e0b' : '#1c1917'};
          color: ${isSelected ? '#1c1917' : '#fafaf9'};
          padding: 4px 8px;
          border-radius: 9999px;
          border: 2px solid ${isSelected ? '#ffffff' : brothColor};
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          font-family: inherit;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
          transition: transform 0.15s ease;
        ">
          <span style="font-size: 13px;">🍜</span>
          <span>${shop.name.slice(0, 8)}${shop.name.length > 8 ? '…' : ''}</span>
          ${distanceDisplay ? `<span style="font-size: 9px; opacity: 0.8; font-weight: 500;">${distanceDisplay}</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-ramen-marker',
        html: markerHtml,
        iconSize: [120, 28],
        iconAnchor: [60, 14],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: customIcon });

      marker.on('click', () => {
        onSelectShop(shop);
      });

      layer.addLayer(marker);
    });

    // Auto-fit if shops exist
    if (shops.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [shops, selectedShop, userLat, userLng]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat, userLng], 15);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] bg-stone-950 overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Map floating control: Recenter on traveler */}
      <button
        onClick={handleRecenter}
        title="Recenter on your location"
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/95 hover:bg-stone-800 text-stone-200 border border-stone-700 shadow-xl text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
      >
        <Locate className="w-4 h-4 text-amber-500" />
        <span className="hidden sm:inline">Center Me</span>
      </button>

      {/* Floating Shop Quick-Card on selection */}
      {selectedShop && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-20 bg-stone-900/95 border border-amber-500/50 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                <Footprints className="w-3.5 h-3.5" />
                <span>
                  {selectedShop.distance_m !== undefined
                    ? selectedShop.distance_m < 1000
                      ? `${selectedShop.distance_m}m away`
                      : `${(selectedShop.distance_m / 1000).toFixed(1)}km away`
                    : 'Nearby'}
                </span>
              </div>
              <h4 className="font-bold text-sm text-stone-100 line-clamp-1 mt-0.5">
                {selectedShop.name}
              </h4>
              {selectedShop.name_en && (
                <p className="text-[11px] text-stone-400 line-clamp-1">
                  {selectedShop.name_en}
                </p>
              )}
            </div>
            <button
              onClick={() => onSelectShop(selectedShop)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-colors flex-shrink-0"
            >
              Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
