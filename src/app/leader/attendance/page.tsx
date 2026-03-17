'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useAttendanceController } from './hooks/useAttendanceController';
import { CorrectionModal, OffsiteModal } from './components/AttendanceModals';
import { AttendanceMapPanel, type BranchMapHandle } from './components/AttendanceMapPanel';
import { AttendanceCommandPanel } from './components/AttendanceCommandPanel';

function AttendanceContent() {
  const router = useRouter();
  const ctrl = useAttendanceController();
  const mapRef = useRef<BranchMapHandle | null>(null);

  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isOffsiteOpen, setIsOffsiteOpen] = useState(false);
  const [correctionType, setCorrectionType] = useState<'in' | 'out'>('in');

  const warpTo = (target: 'user' | 'office') => {
    if (target === 'user' && ctrl.location) {
      mapRef.current?.flyTo(ctrl.location.lat, ctrl.location.lon);
      return;
    }

    if (target === 'office' && ctrl.branchLocation) {
      mapRef.current?.flyTo(ctrl.branchLocation.lat, ctrl.branchLocation.lon);
    }
  };

  if (ctrl.loading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-[var(--bg-base)]">
        <div className="w-12 h-12 rounded-3xl bg-indigo-500/10 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-3xl border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
          <Zap className="w-5 h-5 text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--bg-inset)] overflow-hidden flex flex-col md:flex-row font-sans selection:bg-indigo-500/30">
      <AttendanceMapPanel
        branchLocation={ctrl.branchLocation}
        branchRadius={ctrl.branchRadius}
        userLocation={ctrl.location}
        userProfileImage={ctrl.user?.lineProfileImage}
        displayDistance={ctrl.displayDistance}
        mapRef={mapRef}
        onWarpTo={warpTo}
      />

      <AttendanceCommandPanel
        user={ctrl.user}
        isClockedIn={ctrl.isClockedIn}
        attendancePairs={ctrl.attendancePairs}
        displayDistance={ctrl.displayDistance}
        isInRange={ctrl.isInRange}
        actionLoading={ctrl.actionLoading}
        lastRecordType={ctrl.lastRecordType}
        onBack={() => router.back()}
        onOpenOffsite={() => setIsOffsiteOpen(true)}
        onOpenCorrection={(type) => {
          setCorrectionType(type);
          setIsCorrectionOpen(true);
        }}
        onClockIn={() => ctrl.handleClockAction('in')}
        onClockOut={() => ctrl.handleClockAction('out')}
        onDeleteRecord={ctrl.handleDeleteRecord}
      />

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
