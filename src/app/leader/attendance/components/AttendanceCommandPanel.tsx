"use client";

import { ChevronLeft, History } from "lucide-react";
import { ClockCard } from "./ClockCard";
import { HistoryTimeline } from "./HistoryTimeline";
import type { AttendanceUser } from "@/app/leader/attendance/_lib/attendanceClient";
import type { AttendancePair } from "@/app/leader/attendance/_lib/attendanceTypes";

interface AttendanceCommandPanelProps {
  user: AttendanceUser | null;
  isClockedIn: boolean;
  attendancePairs: AttendancePair[];
  displayDistance: string;
  isInRange: boolean;
  actionLoading: boolean;
  lastRecordType: "in" | "out";
  onBack: () => void;
  onOpenOffsite: () => void;
  onOpenCorrection: (type: "in" | "out") => void;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  onDeleteRecord: (id: string) => void;
}

export function AttendanceCommandPanel({
  user,
  isClockedIn,
  attendancePairs,
  displayDistance,
  isInRange,
  actionLoading,
  lastRecordType,
  onBack,
  onOpenOffsite,
  onOpenCorrection,
  onClockIn,
  onClockOut,
  onDeleteRecord,
}: AttendanceCommandPanelProps) {
  return (
    <div className="h-[60vh] md:h-full w-full md:w-[420px] flex flex-col bg-[var(--bg-surface)] border-t md:border-t-0 md:border-r border-[var(--border)] z-20 relative shadow-2xl overflow-hidden shrink-0 order-2 md:order-1">
      <div className="p-5 md:p-8 flex items-center justify-between bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-30 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] hover:bg-white/5 transition-all active:scale-95 group shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">
              Attendance
            </h1>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Leader Portal</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Live</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        <div className="p-5 md:p-8 space-y-6 md:space-y-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition-opacity" />
            <ClockCard
              user={user}
              isClockedIn={isClockedIn}
              onClockIn={onClockIn}
              onClockOut={onClockOut}
              onOffsiteRequest={onOpenOffsite}
              distance={displayDistance}
              isInRange={isInRange}
              loading={actionLoading}
              lastType={lastRecordType}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="p-4 rounded-3xl bg-[var(--bg-inset)] border border-[var(--border)] flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Sessions</span>
              <span className="text-base md:text-lg font-black tabular-nums">{attendancePairs.length}</span>
            </div>
            <div className="p-4 rounded-3xl bg-[var(--bg-inset)] border border-[var(--border)] flex flex-col gap-1">
              <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Working</span>
              <span className="text-base md:text-lg font-black tabular-nums">{isClockedIn ? "Active" : "Off"}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-[9px] font-black uppercase tracking-widest opacity-30">History Log</h2>
              <History className="w-3 h-3 opacity-20" />
            </div>
            <HistoryTimeline
              pairs={attendancePairs}
              onDeleteRecord={onDeleteRecord}
              onRequestCorrection={onOpenCorrection}
              isSidebar={true}
            />
          </div>
        </div>

        <div className="p-6 md:p-8 mt-auto border-t border-[var(--border)] bg-white/[0.02] shrink-0">
          <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest mb-3 opacity-40">
            <span>Performance Score</span>
            <span>100%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 w-full rounded-full shadow-[0_0_12px_rgba(99,102,241,0.5)]" />
          </div>
        </div>
      </div>
    </div>
  );
}
