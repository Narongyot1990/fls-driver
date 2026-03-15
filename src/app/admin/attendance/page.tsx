'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, TrendingUp, Activity, ChevronRight, History as HistoryIcon, Calendar, User, Search, CheckSquare } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useBranches } from '@/hooks/useBranches';
import UserAvatar from '@/components/UserAvatar';
import { usePusher } from '@/hooks/usePusher';
import BottomNav from '@/components/BottomNav';

interface AttendanceRecord {
  _id: string;
  userId: string;
  userName: string;
  userImage?: string;
  type: 'in' | 'out';
  timestamp: string;
  branch: string;
  location: { lat: number; lon: number };
  distance: number;
  isInside: boolean;
}

export default function AttendanceMonitorPage() {
  const { branches } = useBranches();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'day' | 'month'>('day');
  const [viewDate, setViewDate] = useState(new Date());

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      // For Month view, fetch a wider range. For Day view, just today.
      const start = new Date(viewDate);
      if (zoomLevel === 'month') {
        start.setDate(1);
      }
      const dateStr = start.toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?date=${dateStr}&range=${zoomLevel}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [viewDate, zoomLevel]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  usePusher('users', [{ event: 'leader-attendance', callback: fetchRecords }], true);

  // Process data for Timeline
  const timelineData = useMemo(() => {
    const userMap = new Map<string, { name: string; image?: string; groups: { start: Date; end: Date | null }[] }>();
    
    const sorted = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sorted.forEach(rec => {
      if (!userMap.has(rec.userId)) {
        userMap.set(rec.userId, { name: rec.userName, image: rec.userImage, groups: [] });
      }
      const userData = userMap.get(rec.userId)!;
      if (rec.type === 'in') {
        userData.groups.push({ start: new Date(rec.timestamp), end: null });
      } else {
        const lastGroup = userData.groups[userData.groups.length - 1];
        if (lastGroup && !lastGroup.end) {
          lastGroup.end = new Date(rec.timestamp);
        }
      }
    });

    return Array.from(userMap.entries()).map(([id, data]) => ({ id, ...data }));
  }, [records]);

  const stats = useMemo(() => {
    const ins = records.filter(r => r.type === 'in').length;
    const outs = records.filter(r => r.type === 'out').length;
    return { working: ins - outs, inside: records.filter(r => r.isInside).length };
  }, [records]);

  // Timeline Helper: 0-24 Hours
  const hours = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="admin" />
      <div className="lg:pl-[240px] pb-[80px]">
        
        {/* Compact Header */}
        <header className="px-4 pt-6 pb-2 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-black tracking-tighter">TIMELINE MONITOR</h1>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Monitoring 2.0 / {new Date().toLocaleDateString('th-TH')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
               <span className="text-lg font-black leading-none">{stats.working}</span>
            </div>
            <div className="w-[1px] h-6 bg-[var(--border)] hidden md:block" />
            <button 
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]"
            >
              <HistoryIcon className={`w-5 h-5 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        <main className="p-4 space-y-4 max-w-7xl mx-auto">
          
          {/* Recent History (Expandable) */}
          <AnimatePresence>
            {isHistoryExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="card p-4 space-y-3 bg-[var(--bg-inset)] border-dashed">
                  <h3 className="text-[9px] font-black uppercase tracking-widest opacity-50 px-1">Recent Logs</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {records.slice(0, 6).map(r => (
                      <div key={r._id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border)]">
                        <UserAvatar imageUrl={r.userImage} displayName={r.userName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black truncate">{r.userName}</p>
                          <p className="text-[9px] font-bold opacity-40 uppercase">{new Date(r.timestamp).toLocaleTimeString()} · {r.type}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${r.type === 'in' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline View */}
          <div className="card-neo overflow-hidden flex flex-col min-h-[500px]">            {/* Timeline Tools */}
            <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-[var(--bg-surface)]">
               <div className="flex items-center gap-1 bg-[var(--bg-inset)] p-1 rounded-xl">
                  <button 
                    onClick={() => setZoomLevel('day')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${zoomLevel === 'day' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setZoomLevel('month')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${zoomLevel === 'month' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  >
                    Monthly
                  </button>
               </div>
               
               <div className="flex items-center gap-4">
                  <button onClick={() => {
                    const d = new Date(viewDate);
                    if (zoomLevel === 'month') d.setMonth(d.getMonth() - 1);
                    else d.setDate(d.getDate() - 1);
                    setViewDate(d);
                  }} className="w-8 h-8 rounded-full bg-[var(--bg-inset)] flex items-center justify-center text-muted hover:text-[var(--text-primary)] transition-colors">
                    <ChevronRight className="rotate-180 w-4 h-4" />
                  </button>
                  <div className="text-center min-w-[120px]">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-none mb-1">{zoomLevel === 'month' ? 'Select Month' : 'Select Day'}</p>
                    <p className="text-sm font-black text-[var(--accent)]">
                      {zoomLevel === 'month' 
                        ? viewDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })
                        : viewDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button onClick={() => {
                    const d = new Date(viewDate);
                    if (zoomLevel === 'month') d.setMonth(d.getMonth() + 1);
                    else d.setDate(d.getDate() + 1);
                    setViewDate(d);
                  }} className="w-8 h-8 rounded-full bg-[var(--bg-inset)] flex items-center justify-center text-muted hover:text-[var(--text-primary)] transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>

            {/* Timeline Scrollable Area with Fixed Column */}
            <div className="flex-1 overflow-hidden flex flex-col relative h-[600px] bg-[var(--bg-inset)]/20">
               {/* 2-Tier Gantt Header */}
               <div className="flex flex-col border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-20 shadow-sm">
                  {/* Tier 1: Month/Year */}
                  <div className="flex border-b border-[var(--border)]/50">
                    <div className="w-[180px] shrink-0 p-3 border-r border-[var(--border)] bg-[#f8fafc] dark:bg-[#0f172a] sticky left-0 z-30 flex items-center">
                       <div className="w-2 h-8 rounded-full bg-[var(--accent)] mr-3" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">LEADER STAFF</span>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center py-2">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent)]">
                          {viewDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                       </span>
                    </div>
                  </div>
                  
                  {/* Tier 2: Hours/Days */}
                  <div className="flex">
                    <div className="w-[180px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)] sticky left-0 z-30" />
                    <div className="flex-1 overflow-x-hidden">
                      <div className="flex h-10">
                        {zoomLevel === 'day' ? (
                          Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="flex-1 min-w-[60px] flex flex-col items-center justify-center border-r border-[var(--border)]/30 bg-white/50 dark:bg-black/20">
                               <span className="text-[9px] font-black text-slate-400">{i.toString().padStart(2, '0')}</span>
                               <span className="text-[7px] font-bold opacity-20 uppercase">Hour</span>
                            </div>
                          ))
                        ) : (
                          Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                            const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                              <div key={i} className={`flex-1 min-w-[40px] flex flex-col items-center justify-center border-r border-[var(--border)]/30 ${isWeekend ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'bg-white/50 dark:bg-black/20'}`}>
                                 <span className={`text-[9px] font-black ${isWeekend ? 'text-rose-500' : 'text-slate-400'}`}>{i + 1}</span>
                                 <span className="text-[7px] font-bold opacity-20 uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
               </div>

               {/* Scrollable Content with Professional Grid */}
               <div className="flex-1 overflow-auto custom-scrollbar relative bg-gantt-grid">
                  {timelineData.map(user => (
                    <div key={user.id} className="flex border-b border-[var(--border)]/30 group hover:bg-[var(--accent)]/[0.02] transition-colors h-16">
                       {/* Fixed Left Column - Styled like Example 01 */}
                       <div className="w-[180px] shrink-0 p-3 border-r border-[var(--border)] bg-[var(--bg-surface)] sticky left-0 z-10 flex items-center gap-3 group-hover:bg-[#f8fafc] dark:group-hover:bg-[#0f172a] transition-colors shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 font-black text-[10px] hidden sm:flex shrink-0">
                             {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[11px] font-black truncate leading-tight text-slate-700 dark:text-slate-200">{user.name}</p>
                             <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Site Leader</span>
                             </div>
                          </div>
                       </div>
                       
                       {/* Timeline Tracks - High Fidelity Bars */}
                       <div className="flex-1 relative">
                          {user.groups.map((group, idx) => {
                             let left = 0;
                             let width = 0;

                             if (zoomLevel === 'day') {
                               const startH = group.start.getHours() + group.start.getMinutes() / 60;
                               const effectiveEnd = group.end || (viewDate.toDateString() === new Date().toDateString() ? new Date() : new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate(), 23, 59));
                               const endH = effectiveEnd.getHours() + effectiveEnd.getMinutes() / 60;
                               left = (startH / 24) * 100;
                               width = ((endH - startH) / 24) * 100;
                             } else {
                               const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
                               const startD = group.start.getDate() - 1 + group.start.getHours() / 24;
                               const effectiveEnd = group.end || new Date(viewDate.getFullYear(), viewDate.getMonth(), daysInMonth, 23, 59);
                               const endD = effectiveEnd.getDate() - 1 + effectiveEnd.getHours() / 24;
                               left = (startD / daysInMonth) * 100;
                               width = ((endD - startD) / daysInMonth) * 100;
                             }

                             const isLive = !group.end;
                             const color = isLive ? '#10b981' : '#64748b';
                             const gradient = isLive 
                               ? 'linear-gradient(90deg, #10b981, #34d399)' 
                               : 'linear-gradient(90deg, #94a3b8, #cbd5e1)';

                             return (
                               <motion.div
                                 key={idx}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 className="absolute top-1/2 -translate-y-1/2 h-4 rounded-full flex items-center px-1"
                                 style={{ 
                                   left: `${Math.max(0, left)}%`, 
                                   width: `${Math.max(1, width)}%`, 
                                   background: gradient,
                                   boxShadow: isLive ? '0 4px 12px rgba(16, 185, 129, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)',
                                   zIndex: isLive ? 5 : 1
                                 }}
                               >
                                  {/* Start Anchor */}
                                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border-2 border-inherit shrink-0" style={{ borderColor: color }} />
                                  
                                  {/* Info Label inside bar (if wide enough) */}
                                  <div className="flex-1 overflow-hidden pointer-events-none">
                                     <span className="text-[7px] font-black text-white px-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                        {group.start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                                        {group.end ? ` - ${group.end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ' (Live)'}
                                     </span>
                                  </div>

                                  {/* End Anchor */}
                                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm border-2 border-inherit shrink-0" style={{ borderColor: color }} />
                               </motion.div>
                             );
                          })}
                       </div>

                       {/* Status Indicator (Right side like Example) */}
                       <div className="w-[80px] shrink-0 flex items-center justify-center border-l border-[var(--border)]/30 bg-white/30 dark:bg-black/10">
                          {user.groups.some(g => !g.end) ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                               <CheckSquare className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                               <Clock className="w-3.5 h-3.5" />
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="admin" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        
        .bg-gantt-grid {
          background-image: 
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 100% 64px, ${zoomLevel === 'day' ? 'calc(100% / 24)' : `calc(100% / ${new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()})`} 100%;
          background-position: 0 -1px, -1px 0;
          opacity: 0.3;
        }

        .dark .bg-gantt-grid {
          opacity: 0.1;
        }
      `}</style>
    </div>
  );
}

