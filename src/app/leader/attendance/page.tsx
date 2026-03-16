'use client';

import { useState, useRef, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, LocateFixed, Building2, Clock, 
  Map as MapIcon, History, Zap, Settings
} from 'lucide-react';
import { useAttendanceController } from './hooks/useAttendanceController';
import { ClockCard } from './components/ClockCard';
import { HistoryTimeline } from './components/HistoryTimeline';
import { CorrectionModal, OffsiteModal } from './components/AttendanceModals';

const BranchMap = dynamic(() => import('@/components/BranchMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[var(--bg-inset)] animate-pulse flex items-center justify-center text-[10px] font-black uppercase tracking-widest opacity-20">Loading Map Engine...</div>
});

function AttendanceContent() {
  const router = useRouter();
  const ctrl = useAttendanceController();
  const mapRef = useRef<any>(null);
  
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isOffsiteOpen, setIsOffsiteOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState<'in' | 'out'>('in');

  const warpTo = (target: 'user' | 'office') => {
    if (target === 'user' && ctrl.location) mapRef.current?.flyTo(ctrl.location.lat, ctrl.location.lon);
    else if (target === 'office' && ctrl.branchLocation) mapRef.current?.flyTo(ctrl.branchLocation.lat, ctrl.branchLocation.lon);
  };

  if (ctrl.loading) return (
    <div className="h-[100dvh] flex items-center justify-center bg-[var(--bg-base)]">
      <div className="w-12 h-12 rounded-3xl bg-indigo-500/10 flex items-center justify-center relative">
        <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <Zap className="w-5 h-5 text-indigo-500" />
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full bg-[var(--bg-inset)] overflow-hidden flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      
      {/* MAP AREA (Top on Mobile, Full-Right on Desktop) */}
      <div className="h-[40vh] md:h-full flex-1 relative bg-[var(--bg-inset)] z-10 order-1 md:order-2">
        <div className="absolute inset-0">
          {ctrl.branchLocation ? (
            <BranchMap
              ref={mapRef}
              center={ctrl.branchLocation}
              radius={ctrl.branchRadius}
              userLocation={ctrl.location}
              userProfileImage={ctrl.user?.lineProfileImage}
              readOnly={true}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            </div>
          )}
        </div>

        {/* MAP UTILS OVERLAY */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-[1000] md:bottom-10 md:right-10">
            <button 
              onClick={() => warpTo('user')}
              className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white shadow-2xl hover:scale-110 active:scale-90 transition-all"
            >
              <LocateFixed className="w-5 h-5" />
            </button>
            <button 
              onClick={() => warpTo('office')}
              className="p-3.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-amber-500 shadow-2xl hover:scale-110 active:scale-90 transition-all"
            >
              <Building2 className="w-5 h-5" />
            </button>
        </div>

        {/* MOBILE FLOATING DISTANCE STAT */}
        <div className="md:hidden absolute top-6 right-6 z-[1000]">
             <div className="px-4 py-2.5 rounded-[20px] bg-black/80 backdrop-blur-2xl border border-white/10 shadow-3xl flex items-center gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)] animate-pulse" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest tabular-nums">{ctrl.displayDistance}</span>
             </div>
        </div>
      </div>

      {/* COMMAND CENTER (Bottom on Mobile, Left-Sidebar on Desktop) */}
      <div className="h-[60vh] md:h-full w-full md:w-[420px] flex flex-col bg-[var(--bg-surface)] border-t md:border-t-0 md:border-r border-[var(--border)] z-20 relative shadow-2xl overflow-hidden shrink-0 order-2 md:order-1">
        
        {/* HEADER AREA */}
        <div className="p-5 md:p-8 flex items-center justify-between bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--border)] z-30 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] hover:bg-white/5 transition-all active:scale-95 group shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent">Attendance</h1>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30">Leader Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Live</span>
          </div>
        </div>

        {/* SCROLLABLE COMMAND CENTER */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-5 md:p-8 space-y-6 md:space-y-8">
                
                {/* CLOCK CARD OVERLAY */}
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[40px] blur opacity-10 group-hover:opacity-20 transition-opacity" />
                    <ClockCard 
                        user={ctrl.user}
                        isClockedIn={ctrl.isClockedIn}
                        isClockedOut={ctrl.isClockedOut}
                        onClockIn={() => ctrl.handleClockAction('in')}
                        onClockOut={() => ctrl.handleClockAction('out')}
                        onOffsiteRequest={() => setIsOffsiteOpen(true)}
                        distance={ctrl.displayDistance}
                        isInRange={ctrl.isInRange}
                        loading={ctrl.actionLoading}
                        lastType={ctrl.lastRecordType}
                    />
                </div>

                {/* STATS PREVIEW (MINIMAL) */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="p-4 rounded-3xl bg-[var(--bg-inset)] border border-[var(--border)] flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Sessions</span>
                        <span className="text-base md:text-lg font-black tabular-nums">{ctrl.attendancePairs.length}</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-[var(--bg-inset)] border border-[var(--border)] flex flex-col gap-1">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Working</span>
                        <span className="text-base md:text-lg font-black tabular-nums">{ctrl.isClockedIn ? 'Active' : 'Off'}</span>
                    </div>
                </div>

                {/* HISTORY TIMELINE - INTERNAL SCROLLING */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-[9px] font-black uppercase tracking-widest opacity-30">History Log</h2>
                    <History className="w-3 h-3 opacity-20" />
                  </div>
                  <HistoryTimeline 
                    pairs={ctrl.attendancePairs}
                    onDeleteRecord={ctrl.handleDeleteRecord}
                    onRequestCorrection={(type) => { setCorrectionType(type); setIsCorrectionOpen(true); }}
                    isSidebar={true}
                  />
                </div>
            </div>
            
            {/* FOOTER STATS */}
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

      {/* MODALS */}
      <CorrectionModal 
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSubmit={ctrl.submitCorrection}
        loading={ctrl.actionLoading}
        initialType={correctionType}
      />
      <OffsiteModal 
        isOpen={isOffsiteOpen}
        onClose={() => setIsOffsiteOpen(false)}
        onSubmit={ctrl.submitCorrection}
        loading={ctrl.actionLoading}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        
        @supports (-webkit-touch-callout: none) {
          .h-[100dvh] { height: -webkit-fill-available; }
        }
      `}</style>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="h-[100dvh] bg-[var(--bg-base)]" />}>
      <AttendanceContent />
    </Suspense>
  );
}
