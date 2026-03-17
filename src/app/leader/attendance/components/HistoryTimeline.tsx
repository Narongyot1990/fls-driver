'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trash2, ArrowRight, Clock, CalendarDays, AlertCircle } from 'lucide-react';
import type { AttendancePair } from '@/app/leader/attendance/_lib/attendanceTypes';

interface HistoryTimelineProps {
  pairs: AttendancePair[];
  onDeleteRecord: (id: string) => void;
  onRequestCorrection: (type: "in" | "out") => void;
  isSidebar?: boolean;
}

export function HistoryTimeline({ 
  pairs, 
  onDeleteRecord, 
  onRequestCorrection,
  isSidebar = false 
}: HistoryTimelineProps) {
  
  const formatTime = (iso: string | Date) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('th-TH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }) + ' น.';
  };

  const formatDate = (iso: string | Date | undefined) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('th-TH', { 
      day: 'numeric', 
      month: 'short', 
      year: '2-digit' 
    });
  };

  const calculateDuration = (inTs?: string | Date, outTs?: string | Date) => {
    if (!inTs || !outTs) return null;
    const start = new Date(inTs).getTime();
    const end = new Date(outTs).getTime();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}ชม. ${diffMins}น.`;
  };

  if (pairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4 opacity-50">
        <div className="w-12 h-12 rounded-full bg-[var(--bg-inset)] flex items-center justify-center border border-[var(--border)]">
          <HistoryIcon className="w-6 h-6 opacity-20" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest">No History</p>
          <p className="text-[10px] opacity-60">Record your first session today</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      <AnimatePresence initial={false}>
        {pairs.map((pair, idx) => (
          <motion.div
            key={pair.id || idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group relative"
          >
            {/* Timeline Connector */}
            {idx !== pairs.length - 1 && (
              <div className="absolute left-[23px] top-12 bottom-0 w-px bg-gradient-to-b from-[var(--border)] to-transparent opacity-20" />
            )}

            <div className="flex gap-4">
              {/* Icon/Indicator */}
              <div className="relative shrink-0 pt-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-sm ${
                  pair.out ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500' : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-500'
                }`}>
                  <Clock className="w-5 h-5" />
                </div>
                {!pair.out && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-[var(--bg-surface)] animate-pulse" />
                )}
              </div>

              {/* Content Card */}
              <div className="flex-1 p-5 rounded-3xl bg-[var(--bg-inset)] border border-[var(--border)] group-hover:bg-white/[0.03] transition-all space-y-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
                  <CalendarDays className="w-12 h-12 rotate-12" />
                </div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-30">
                      {formatDate(pair.in?.timestamp || pair.out?.timestamp)}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black tabular-nums">{pair.in ? formatTime(pair.in.timestamp) : '--:--'}</span>
                       <ArrowRight className="w-3 h-3 opacity-20" />
                       <span className="text-sm font-black tabular-nums">{pair.out ? formatTime(pair.out.timestamp) : 'On-going'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    {pair.in && (
                      <button
                        onClick={() => onDeleteRecord(pair.in?._id || '')}
                        className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete In"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {pair.out && (
                      <button
                        onClick={() => onDeleteRecord(pair.out?._id || '')}
                        className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Out"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status and Details */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3">
                    {calculateDuration(pair.in?.timestamp, pair.out?.timestamp) && (
                      <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/5 flex items-center gap-1.5 shadow-sm">
                         <div className="w-1 h-1 rounded-full bg-emerald-500" />
                         <span className="text-[10px] font-bold tabular-nums opacity-60">
                           {calculateDuration(pair.in?.timestamp, pair.out?.timestamp)}
                         </span>
                      </div>
                    )}
                    {!pair.out && (
                      <div className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/10 flex items-center gap-1.5 shadow-sm">
                         <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
                           Active Now
                         </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!pair.in && (
                      <button
                        onClick={() => onRequestCorrection('in')}
                        className="text-[9px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1"
                      >
                        <AlertCircle className="w-2.5 h-2.5" />
                        Missing In
                      </button>
                    )}
                    {!pair.out && pair.in && (
                      <button
                        onClick={() => onRequestCorrection('out')}
                        className="text-[9px] font-black uppercase text-amber-500 hover:underline flex items-center gap-1"
                      >
                        <AlertCircle className="w-2.5 h-2.5" />
                        Missed Out?
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
