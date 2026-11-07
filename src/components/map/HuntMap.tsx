// ==============================================================================
// HUNTX CROSS-PLATFORM INTERACTIVE MAP COMPONENT (Leaflet + OpenStreetMap)
// Real-time Dynamic Shrinking Zones, Polygon Editor & Privacy-Controlled GPS
// ==============================================================================

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LatLng, ZoneBoundary, GamePlayer } from '../../types/huntx';

interface HuntMapProps {
  center: LatLng;
  zoom?: number;
  zone?: ZoneBoundary;
  currentRadiusMeters?: number;
  currentPolygon?: LatLng[];
  nextStageRadius?: number;
  nextStagePolygon?: LatLng[];
  isShrinking?: boolean;
  playerLocation?: LatLng | null;
  teammates?: GamePlayer[];
  isOutside?: boolean;
  isHostEditMode?: boolean;
  onZoneCenterChange?: (coords: LatLng) => void;
  onPolygonVertexAdd?: (coords: LatLng) => void;
}

export const HuntMap: React.FC<HuntMapProps> = ({
  center,
  zoom = 15,
  zone,
  currentRadiusMeters,
  currentPolygon,
  nextStageRadius,
  nextStagePolygon,
  isShrinking = false,
  playerLocation,
  teammates = [],
  isOutside = false,
  isHostEditMode = false,
  onZoneCenterChange,
  onPolygonVertexAdd,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layers
  const circleLayerRef = useRef<L.Circle | null>(null);
  const nextCircleLayerRef = useRef<L.Circle | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const nextPolygonLayerRef = useRef<L.Polygon | null>(null);
  const playerMarkerRef = useRef<L.CircleMarker | null>(null);
  const teammatesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const editMarkersGroupRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Esports CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    teammatesLayerGroupRef.current = L.layerGroup().addTo(map);
    editMarkersGroupRef.current = L.layerGroup().addTo(map);

    // Click handler for host zone drafting
    map.on('click', (e: L.LeafletMouseEvent) => {
      const clicked: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (onZoneCenterChange) {
        onZoneCenterChange(clicked);
      }
      if (onPolygonVertexAdd) {
        onPolygonVertexAdd(clicked);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update center & zoom
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom]);

  // Render Safe Zones (Circle / Polygon)
  useEffect(() => {
    if (!mapInstanceRef.current || !zone) return;
    const map = mapInstanceRef.current;

    // 1. CIRCLE ZONE
    if (zone.zone_type === 'circle') {
      const radius = currentRadiusMeters || zone.current_radius_meters;

      if (!circleLayerRef.current) {
        circleLayerRef.current = L.circle([zone.center.lat, zone.center.lng], {
          radius: radius,
          color: isShrinking ? '#FF8A00' : '#10B981',
          fillColor: isShrinking ? '#FF8A00' : '#10B981',
          fillOpacity: 0.12,
          weight: 3,
          dashArray: isShrinking ? '6, 6' : undefined,
        }).addTo(map);
      } else {
        circleLayerRef.current.setLatLng([zone.center.lat, zone.center.lng]);
        circleLayerRef.current.setRadius(radius);
        circleLayerRef.current.setStyle({
          color: isShrinking ? '#FF8A00' : '#10B981',
          fillColor: isShrinking ? '#FF8A00' : '#10B981',
          dashArray: isShrinking ? '6, 6' : undefined,
        });
      }

      // Next Shrink Target Circle (Ghost boundary)
      if (nextStageRadius && nextStageRadius < radius) {
        if (!nextCircleLayerRef.current) {
          nextCircleLayerRef.current = L.circle([zone.center.lat, zone.center.lng], {
            radius: nextStageRadius,
            color: '#EF4444',
            weight: 2,
            dashArray: '4, 8',
            fillOpacity: 0.05,
          }).addTo(map);
        } else {
          nextCircleLayerRef.current.setRadius(nextStageRadius);
        }
      }
    }

    // 2. POLYGON ZONE
    if (zone.zone_type === 'polygon') {
      const polyCoords = currentPolygon || zone.current_polygon || zone.initial_polygon || [];
      const leafletCoords: [number, number][] = polyCoords.map((p) => [p.lat, p.lng]);

      if (leafletCoords.length >= 3) {
        if (!polygonLayerRef.current) {
          polygonLayerRef.current = L.polygon(leafletCoords, {
            color: isShrinking ? '#FF8A00' : '#10B981',
            fillColor: isShrinking ? '#FF8A00' : '#10B981',
            fillOpacity: 0.15,
            weight: 3,
            dashArray: isShrinking ? '6, 6' : undefined,
          }).addTo(map);
        } else {
          polygonLayerRef.current.setLatLngs(leafletCoords);
          polygonLayerRef.current.setStyle({
            color: isShrinking ? '#FF8A00' : '#10B981',
            fillColor: isShrinking ? '#FF8A00' : '#10B981',
            dashArray: isShrinking ? '6, 6' : undefined,
          });
        }
      }

      // Next Polygon Target
      if (nextStagePolygon && nextStagePolygon.length >= 3) {
        const nextLeafletCoords: [number, number][] = nextStagePolygon.map((p) => [p.lat, p.lng]);
        if (!nextPolygonLayerRef.current) {
          nextPolygonLayerRef.current = L.polygon(nextLeafletCoords, {
            color: '#EF4444',
            weight: 2,
            dashArray: '4, 8',
            fillOpacity: 0.05,
          }).addTo(map);
        } else {
          nextPolygonLayerRef.current.setLatLngs(nextLeafletCoords);
        }
      }
    }
  }, [zone, currentRadiusMeters, currentPolygon, nextStageRadius, nextStagePolygon, isShrinking]);

  // Render Player Marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (playerLocation) {
      if (!playerMarkerRef.current) {
        playerMarkerRef.current = L.circleMarker([playerLocation.lat, playerLocation.lng], {
          radius: 8,
          fillColor: '#FF8A00',
          color: '#FFFFFF',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);
      } else {
        playerMarkerRef.current.setLatLng([playerLocation.lat, playerLocation.lng]);
      }
    } else if (playerMarkerRef.current) {
      playerMarkerRef.current.remove();
      playerMarkerRef.current = null;
    }
  }, [playerLocation]);

  // Render Teammates (Privacy-Controlled)
  useEffect(() => {
    if (!teammatesLayerGroupRef.current) return;
    const group = teammatesLayerGroupRef.current;
    group.clearLayers();

    teammates.forEach((tm) => {
      if (tm.current_lat && tm.current_lng && tm.location_shared) {
        const color = tm.team === 'hunters' ? '#EF4444' : '#10B981';
        const marker = L.circleMarker([tm.current_lat, tm.current_lng], {
          radius: 6,
          fillColor: color,
          color: '#FFFFFF',
          weight: 1.5,
          fillOpacity: 0.85,
        });
        marker.bindTooltip(tm.display_name, {
          permanent: false,
          direction: 'top',
          className: 'bg-huntx-card text-xs text-white border border-huntx-border px-2 py-1 rounded shadow-lg',
        });
        group.addLayer(marker);
      }
    });
  }, [teammates]);

  return (
    <div className="relative w-full h-full min-h-[340px] rounded-2xl overflow-hidden border border-huntx-border shadow-2xl bg-[#0A0A0A]">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Outside Zone Warning Red Tint Overlay */}
      {isOutside && (
        <div className="absolute inset-0 pointer-events-none border-4 border-red-600/80 bg-red-600/10 animate-pulse z-[1000] flex flex-col items-center justify-start pt-6">
          <div className="bg-red-600 text-white font-bold tracking-widest text-sm px-4 py-1.5 rounded-full shadow-lg shadow-red-600/50 uppercase">
            WARNING: OUTSIDE SAFE ZONE
          </div>
        </div>
      )}

      {/* Map Compass / Crosshair Overlay */}
      <div className="absolute top-3 left-3 pointer-events-none z-[500] flex items-center space-x-2 bg-huntx-surface/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-huntx-border text-xs text-huntx-muted">
        <span className="w-2 h-2 rounded-full bg-huntx-accent animate-ping" />
        <span className="font-semibold text-white tracking-wider">HUNTX RADAR</span>
      </div>
    </div>
  );
};
