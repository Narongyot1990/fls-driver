'use client';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// Fix Leaflet marker icons in Next.js
const FIX_LEAFLET_ICON = () => {
  if (typeof window === 'undefined') return;
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
};

interface BranchMapProps {
  center: { lat: number; lon: number };
  radius: number;
  onLocationChange: (lat: number, lon: number) => void;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function DraggableMarker({ position, onMove, radius }: { position: [number, number], onMove: (lat: number, lon: number) => void, radius: number }) {
  const map = useMapEvents({
    click(e) {
      onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <>
      <Marker 
        position={position} 
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onMove(position.lat, position.lng);
          },
        }}
      />
      <Circle 
        center={position} 
        radius={radius} 
        pathOptions={{ color: 'var(--accent)', fillColor: 'var(--accent)', fillOpacity: 0.15 }} 
      />
    </>
  );
}

export default function BranchMap({ center, radius, onLocationChange }: BranchMapProps) {
  useEffect(() => {
    FIX_LEAFLET_ICON();
  }, []);

  const pos: [number, number] = [center.lat, center.lon];

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border relative z-0">
      <MapContainer 
        center={pos} 
        zoom={16} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={pos} />
        <DraggableMarker position={pos} onMove={onLocationChange} radius={radius} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-[10px] font-bold shadow-sm backdrop-blur-sm border border-border">
         คลิกที่แผนที่หรือลาก Pin เพื่อเปลี่ยนตำแหน่ง
      </div>
    </div>
  );
}
