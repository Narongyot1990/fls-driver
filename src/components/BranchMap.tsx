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

// Custom Person Icon (Fallback)
const PERSON_ICON = typeof window !== 'undefined' ? new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
}) : null;

// Custom Branch/Office Icon
const BRANCH_ICON = typeof window !== 'undefined' ? new L.DivIcon({
  html: `
    <div style="
      background-color: var(--accent);
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18"></path>
        <path d="M9 8h1"></path>
        <path d="M14 8h1"></path>
        <path d="M9 13h1"></path>
        <path d="M14 13h1"></path>
        <path d="M9 18h1"></path>
        <path d="M14 18h1"></path>
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
      </svg>
    </div>
  `,
  className: 'custom-branch-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
}) : null;

interface BranchMapProps {
  center: { lat: number; lon: number };
  radius: number;
  userLocation?: { lat: number; lon: number } | null;
  userProfileImage?: string | null;
  onLocationChange?: (lat: number, lon: number) => void;
  readOnly?: boolean;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function DraggableMarker({ position, onMove, radius, readOnly }: { position: [number, number], onMove?: (lat: number, lon: number) => void, radius: number, readOnly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readOnly && onMove) onMove(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <>
      <Marker 
        position={position} 
        draggable={!readOnly}
        icon={BRANCH_ICON || undefined}
        eventHandlers={{
          dragend: (e) => {
            if (!readOnly && onMove) {
              const marker = e.target;
              const pos = marker.getLatLng();
              onMove(pos.lat, pos.lng);
            }
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

export default function BranchMap({ center, radius, userLocation, userProfileImage, onLocationChange, readOnly = false }: BranchMapProps) {
  useEffect(() => {
    FIX_LEAFLET_ICON();
  }, []);

  const branchPos: [number, number] = [center.lat, center.lon];
  const userPos: [number, number] | null = userLocation ? [userLocation.lat, userLocation.lon] : null;

  // Build user icon: LINE profile image or fallback person icon
  const userIcon = typeof window !== 'undefined'
    ? (userProfileImage
        ? new L.DivIcon({
            html: `
              <div class="user-marker-container" style="position: relative; width: 44px; height: 44px;">
                <div style="
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  background-color: var(--accent);
                  border-radius: 50%;
                  opacity: 0.3;
                  animation: pulse 2s infinite;
                "></div>
                <img src="${userProfileImage}" style="
                  position: absolute;
                  top: 4px;
                  left: 4px;
                  width: 36px;
                  height: 36px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                  object-fit: cover;
                " />
              </div>
              <style>
                @keyframes pulse {
                  0% { transform: scale(0.8); opacity: 0.5; }
                  100% { transform: scale(1.5); opacity: 0; }
                }
              </style>
            `,
            className: 'custom-user-marker',
            iconSize: [44, 44],
            iconAnchor: [22, 22],
          })
        : PERSON_ICON)
    : null;

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-border relative z-0">
      <MapContainer 
        center={branchPos} 
        zoom={16} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={branchPos} />
        
        {/* Branch Marker & Geofence */}
        <DraggableMarker 
          position={branchPos} 
          onMove={onLocationChange} 
          radius={radius} 
          readOnly={readOnly} 
        />

        {/* User Marker — Avatar with Pulse Effect */}
        {userPos && userIcon && (
          <Marker position={userPos} icon={userIcon} />
        )}
      </MapContainer>
      
      {!readOnly && (
        <div className="absolute bottom-2 left-2 z-[1000] bg-white/90 dark:bg-black/90 px-2 py-1 rounded text-[10px] font-black shadow-sm backdrop-blur-sm border border-border uppercase tracking-tight">
           คลิกหรือลาก "ตึก" เพื่อเปลี่ยนตำแหน่ง
        </div>
      )}
    </div>
  );
}
