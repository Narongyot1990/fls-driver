"use client";

import type { RefObject } from "react";
import dynamic from "next/dynamic";
import { LocateFixed, Building2 } from "lucide-react";
import type { Coordinates } from "@/app/leader/attendance/_lib/attendanceClient";

const BranchMap = dynamic(() => import("@/components/BranchMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-[var(--bg-inset)] animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">
      Loading Map Engine...
    </div>
  ),
});

export type BranchMapHandle = {
  flyTo: (lat: number, lon: number) => void;
};

interface AttendanceMapPanelProps {
  branchLocation: Coordinates | null;
  branchRadius: number;
  userLocation: Coordinates | null;
  userProfileImage?: string;
  displayDistance: string;
  mapRef: RefObject<BranchMapHandle | null>;
  onWarpTo: (target: "user" | "office") => void;
}

export function AttendanceMapPanel({
  branchLocation,
  branchRadius,
  userLocation,
  userProfileImage,
  displayDistance,
  mapRef,
  onWarpTo,
}: AttendanceMapPanelProps) {
  return (
    <div className="h-[40vh] md:h-full flex-1 relative bg-[var(--bg-inset)] z-10 order-1 md:order-2">
      <div className="absolute inset-0">
        {branchLocation ? (
          <BranchMap
            ref={mapRef}
            center={branchLocation}
            radius={branchRadius}
            userLocation={userLocation}
            userProfileImage={userProfileImage}
            readOnly={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          </div>
        )}
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-[1000] md:bottom-10 md:right-10">
        <button
          onClick={() => onWarpTo("user")}
          className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:scale-110 active:scale-90 transition-all"
        >
          <LocateFixed className="w-5 h-5" />
        </button>
        <button
          onClick={() => onWarpTo("office")}
          className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-amber-500 shadow-2xl hover:scale-110 active:scale-90 transition-all"
        >
          <Building2 className="w-5 h-5" />
        </button>
      </div>

      <div className="md:hidden absolute top-6 right-6 z-[1000]">
        <div className="px-4 py-2.5 rounded-[20px] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-3xl flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)] animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{displayDistance}</span>
        </div>
      </div>
    </div>
  );
}
