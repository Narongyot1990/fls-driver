"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User as UserIcon, Calendar, Award, Star, 
  MapPin, Phone, Shield, Zap, TrendingUp, 
  MessageSquare, ChevronRight, Briefcase, 
  Umbrella, Thermometer
} from "lucide-react";
import { normalizePerformanceTier, PERFORMANCE_TIER_CONFIG, PerformanceTier } from "@/lib/profile-tier";

interface ProfileUserData {
  id?: string;
  _id?: string;
  lineDisplayName?: string;
  lineProfileImage?: string;
  performanceTier?: string;
  performancePoints?: number;
  performanceLevel?: number;
  name?: string;
  surname?: string;
  phone?: string;
  employeeId?: string;
  branch?: string;
  status?: string;
  vacationDays?: number;
  sickDays?: number;
  personalDays?: number;
  approvedCount?: number;
  lastSeen?: string;
  isOnline?: boolean;
}

interface DriverProfileProps {
  user: ProfileUserData;
  isMe?: boolean;
  onEditClick?: () => void;
}

const BentoCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl ${className}`}
  >
    {children}
  </motion.div>
);

export default function DriverProfile({ user, isMe = true, onEditClick }: DriverProfileProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const displayName = user.name && user.surname 
    ? `${user.name} ${user.surname}` 
    : user.lineDisplayName || 'Driver';
  
  const tier = normalizePerformanceTier(user.performanceTier);
  const tierConfig = PERFORMANCE_TIER_CONFIG[tier];
  
  const tierTheme = {
    standard: { primary: "slate", gradient: "from-slate-400 to-slate-600" },
    bronze: { primary: "amber", gradient: "from-amber-500 to-amber-700" },
    silver: { primary: "slate", gradient: "from-slate-300 to-slate-500" },
    gold: { primary: "yellow", gradient: "from-yellow-400 to-yellow-600" },
    platinum: { primary: "violet", gradient: "from-violet-400 to-violet-600" },
  }[tier];

  // Manual color map for fixed classes
  const colorMap: Record<string, string> = {
    slate: 'text-slate-400',
    amber: 'text-amber-500',
    yellow: 'text-yellow-400',
    violet: 'text-violet-400'
  };

  const bgMap: Record<string, string> = {
    slate: 'bg-slate-500/10',
    amber: 'bg-amber-500/10',
    yellow: 'bg-yellow-400/10',
    violet: 'bg-violet-400/10'
  };

  const glowMap: Record<string, string> = {
    slate: 'bg-slate-400/20',
    amber: 'bg-amber-500/20',
    yellow: 'bg-yellow-400/20',
    violet: 'bg-violet-400/20'
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 md:p-8 font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 ${glowMap[tierTheme.primary]} rounded-full blur-[120px]`} />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8 mt-4">
          <motion.div 
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative group"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${tierTheme.gradient} rounded-[40px] blur-xl opacity-40 group-hover:opacity-60 transition-opacity`} />
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[40px] overflow-hidden border-2 border-white/20 p-1 bg-[#151518]">
              {user.lineProfileImage ? (
                <img 
                  src={user.lineProfileImage} 
                  alt={displayName} 
                  className="w-full h-full object-cover rounded-[36px]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-[36px]">
                  <UserIcon className="w-16 h-16 text-white/20" />
                </div>
              )}
            </div>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
              className={`absolute -bottom-2 -right-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-2xl border border-white/10 ${
                user.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
              }`}
            >
              {user.status === 'active' ? 'Online' : 'Pending'}
            </motion.div>
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold bg-white/5 border border-white/10 ${colorMap[tierTheme.primary]} uppercase tracking-widest`}>
                  {tier.toUpperCase()} DRIVER
                </span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">
                  ID: {user.employeeId || 'NO-ID'}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-1 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                {displayName}
              </h1>
              <p className="text-white/40 font-medium flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-4 h-4" />
                Branch {user.branch || 'N/A'}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <BentoCard className="col-span-2 row-span-2 p-8 flex flex-col justify-between group" delay={0.3}>
            <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${tierTheme.gradient} opacity-10 blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-700`} />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-4 rounded-3xl bg-gradient-to-br ${tierTheme.gradient} shadow-lg shadow-black/40`}>
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{tierConfig.label}</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Performance Tier</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Exp Points</span>
                  <span className="text-xl font-black">{user.performancePoints || 0} <span className="text-xs font-medium text-white/20">/ 2500</span></span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(((user.performancePoints || 0) / 2500) * 100, 100)}%` }}
                    transition={{ duration: 1.5, ease: "circOut", delay: 1 }}
                    className={`h-full bg-gradient-to-r ${tierTheme.gradient}`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-[#121214] bg-white/5 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-500" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-4 border-[#121214] bg-white/5 flex items-center justify-center text-[10px] font-black">
                  +12
                </div>
              </div>
              <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/40 hover:text-white transition-colors">
                View Badges <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </BentoCard>

          <BentoCard className="flex flex-col items-center justify-center p-6 text-center group" delay={0.4}>
            <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-cyan-400" />
              </div>
              <h4 className="text-3xl font-black tracking-tighter">{user.performanceLevel || 1}</h4>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Current Level</p>
            </div>
          </BentoCard>

          <BentoCard className="flex flex-col items-center justify-center p-6 text-center group" delay={0.5}>
            <div className="absolute inset-0 bg-white/[0.02] group-hover:bg-white/[0.05] transition-colors" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-3xl font-black tracking-tighter">100%</h4>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Safety Rate</p>
            </div>
          </BentoCard>

          <BentoCard className="col-span-2 p-6" delay={0.6}>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center gap-2">
              <Calendar className="w-3 h-3" /> Leave Quotas
            </h4>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-sky-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Umbrella className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-xl font-black">{user.vacationDays || 0}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Vacation</div>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Thermometer className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-xl font-black">{user.sickDays || 0}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Sick</div>
              </div>
              <div className="text-center group">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-xl font-black">{user.personalDays || 0}</div>
                <div className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Personal</div>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="col-span-2 p-6 flex items-center justify-between group" delay={0.7}>
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/5">
                  <Phone className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Phone Number</p>
                  <p className="text-lg font-black tracking-tight">{user.phone || 'NO PHONE'}</p>
                </div>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/5">
                  <MessageSquare className="w-5 h-5 text-white/40" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">LINE Display Name</p>
                  <p className="text-lg font-black tracking-tight text-emerald-400">@{user.lineDisplayName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="col-span-2 p-6 flex flex-col justify-center" delay={0.8}>
             <button 
              onClick={onEditClick}
              className="w-full py-4 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-white/90 transition-all transform active:scale-95 flex items-center justify-center gap-2 mb-3"
            >
              Edit My Profile
            </button>
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-tighter hover:bg-white/10 transition-all transform active:scale-95">
              Support Center
            </button>
          </BentoCard>

        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center pb-8"
        >
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">
            ITL Logistics Driver Network • Version 2.4.0
          </p>
        </motion.div>

      </div>
    </div>
  );
}
