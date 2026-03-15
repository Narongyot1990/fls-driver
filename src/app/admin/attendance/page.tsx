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
  const [leaders, setLeaders] = useState<any[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<'day' | 'month'>('day');
  const [viewDate, setViewDate] = useState(new Date());

  const fetchLeaders = useCallback(async () => {
    try {
      const res = await fetch('/api/users?role=leader');
      const data = await res.json();
      if (data.success) {
        setLeaders(data.users || []);
      }
    } catch (err) {
      console.error('Fetch Leaders Error:', err);
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
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
    fetchLeaders();
    fetchRecords();
  }, [fetchLeaders, fetchRecords]);

  // Combined Pusher handle
  usePusher('users', [{ event: 'leader-attendance', callback: fetchRecords }], true);
  usePusher('users', [{ event: 'driver-updated', callback: fetchLeaders }], true);

  // Process data for Timeline - Use ALL LEADERS as base
  const timelineData = useMemo(() => {
    // 1. Create base map from all leaders
    const userMap = new Map<string, { name: string; image?: string; groups: { start: Date; end: Date | null }[] }>();
    
    leaders.forEach(leader => {
      userMap.set(leader._id, { 
        name: leader.name || leader.lineDisplayName, 
        image: leader.lineProfileImage, 
        groups: [] 
      });
    });

    // 2. Overlay records
    const sorted = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    sorted.forEach(rec => {
      if (!userMap.has(rec.userId)) {
        // If driver record appearing in leader list (unexpected but handle)
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
  }, [leaders, records]);

  const stats = useMemo(() => {
    const activeNow = timelineData.filter(u => u.groups.some(g => !g.end)).length;
    return { working: activeNow, total: leaders.length };
  }, [timelineData, leaders]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="admin" />
      <div className="lg:pl-[240px] pb-[80px]">
        
        {/* Compact Header */}
        <header className="px-4 pt-4 pb-2 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-30 shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-[16px] md:text-xl font-black tracking-tighter">TIMELINE MONITOR</h1>
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[8px] font-black uppercase tracking-widest opacity-40 px-1.5 py-0.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border)]">v3.0 ALL-ACCESS</span>
               <span className="text-[8px] font-bold opacity-30">{new Date().toLocaleDateString('th-TH')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">ActiveNow</span>
               <span className="text-sm md:text-lg font-black leading-none">{stats.working}/{stats.total}</span>
            </div>
            <div className="w-[1px] h-6 bg-[var(--border)]" />
            <button 
              onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
              className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)]"
            >
              <HistoryIcon className={`w-4 h-4 md:w-5 md:h-5 transition-transform ${isHistoryExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </header>

        <main className="p-3 md:p-4 space-y-4 max-w-7xl mx-auto">
          
          {/* Recent History (Expandable) */}
          <AnimatePresence>
            {isHistoryExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="card p-3 space-y-3 bg-[var(--bg-inset)] border-dashed">
                  <h3 className="text-[9px] font-black uppercase tracking-widest opacity-50 px-1">Real-time Activity Flow</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {records.slice(0, 8).map(r => (
                      <div key={r._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)]">
                        <UserAvatar imageUrl={r.userImage} displayName={r.userName} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black truncate">{r.userName}</p>
                          <p className="text-[8px] font-bold opacity-40 uppercase">{new Date(r.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} · {r.type}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full ${r.type === 'in' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500'}`} />
                      </div>
                    ))}
                    {records.length === 0 && <p className="text-[10px] opacity-30 italic col-span-full py-4 text-center">No recent records for this range</p>}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Timeline View */}
          <div className="card-neo overflow-hidden flex flex-col min-h-[450px] md:min-h-[500px]">
            {/* Timeline Tools */}
            <div className="px-3 py-2.5 md:px-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
               <div className="flex items-center gap-1 bg-[var(--bg-inset)] p-1 rounded-xl">
                  <button 
                    onClick={() => setZoomLevel('day')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${zoomLevel === 'day' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  >
                    Daily
                  </button>
                  <button 
                    onClick={() => setZoomLevel('month')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${zoomLevel === 'month' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-40 hover:opacity-100'}`}
                  >
                    Monthly
                  </button>
               </div>
               
               <div className="flex items-center gap-3">
                  <button onClick={() => {
                    const d = new Date(viewDate);
                    if (zoomLevel === 'month') d.setMonth(d.getMonth() - 1);
                    else d.setDate(d.getDate() - 1);
                    setViewDate(d);
                  }} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--bg-inset)] flex items-center justify-center text-muted hover:text-[var(--text-primary)] transition-colors">
                    <ChevronRight className="rotate-180 w-3.5 h-3.5" />
                  </button>
                  <div className="text-center min-w-[90px] md:min-w-[120px]">
                    <p className="text-[10px] font-black text-[var(--accent)] leading-tight">
                      {zoomLevel === 'month' 
                        ? viewDate.toLocaleDateString('th-TH', { month: 'short', year: 'numeric' })
                        : viewDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <button onClick={() => {
                    const d = new Date(viewDate);
                    if (zoomLevel === 'month') d.setMonth(d.getMonth() + 1);
                    else d.setDate(d.getDate() + 1);
                    setViewDate(d);
                  }} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[var(--bg-inset)] flex items-center justify-center text-muted hover:text-[var(--text-primary)] transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
               </div>
            </div>

            {/* Timeline Scrollable Area with Fixed Column */}
            <div className="flex-1 overflow-hidden flex flex-col relative h-[500px] md:h-[600px] bg-[var(--bg-inset)]/20">
               {/* 2-Tier Gantt Header */}
               <div className="flex flex-col border-b border-[var(--border)] bg-[var(--bg-surface)] sticky top-0 z-20 shadow-sm">
                  {/* Tier 1: Month/Year */}
                  <div className="flex border-b border-[var(--border)]/50">
                    <div className="w-[120px] md:w-[180px] shrink-0 p-2.5 border-r border-[var(--border)] bg-slate-50 dark:bg-slate-900 sticky left-0 z-30 flex items-center">
                       <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">STAFF LIST</span>
                    </div>
                    <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-center py-1.5">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                          {viewDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
                       </span>
                    </div>
                  </div>
                  
                  {/* Tier 2: Hours/Days */}
                  <div className="flex">
                    <div className="w-[120px] md:w-[180px] shrink-0 border-r border-[var(--border)] bg-[var(--bg-surface)] sticky left-0 z-30" />
                    <div className="flex-1 overflow-x-hidden">
                      <div className="flex h-8 bg-white/40 dark:bg-black/10">
                        {zoomLevel === 'day' ? (
                          Array.from({ length: 24 }, (_, i) => (
                            <div key={i} className="flex-1 min-w-[40px] md:min-w-[60px] flex items-center justify-center border-r border-[var(--border)]/20">
                               <span className="text-[8px] font-black text-slate-400">{i}</span>
                            </div>
                          ))
                        ) : (
                          Array.from({ length: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                            const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
                            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                            return (
                              <div key={i} className={`flex-1 min-w-[30px] md:min-w-[40px] flex items-center justify-center border-r border-[var(--border)]/20 ${isWeekend ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}>
                                 <span className={`text-[8px] font-black ${isWeekend ? 'text-rose-500' : 'text-slate-400'}`}>{i + 1}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
               </div>

               {/* Scrollable Content */}
               <div className="flex-1 overflow-auto custom-scrollbar relative bg-gantt-grid">
                  {timelineData.length === 0 && loading ? (
                    <div className="flex items-center justify-center h-full opacity-30 text-[11px] font-bold uppercase tracking-widest">Initial Loading...</div>
                  ) : timelineData.map(user => {
                    const isActive = user.groups.some(g => !g.end);
                    const noActivity = user.groups.length === 0;

                    return (
                      <div key={user.id} className={`flex border-b border-[var(--border)]/30 group transition-colors min-h-[60px] ${noActivity ? 'bg-slate-50/20 dark:bg-slate-900/10' : ''}`}>
                         {/* Fixed Left Column */}
                         <div className="w-[120px] md:w-[180px] shrink-0 p-2 border-r border-[var(--border)] bg-[var(--bg-surface)] sticky left-0 z-10 flex items-center gap-2 md:gap-3 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg ${isActive ? 'bg-emerald-100 dark:bg-emerald-950/30' : 'bg-slate-100 dark:bg-slate-800'} flex items-center justify-center font-black text-[9px] md:text-[10px] shrink-0`}>
                               {user.image ? (
                                 <img src={user.image} className="w-full h-full rounded-lg object-cover" alt="" />
                               ) : (
                                 <span className={isActive ? 'text-emerald-600' : 'text-slate-400'}>{user.name.charAt(0)}</span>
                               )}
                            </div>
                            <div className="min-w-0 flex-1">
                               <p className="text-[10px] md:text-[11px] font-black truncate text-slate-700 dark:text-slate-200">{user.name}</p>
                               <div className="flex items-center gap-1 mt-0.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                  <span className="text-[7px] md:text-[8px] font-bold opacity-30 uppercase truncate">{isActive ? 'Clocked In' : (noActivity ? 'No Records' : 'Off duty')}</span>
                               </div>
                            </div>
                         </div>
                         
                         {/* Timeline Tracks */}
                         <div className="flex-1 relative overflow-hidden">
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

                               return (
                                 <motion.div
                                   key={idx}
                                   initial={{ opacity: 0, scaleX: 0 }}
                                   animate={{ opacity: 1, scaleX: 1 }}
                                   className="absolute top-1/2 -translate-y-1/2 h-3 md:h-4 rounded-full flex items-center px-0.5 shadow-sm overflow-hidden"
                                   style={{ 
                                     left: `${Math.max(0, left)}%`, 
                                     width: `${Math.max(1, width)}%`, 
                                     background: isLive ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                                     transformOrigin: 'left center'
                                   }}
                                 >
                                    <div className="w-2 h-2 rounded-full bg-white shrink-0 mx-0.5" />
                                    <span className="text-[6px] md:text-[7px] font-black text-white px-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                       {group.start.getHours()}:{group.start.getMinutes().toString().padStart(2,'0')}
                                    </span>
                                 </motion.div>
                               );
                            })}
                         </div>

                         {/* Status Icon */}
                         <div className="w-[50px] md:w-[70px] shrink-0 flex items-center justify-center border-l border-[var(--border)]/20 bg-white/10 dark:bg-black/5">
                            {isActive ? (
                               <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-sm">
                                  <TrendingUp className="w-3 md:w-3.5 h-3 md:h-3.5" />
                               </div>
                            ) : (
                               noActivity ? (
                                 <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-rose-500/5 flex items-center justify-center text-rose-300 opacity-60">
                                    <Activity className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                 </div>
                               ) : (
                                 <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Clock className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                 </div>
                               )
                            )}
                         </div>
                      </div>
                    );
                  })}
                  {!loading && timelineData.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 text-center p-10">
                       <Users className="w-12 h-12 mb-4 opacity-10" />
                       <p className="text-[12px] font-black uppercase tracking-widest">No Leaders Found</p>
                       <p className="text-[10px] font-bold mt-2">Add leaders in management to start monitoring</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav role="admin" />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        
        .bg-gantt-grid {
          background-image: 
            linear-gradient(var(--border) 1px, transparent 1px),
            linear-gradient(90deg, var(--border) 1px, transparent 1px);
          background-size: 100% 60px, ${zoomLevel === 'day' ? 'calc(100% / 24)' : `calc(100% / ${new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()})`} 100%;
          background-position: 0 -1px, -1px 0;
          opacity: 0.15;
        }
      `}</style>
    </div>
  );
}

