'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, AlertCircle, History as HistoryIcon, Navigation as NavIcon, LocateFixed, Trash2, Building2, ChevronRight, LogOut } from 'lucide-react';
import dynamic from 'next/dynamic';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import { useBranches } from '@/hooks/useBranches';
import { useToast } from '@/components/Toast';
import { MapHandle } from '@/components/BranchMap';

const BranchMap = dynamic(() => import('@/components/BranchMap'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-inset animate-pulse rounded-2xl flex items-center justify-center text-xs text-muted">Loading Map...</div>
});

export default function AttendancePage() {
  const router = useRouter();
  const { branches } = useBranches();
  const { showToast } = useToast();
  const mapRef = useRef<MapHandle>(null);
  
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
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };
    fetchMe();
  }, [router]);

  const fetchRecords = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance?date=${today}`);
      const data = await res.json();
      if (data.success) {
        // Sort descending
        const sorted = data.records.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecords(sorted.slice(0, 20));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecords();
    }
  }, [user, fetchRecords]);

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
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setLocation(coords);
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
      () => setLocLoading(false),
      { enableHighAccuracy: true }
    );
  }, [branches, user]);

  useEffect(() => {
    if (branches.length > 0) updateLocation();
  }, [branches, updateLocation]);

  const handleClockAction = async (type: 'in' | 'out') => {
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
        showToast('success', `บันทึกเวลา${type === 'in' ? 'เข้า' : 'ออก'}สำเร็จ`);
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
    if (!confirm('ยืนยันการลบ?')) return;
    try {
      const res = await fetch(`/api/attendance?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('success', 'ลบพื้นสำเร็จ');
        fetchRecords();
      }
    } catch { /* ignore */ }
  };

  const isClockedIn = records.some(r => r.type === 'in');
  const isClockedOut = records.some(r => r.type === 'out');
  const canClockIn = !isClockedIn && !isClockedOut;
  const canClockOut = isClockedIn && !isClockedOut;
  const isInRange = distance !== null && distance <= (branchRadius + 5);

  const warpTo = (target: 'user' | 'office') => {
    if (target === 'user' && location) mapRef.current?.flyTo(location.lat, location.lon);
    else if (target === 'office' && branchLocation) mapRef.current?.flyTo(branchLocation.lat, branchLocation.lon);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="leader" />
      <div className="lg:pl-[240px] pb-[72px] lg:pb-6">
        
        {/* Compact Header */}
        <header className="px-4 pt-6 pb-2 flex items-center justify-between">
           <div>
              <h1 className="text-2xl font-black tracking-tighter">ลงเวลาเข้างาน</h1>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">GPS Presence Check</p>
           </div>
           <button onClick={() => router.push('/leader/home')} className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center">
              <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100 rotate-180" />
           </button>
        </header>

        <main className="px-4 max-w-xl mx-auto space-y-3">
          
          {/* Map Area - Height Optimized */}
          <div className="relative w-full h-[180px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-xl mt-2">
            {branchLocation && (
              <BranchMap 
                ref={mapRef}
                center={branchLocation}
                radius={branchRadius}
                userLocation={location}
                userProfileImage={user?.lineProfileImage}
                readOnly={true}
              />
            )}
            
            {/* Warp Controls */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-[1000]">
               <button onClick={() => warpTo('user')} className="w-10 h-10 rounded-xl bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md flex items-center justify-center text-[var(--accent)] border border-white/20">
                  <LocateFixed className="w-5 h-5" />
               </button>
               <button onClick={() => warpTo('office')} className="w-10 h-10 rounded-xl bg-white/80 dark:bg-black/60 shadow-lg backdrop-blur-md flex items-center justify-center text-amber-500 border border-white/20">
                  <Building2 className="w-5 h-5" />
               </button>
            </div>

            {/* Distance Display - Dual Units */}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white flex items-center gap-3">
               <div>
                  <p className="text-[8px] font-black opacity-50 tracking-widest uppercase">Distance</p>
                  <p className="text-[13px] font-bold tracking-tight leading-none">
                     {distance !== null ? `${Math.round(distance)} ม.` : '---'}
                  </p>
               </div>
               <div className="w-[1px] h-4 bg-white/20" />
               <div>
                  <p className="text-[8px] font-black opacity-50 tracking-widest uppercase">KM</p>
                  <p className="text-[13px] font-bold tracking-tight leading-none">
                     {distance !== null ? `${(distance / 1000).toFixed(2)} กม.` : '---'}
                  </p>
               </div>
            </div>
          </div>

          {/* Action Area: Slide to Clock */}
          <div className="py-2">
             <AnimatePresence mode="wait">
                {canClockIn || canClockOut ? (
                  <div className="space-y-4">
                     <SlideButton 
                       type={canClockIn ? 'in' : 'out'} 
                       disabled={!isInRange || actionLoading}
                       onSuccess={() => handleClockAction(canClockIn ? 'in' : 'out')}
                       errorMsg={!isInRange ? `ห่างจากสาขาช้อ ${Math.round(distance || 0)} ม. (เกิน ${branchRadius} ม.)` : ''}
                     />
                  </div>
                ) : isClockedOut ? (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-5 text-center bg-emerald-500/5 border-dashed border-emerald-500/20">
                     <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-60" />
                     <p className="text-xs font-black uppercase text-emerald-500 tracking-widest">Shift Completed</p>
                     <p className="text-[10px] font-bold opacity-40 mt-1 uppercase">บันทึกเวลาเรียบร้อยสำหรับวันนี้</p>
                  </motion.div>
                ) : null}
             </AnimatePresence>
          </div>

          {/* New History List - Compact (Scrollable) */}
          <div className="card p-1">
             <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--bg-inset)] rounded-t-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Today's Logs (20ล่าสุด)</span>
                <HistoryIcon className="w-3 h-3 opacity-30" />
             </div>
             <div className="max-h-[148px] overflow-y-auto overflow-x-hidden p-2 space-y-2 custom-scrollbar">
                {records.length === 0 ? (
                  <div className="py-8 text-center opacity-30">
                     <p className="text-[10px] font-black uppercase tracking-widest">No Logs Yet</p>
                  </div>
                ) : (
                  records.map((rec) => (
                    <div key={rec._id} className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-inset)] border border-[var(--border)] group">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${rec.type === 'in' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                             {rec.type === 'in' ? <Clock className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-tight">{rec.type === 'in' ? 'Clock In' : 'Clock Out'}</p>
                             <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest">{new Date(rec.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                           <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${rec.isInside ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                              {rec.isInside ? 'IN GEO' : 'OUT GEO'}
                           </span>
                           <button onClick={() => handleDeleteRecord(rec._id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500/10">
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>

        </main>
      </div>
      <BottomNav role="leader" />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
      `}</style>
    </div>
  );
}

function SlideButton({ type, disabled, onSuccess, errorMsg }: any) {
  const x = useMotionValue(0);
  const maxWidth = 260; // Approximate button width - padding
  const opacity = useTransform(x, [0, maxWidth], [0.3, 1]);
  const bgColor = type === 'in' ? 'var(--accent)' : '#475569';
  const label = type === 'in' ? 'Slide to Clock In' : 'Slide to Clock Out';

  const onDragEnd = () => {
    if (x.get() > maxWidth * 0.8 && !disabled) {
      onSuccess();
      x.set(0);
    } else {
      x.set(0);
    }
  };

  return (
    <div className="space-y-3">
      {errorMsg && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
           <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
           <p className="text-[10px] font-black text-red-500 uppercase tracking-tight">{errorMsg}</p>
        </motion.div>
      )}
      <div 
        className={`relative w-full h-16 rounded-[28px] p-2 flex items-center overflow-hidden transition-all shadow-xl ${disabled ? 'opacity-40 grayscale pointer-events-none' : ''}`}
        style={{ background: 'var(--bg-inset)', border: '1px solid var(--border)' }}
      >
        <motion.div style={{ opacity }} className="absolute inset-0 flex items-center justify-center font-black text-xs uppercase tracking-[0.2em] pointer-events-none">
           {label}
        </motion.div>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
           <div className="flex gap-2">
              {[1,2,3,4].map(i => <ChevronRight key={i} className={`w-4 h-4 animate-pulse`} style={{ animationDelay: `${i*100}ms` }} />)}
           </div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxWidth }}
          onDragEnd={onDragEnd}
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing z-10"
          style={{ x, background: bgColor, color: 'white' }}
        >
          {type === 'in' ? <Clock className="w-5 h-5" /> : <LogOut className="w-5 h-5" />}
        </motion.div>
      </div>
    </div>
  );
}
