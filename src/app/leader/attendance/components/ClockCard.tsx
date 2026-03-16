'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, LocateFixed, MessageSquare, CheckCircle2, Briefcase } from 'lucide-react';

import SlideButton from './SlideButton';

interface ClockCardProps {
  timeStr: string;
  dateStr: string;
  displayDistance: string;
  isInRange: boolean;
  isClockedIn: boolean;
  isClockedOut: boolean;
  lastRecordType: 'in' | 'out';
  actionLoading: boolean;
  locLoading: boolean;
  onClockAction: (type: 'in' | 'out') => void;
  onRefreshLocation: () => void;
  onRequestCorrection: (type: 'in' | 'out') => void;
}

export function ClockCard({ 
  timeStr, dateStr, displayDistance, isInRange, 
  isClockedIn, isClockedOut, lastRecordType,
  actionLoading, locLoading, onClockAction, 
  onRefreshLocation, onRequestCorrection 
}: ClockCardProps) {
  return (
    <div className="card bg-[var(--bg-surface)] border-[var(--border)] rounded-[40px] shadow-2xl overflow-hidden relative group">
      {/* Dynamic Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] opacity-20 transition-colors duration-1000 ${isClockedIn ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      
      <div className="relative p-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[var(--bg-inset)] border border-[var(--border)]">
          <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{dateStr}</span>
        </div>

        <motion.h2 
          key={timeStr}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-6xl font-black tracking-tighter mb-2 tabular-nums"
        >
          {timeStr}
        </motion.h2>
        
        <div className="flex items-center gap-3 mb-10">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
            isInRange 
              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
          }`}>
            <MapPin className="w-3.5 h-3.5" />
            {isInRange ? 'In Range' : 'Out of Range'}
          </div>
          <div className="px-3 py-1 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest opacity-40">
            {displayDistance}
          </div>
          <button 
            onClick={onRefreshLocation}
            disabled={locLoading || actionLoading}
            className={`w-8 h-8 rounded-lg bg-[var(--bg-inset)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--bg-surface)] transition-all active:scale-90 ${locLoading ? 'animate-spin opacity-40' : ''}`}
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full flex flex-col items-center gap-6">
          <AnimatePresence mode="wait">
            {isClockedOut ? (
              <motion.div 
                key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-2 pt-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Shift Completed</p>
              </motion.div>
            ) : isInRange ? (
              <motion.div 
                key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full"
              >
                {lastRecordType === 'out' ? (
                  <SlideButton type="in" onSuccess={() => onClockAction('in')} disabled={actionLoading} />
                ) : (
                  <SlideButton type="out" onSuccess={() => onClockAction('out')} disabled={actionLoading} isClockedIn={true} />
                )}
              </motion.div>
            ) : (
              <motion.button
                key="offsite" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRequestCorrection(lastRecordType === 'out' ? 'in' : 'out')}
                className="w-full h-[64px] rounded-full bg-violet-600 text-white flex items-center justify-center gap-3 shadow-xl shadow-violet-500/20"
              >
                <Briefcase className="w-5 h-5" />
                <span className="text-[12px] font-black uppercase tracking-[0.2em]">Request Off-site Log</span>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => onRequestCorrection('in')}
              className="flex items-center gap-2 group/btn"
            >
              <MessageSquare className="w-4 h-4 opacity-20 group-hover/btn:opacity-100 transition-opacity" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-30 group-hover/btn:opacity-60">Manual Correction</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
