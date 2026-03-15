'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, AlertCircle, ChevronRight, History as HistoryIcon, Navigation as NavIcon, LocateFixed, LogOut, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/components/Toast';
import { formatRelativeTime } from '@/lib/date-utils';

const BranchMap = dynamic(() => import('@/components/BranchMap'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-inset animate-pulse rounded-2xl flex items-center justify-center text-xs text-muted">Loading Map...</div>
});

export default function AttendancePage() {
  const router = useRouter();
  const { branches } = useBranches();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [branchRadius, setBranchRadius] = useState(50);
  const [branchLocation, setBranchLocation] = useState<any>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
        } else {
          router.push('/leader/login');
        }
      } catch {
        router.push('/leader/login');
      }
    };
    fetchMe();
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?date=${today}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.records);
      }
    } catch (err) {
      console.error(err);
    }
  }, [showToast]);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user]);

  // Haversine on client for UI feedback
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('error', 'Browser ของคุณไม่รองรับการระบุตำแหน่ง');
      return;
    }

    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
        
        // Find assigned branch or default to AYA if none
        const targetBranchCode = user?.branch || 'AYA';
        const currentBranch = branches.find(b => b.code === targetBranchCode);
        
        if (currentBranch?.location) {
          const dist = calculateDistance(coords.lat, coords.lon, currentBranch.location.lat, currentBranch.location.lon);
          setDistance(dist);
          setBranchLocation(currentBranch.location);
          setBranchRadius(currentBranch.radius || 50);
        }
        setLocLoading(false);
      },
      (err) => {
        console.error(err);
        showToast('error', 'ไม่สามารถเข้าถึงตำแหน่งของคุณได้ กรุณาอนุญาตการเข้าถึงตำแหน่ง');
        setLocLoading(false);
      },
      { enableHighAccuracy: true }
    );
  }, [branches, showToast]);

  useEffect(() => {
    if (branches.length > 0) {
      updateLocation();
    }
  }, [branches, updateLocation]);

  const handleClockAction = async (type: 'in' | 'out') => {
    const limit = branchRadius + 5;
    if (!location || distance === null) {
      showToast('notification', 'กรุณารอการระบุตำแหน่งปัจจุบัน');
      return;
    }

    if (distance > limit) {
      showToast('error', `คุณอยู่นอกพื้นที่ (ระยะห่าง ${Math.round(distance)}ม.)`);
      return;
    }

    setActionLoading(true);
    try {
      const targetBranchCode = user?.branch || 'AYA';
      const currentBranch = branches.find(b => b.code === targetBranchCode);
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          location,
          branchCode: targetBranchCode,
          branchLocation: currentBranch?.location,
          radius: branchRadius
        })
      });
      const data = await res.json();
      if (data.success) {
        showToast('success', `บันทึก ${type === 'in' ? 'ลงเวลาเข้า' : 'ลงเวลาออก'} สำเร็จ`);
        fetchRecords();
      } else {
        showToast('error', data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      showToast('error', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
    
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'ลบรายการสำเร็จ');
        fetchRecords();
      } else {
        showToast('error', data.error || 'ลบไม่สำเร็จ');
      }
    } catch (err) {
      showToast('error', 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  const isClockedIn = records.some(r => r.type === 'in');
  const isClockedOut = records.some(r => r.type === 'out');
  const canClockIn = !isClockedIn && !isClockedOut;
  const canClockOut = isClockedIn && !isClockedOut;

  const isInRange = distance !== null && distance <= (branchRadius + 5);

  const getStatusInfo = () => {
    if (isClockedOut) return { label: 'จบงานแล้ว', sub: 'บันทึกเวลาเรียบร้อย', color: 'slate' };
    if (isClockedIn) return { label: 'กำลังทำงาน', sub: 'อยู่ระหว่างปฏิบัติงาน', color: 'emerald' };
    return { label: 'ยังไม่เข้างาน', sub: 'รอลงเวลาเข้างาน', color: 'amber' };
  };

  const status = getStatusInfo();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="leader" />
      <div className="lg:pl-[240px] pb-[72px] lg:pb-6">
        <PageHeader title="ลงเวลาทำงาน" subtitle="บันทึกเวลาเข้า-ออกงานด้วย GPS" backHref="/leader/home" />

        <div className="px-4 lg:px-8 py-3">
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* Main Status Bento Card */}
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               className="card p-5 overflow-hidden relative"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 opacity-10 transition-colors bg-${status.color}-500`} />
              
              <div className="flex flex-col items-center text-center space-y-5">
                
                {/* Status Badge */}
                <div className="flex flex-col items-center">
                   <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2 border bg-${status.color}-500/10 text-${status.color}-500 border-${status.color}-500/20`}>
                      <span className={`w-2 h-2 rounded-full bg-${status.color}-500 ${isClockedIn && !isClockedOut ? 'animate-pulse' : ''}`} />
                      {status.label}
                   </div>
                   <p className="text-[10px] font-bold text-muted uppercase tracking-tighter opacity-70">
                      {status.sub}
                   </p>
                </div>

                {/* Real-time Map */}
                <div className="w-full h-[200px] rounded-2xl overflow-hidden border border-border/50 shadow-inner relative group">
                  {branchLocation && (
                    <BranchMap 
                      center={branchLocation}
                      radius={branchRadius}
                      userLocation={location}
                      userProfileImage={user?.lineProfileImage}
                      readOnly={true}
                    />
                  )}
                  {/* Map Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-white" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                           {user?.branch || '---'} {distance !== null ? `(${Math.round(distance)}ม.)` : ''}
                        </span>
                     </div>
                     <div className={`bg-white/90 dark:bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/5 font-black text-[9px] uppercase tracking-widest ${isInRange ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isInRange ? 'In Range' : 'Out of Range'}
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 w-full gap-8 py-2">
                  <div className="text-center group">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 group-hover:text-accent transition-colors">Current Time</p>
                    <p className="text-2xl font-black tabular-nums" style={{ color: 'var(--text-primary)' }}>
                      {new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="text-center group border-l border-border/30">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-1 group-hover:text-accent transition-colors">Today</p>
                    <p className="text-fluid-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Sequential Logic */}
            <div className="space-y-3">
              {canClockIn && (
                <motion.button
                  key="clock-in"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  disabled={!isInRange || actionLoading}
                  onClick={() => handleClockAction('in')}
                  className="w-full h-24 rounded-[32px] flex items-center justify-between px-8 transition-all relative overflow-hidden group shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--accent) 0%, #3B82F6 100%)',
                    color: 'white',
                    boxShadow: '0 12px 24px -8px var(--accent)'
                  }}
                >
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
                  <div className="flex items-center gap-6 z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-white/20">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xl font-black uppercase tracking-tight">Clock In</span>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">เริ่มงาน (ลงเวลาเข้า)</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 transition-all group-hover:bg-white group-hover:text-accent">
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              )}

              {canClockOut && (
                <motion.button
                  key="clock-out"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  disabled={!isInRange || actionLoading}
                  onClick={() => handleClockAction('out')}
                  className="w-full h-24 rounded-[32px] flex items-center justify-between px-8 transition-all relative overflow-hidden group shadow-lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                    color: 'white',
                    boxShadow: '0 12px 24px -8px rgba(30, 41, 59, 0.4)'
                  }}
                >
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-25deg] group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
                  <div className="flex items-center gap-6 z-10">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 bg-white/10">
                      <LogOut className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xl font-black uppercase tracking-tight">Clock Out</span>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">เลิกงาน (ลงเวลาออก)</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border border-white/30 transition-all group-hover:bg-white group-hover:text-slate-900">
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </motion.button>
              )}

              {isClockedOut && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center bg-inset rounded-[40px] border border-dashed border-border"
                >
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-4 text-emerald-500 opacity-40 shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                  <p className="text-sm font-black text-emerald-500 uppercase tracking-tight">Shift Completed</p>
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-2 leading-relaxed">
                    คุณได้ลงเวลาปฏิบัติงานเรียบร้อยแล้วสำหรับวันนี้<br/>
                    พบกันใหม่ในกะการทำงานถัดไป
                  </p>
                </motion.div>
              )}

              {!isInRange && (canClockIn || canClockOut) && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-[11px] font-bold text-red-500/80 leading-relaxed uppercase tracking-tight">
                    คุณอยู่นอกพื้นที่สาขา ({Math.round(distance || 0)}ม.) <br/> 
                    กรุณาเข้าใกล้สาขามากกว่า {branchRadius}ม. เพื่อลงเวลา
                  </p>
                </motion.div>
              )}
            </div>

            {/* Enhanced History List */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>วันนี้ (Today)</h3>
                   {records.length > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-inset)] font-bold text-muted border border-[var(--border)]">{records.length}</span>}
                </div>
                <div className="h-[1px] flex-1 ml-4 bg-gradient-to-r from-[var(--border)] to-transparent opacity-50" />
              </div>

              <div className="space-y-2.5">
                {records.length === 0 ? (
                  <div className="p-12 text-center bg-[var(--bg-inset)] rounded-[32px] border border-dashed border-[var(--border)]">
                    <div className="w-12 h-12 rounded-full bg-border/20 flex items-center justify-center mx-auto mb-3">
                       <HistoryIcon className="w-6 h-6 opacity-30" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>ยังไม่มีประวัติวันนี้</p>
                  </div>
                ) : (
                  records.map((rec, idx) => (
                    <motion.div
                      key={rec._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="card p-4 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${rec.type === 'in' ? 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-slate-500/10 text-slate-500 group-hover:bg-slate-500 group-hover:text-white'}`}>
                          {rec.type === 'in' ? <Clock className="w-6 h-6" /> : <LogOut className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            {rec.type === 'in' ? 'ลงเวลาเข้า' : 'ลงเวลาออก'}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                             <div className="flex items-center gap-1 text-[10px] font-bold text-muted bg-[var(--bg-inset)] px-2 py-0.5 rounded-lg border border-[var(--border)]">
                                <Clock className="w-3 h-3" />
                                {new Date(rec.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                             </div>
                             <span className="text-[9px] font-black uppercase tracking-widest text-muted">{rec.branch}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                         <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1.5 inline-block ${rec.isInside ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                            {rec.isInside ? 'In Geo' : 'Out Geo'}
                         </div>
                         <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                            <p className="text-[10px] font-black text-muted transition-opacity opacity-40 group-hover:opacity-100">{Math.round(rec.distance)}m</p>
                            <button 
                              onClick={() => handleDeleteRecord(rec._id)}
                              className="p-2 hover:bg-red-500/10 rounded-xl text-red-500 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
      <BottomNav role="leader" />
    </div>
  );
}
