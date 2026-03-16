'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trash2, ArrowRight, Clock, CalendarDays } from 'lucide-react';

interface TimelineEvent {
  _id: string;
  type: 'in' | 'out';
  timestamp: string;
  branch: string;
  eventType: 'actual' | 'correction';
}

interface AttendancePair {
  in?: TimelineEvent;
  out?: TimelineEvent;
  id: string;
}

interface HistoryTimelineProps {
  pairs: AttendancePair[];
  onDeleteRecord: (id: string) => void;
  onRequestCorrection: (type: 'in' | 'out') => void;
  isSidebar?: boolean;
}

export function HistoryTimeline({ pairs, onDeleteRecord, onRequestCorrection, isSidebar = false }: HistoryTimelineProps) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  };

  const getSessionDuration = (inTs: string, outTs: string) => {
    const diff = new Date(outTs).getTime() - new Date(inTs).getTime();
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  const groupedPairs = useMemo(() => {
    const groups: { [key: string]: AttendancePair[] } = {};
    
    pairs.forEach(pair => {
      const ts = pair.in?.timestamp || pair.out?.timestamp;
      if (!ts) return;
      
      const date = new Date(ts).toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (!groups[date]) groups[date] = [];
      groups[date].push(pair);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [pairs]);

  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className={`flex flex-col h-full bg-transparent ${isSidebar ? '' : 'rounded-[40px] border border-[var(--border)] overflow-hidden shadow-2xl bg-[var(--bg-surface)]'}`}>
      {!isSidebar && (
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]/80 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">History Log</h2>
          </div>
          <div className="px-4 py-1.5 rounded-full bg-[var(--bg-inset)] border border-[var(--border)] text-[10px] font-black opacity-40 uppercase tracking-widest tabular-nums">
            {pairs.length} Sessions
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-6 pb-20">
        <AnimatePresence mode="popLayout">
          {pairs.length === 0 ? (
            <div className="py-24 text-center opacity-20 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-[40px] bg-[var(--bg-inset)] flex items-center justify-center border border-[var(--border)]">
                <HistoryIcon className="w-8 h-8" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">No activity history</p>
            </div>
          ) : (
            groupedPairs.map(([dateStr, dayPairs]) => (
              <div key={dateStr} className="space-y-3 relative group/group">
                {/* STICKY DAY HEADER */}
                <div className="sticky top-0 z-10 py-3 bg-[var(--bg-surface)] md:bg-transparent backdrop-blur-md md:backdrop-blur-none -mx-2 px-2 transition-all">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500/60 drop-shadow-sm">
                      {getDateLabel(dateStr)}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                  </div>
                </div>

                <div className="space-y-3">
                  {dayPairs.map((pair) => (
                    <motion.div
                      key={pair.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[32px] overflow-hidden group shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-500"
                    >
                      {/* CARD HEADER */}
                      <div className="px-5 py-3.5 bg-white/[0.01] border-b border-[var(--border)]/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${pair.out ? 'bg-emerald-500' : 'bg-rose-500 animation-pulse'}`} />
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-30">
                            {pair.in?.branch || pair.out?.branch || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0">
                          <button 
                            onClick={() => onRequestCorrection(pair.in ? 'out' : 'in')}
                            className="p-2 rounded-xl bg-indigo-500/5 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/10"
                            title="Request Correction"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => {
                              if (!confirm('ยืนยันการลบรายการนี้?')) return;
                              if (pair.in) onDeleteRecord(pair.in._id);
                              if (pair.out) onDeleteRecord(pair.out._id);
                            }}
                            className="p-2 rounded-xl bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* CARD CONTENT */}
                      <div className="p-5 flex items-center justify-between gap-6">
                        <div className="flex-1 flex flex-col gap-1.5">
                          <span className="text-[9px] font-black uppercase opacity-20 tracking-tighter">In Time</span>
                          {pair.in ? (
                            <span className="text-base font-black tabular-nums">{formatTime(pair.in.timestamp)}</span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest">Missing</span>
                          )}
                        </div>

                        <div className="flex flex-col items-center gap-2">
                           {pair.in && pair.out ? (
                             <div className="px-2.5 py-1 rounded-full bg-white/5 border border-[var(--border)] text-[9px] font-black opacity-60 tabular-nums">
                                {getSessionDuration(pair.in.timestamp, pair.out.timestamp)}
                             </div>
                           ) : (
                             <ArrowRight className="w-4 h-4 opacity-5" />
                           )}
                        </div>

                        <div className="flex-1 flex flex-col gap-1.5 text-right">
                          <span className="text-[9px] font-black uppercase opacity-20 tracking-tighter">Out Time</span>
                          {pair.out ? (
                            <span className="text-base font-black tabular-nums">{formatTime(pair.out.timestamp)}</span>
                          ) : (
                            pair.in ? (
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">On-Going</span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-500/50 uppercase tracking-widest">Missing</span>
                            )
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animation-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
}
