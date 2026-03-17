'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Send, Zap, User } from 'lucide-react';
import Image from 'next/image';
import SlideButton from './SlideButton';
import type { AttendanceUser } from '@/app/leader/attendance/_lib/attendanceClient';

interface ClockCardProps {
  user: AttendanceUser | null;
  isClockedIn: boolean;
  onClockIn: () => Promise<void>;
  onClockOut: () => Promise<void>;
  onOffsiteRequest: () => void;
  distance: string;
  isInRange: boolean;
  loading: boolean;
  lastType: 'in' | 'out' | null;
}

export function ClockCard({ 
  user, isClockedIn,
  onClockIn, onClockOut, onOffsiteRequest, 
  distance, isInRange, loading, lastType 
}: ClockCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = currentTime.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <div className="group relative">
      {/* OUTER GLOW EFFECT */}
      <div className={`absolute -inset-1 rounded-[40px] opacity-20 blur-xl transition-all duration-1000 ${
        isClockedIn ? 'bg-emerald-500/30' : 'bg-indigo-500/20'
      }`} />
      
      <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[38px] overflow-hidden shadow-3xl">
        {/* TOP INFO BAR */}
        <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center overflow-hidden">
                {user?.lineProfileImage ? (
                  <Image
                    src={user.lineProfileImage}
                    alt={user.name || user.lineDisplayName || 'Profile image'}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <User className="w-5 h-5 text-indigo-400" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-tight text-white uppercase italic truncate max-w-[120px]">
                  {user?.name || 'Loading...'}
                </span>
                <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">Node-Link Active</span>
              </div>
           </div>

           <div className="flex flex-col items-end">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                isInRange ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${isInRange ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-500 animate-pulse'}`} />
                 <span className="text-[9px] font-black uppercase tracking-widest">{isInRange ? 'In Area' : 'Outside'}</span>
              </div>
              <span className="text-[9px] font-black opacity-30 tabular-nums mt-1">{distance}</span>
           </div>
        </div>

        {/* TIME & MAIN DISPLAY */}
        <div className="p-8 pt-6 pb-8 space-y-8">
           <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 mb-2">Syncing Atomic Time</span>
              <h2 className="text-6xl font-black tracking-tighter tabular-nums text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                {timeStr.split(':')[0]}<span className="opacity-20">:</span>{timeStr.split(':')[1]}
                <span className="text-2xl opacity-10 font-bold -translate-y-4 inline-block ml-1">:{timeStr.split(':')[2]}</span>
              </h2>
              <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest mt-2 drop-shadow-sm">{dateStr}</p>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="wait">
                {isInRange ? (
                  <motion.div
                    key="slider"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <SlideButton 
                      onSuccess={async () => {
                        if (isClockedIn) await onClockOut();
                        else await onClockIn();
                      }}
                      isLoading={loading}
                      lastType={lastType}
                      isInRange={true}
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key="offsite"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={onOffsiteRequest}
                    className="w-full h-16 rounded-[24px] bg-white text-black flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-in-out" />
                    <Send className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Request Off-site Access</span>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-center gap-6 opacity-20">
                 <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Real-time</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Geo-Fenced</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
