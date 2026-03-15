'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Users, TrendingUp, Activity, ChevronRight, History as HistoryIcon, Calendar, User, Search } from 'lucide-react';
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
  const [filterBranch, setFilterBranch] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?date=${today}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  usePusher('users', [{ event: 'leader-attendance', callback: fetchRecords }], true);

  // Process data for Timeline
  const timelineData = useMemo(() => {
    const userMap = new Map<string, { name: string; image?: string; groups: { start: Date; end: Date | null }[] }>();
    
    // Sort chronological for processing
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

    return Array.from(userMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [records, searchQuery]);

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
          <div className="card-neo overflow-hidden flex flex-col min-h-[500px]">
            {/* Timeline Tools */}
            <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
               <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted opacity-30" />
                  <input 
                    type="text" 
                    placeholder="ค้นหาชื่อ Leader..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] text-xs font-bold outline-none focus:border-[var(--accent)] transition-all"
                  />
               </div>
               <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Live Status
                  </div>
               </div>
            </div>

            {/* Timeline Scrollable Area */}
            <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
               <div className="min-w-[1200px] h-full p-4">
                  {/* Timeline Header (Hours) */}
                  <div className="flex items-center border-b border-[var(--border)] mb-4 pb-2">
                     <div className="w-[180px] shrink-0" />
                     <div className="flex-1 flex justify-between px-2">
                        {hours.map(h => (
                          <div key={h} className="text-[9px] font-black opacity-30 w-0 flex justify-center">
                             {(h % 4 === 0 || h === 24) && <span>{h.toString().padStart(2, '0')}:00</span>}
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* User Rows */}
                  <div className="space-y-4">
                     {timelineData.length === 0 ? (
                       <div className="py-20 text-center opacity-20">
                          <Users className="w-10 h-10 mx-auto mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest">No Leader Activity Found</p>
                       </div>
                     ) : (
                       timelineData.map(user => (
                         <div key={user.id} className="flex items-center group">
                            {/* User Profile Info */}
                            <div className="w-[180px] shrink-0 flex items-center gap-3">
                               <UserAvatar imageUrl={user.image} displayName={user.name} size="sm" />
                               <div className="min-w-0">
                                  <p className="text-[11px] font-black truncate leading-tight">{user.name}</p>
                                  <p className="text-[8px] font-bold text-muted uppercase tracking-tighter">Leader</p>
                               </div>
                            </div>

                            {/* Timeline Bar Area */}
                            <div className="flex-1 h-10 relative bg-[var(--bg-inset)] rounded-xl group-hover:bg-[var(--bg-surface)] transition-all border border-transparent group-hover:border-[var(--border)]">
                               {/* Hour Grids */}
                               <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-[0.03]">
                                  {hours.map(h => <div key={h} className="w-[1px] h-full bg-black dark:bg-white" />)}
                               </div>

                               {/* Dynamic Segments */}
                               {user.groups.map((group, idx) => {
                                  const startH = group.start.getHours() + group.start.getMinutes() / 60;
                                  const effectiveEnd = group.end || new Date();
                                  const endH = effectiveEnd.getHours() + effectiveEnd.getMinutes() / 60;
                                  
                                  const left = (startH / 24) * 100;
                                  const width = ((endH - startH) / 24) * 100;
                                  
                                  const isLive = !group.end;

                                  return (
                                    <motion.div
                                      key={idx}
                                      initial={{ scaleX: 0 }}
                                      animate={{ scaleX: 1 }}
                                      className="absolute top-1/2 -translate-y-1/2 h-4 rounded-full flex items-center"
                                      style={{ 
                                        left: `${left}%`, 
                                        width: `${width}%`, 
                                        background: isLive ? 'linear-gradient(90deg, var(--emerald), #10b981)' : 'var(--border)',
                                        opacity: isLive ? 1 : 0.4,
                                        transformOrigin: 'left',
                                        boxShadow: isLive ? '0 0 15px var(--emerald-glow)' : 'none'
                                      }}
                                    >
                                       {/* Connection Visuals */}
                                       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white border border-emerald-500 z-10" />
                                       {!isLive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-400 border border-white z-10" />}
                                       
                                       {/* Range Label */}
                                       {width > 2 && (
                                         <span className={`text-[7px] font-black uppercase text-white px-2 tracking-tighter ${isLive ? 'opacity-100' : 'opacity-0'}`}>
                                            {group.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} 
                                            {group.end ? ` - ${group.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ' [LIVE]'}
                                         </span>
                                       )}
                                    </motion.div>
                                  );
                               })}
                            </div>
                         </div>
                       ))
                     )}
                  </div>
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
        :root { --emerald: #10b981; --emerald-glow: rgba(16, 185, 129, 0.4); }
      `}</style>
    </div>
  );
}
