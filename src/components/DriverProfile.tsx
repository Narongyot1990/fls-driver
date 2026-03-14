"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  User as UserIcon, Calendar, Award, Star, 
  MapPin, Phone, Shield, Zap, TrendingUp, 
  MessageSquare, ChevronRight, Briefcase, 
  Umbrella, Thermometer, CheckCircle2
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

interface TaskScores {
  totalScore: number;
  totalQuestions: number;
  overallPercentage: number;
  completedTasks: number;
  knowledgeLevel: string;
  knowledgeLevelTh: string;
  levelColor: string;
}

interface DriverProfileProps {
  user: ProfileUserData;
  isMe?: boolean;
  onEditClick?: () => void;
}

const BentoCard = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

export default function DriverProfile({ user, isMe = true, onEditClick }: DriverProfileProps) {
  const [mounted, setMounted] = useState(false);
  const [taskScores, setTaskScores] = useState<TaskScores | null>(null);
  const [loadingScores, setLoadingScores] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchScores = async () => {
      const userId = user.id || user._id;
      if (!userId) return;
      setLoadingScores(true);
      try {
        const res = await fetch(`/api/tasks/scores?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setTaskScores(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch task scores", err);
      } finally {
        setLoadingScores(false);
      }
    };
    fetchScores();
  }, [user.id, user._id]);

  if (!mounted) return null;

  const displayName = user.name && user.surname 
    ? `${user.name} ${user.surname}` 
    : user.lineDisplayName || 'Driver';
  
  const tier = normalizePerformanceTier(user.performanceTier);
  const tierConfig = PERFORMANCE_TIER_CONFIG[tier];
  
  const tierTheme = {
    standard: { primary: "slate", gradient: "from-slate-400 to-slate-600", accent: "#94a3b8" },
    bronze: { primary: "amber", gradient: "from-amber-500 to-amber-700", accent: "#f59e0b" },
    silver: { primary: "slate", gradient: "from-slate-300 to-slate-500", accent: "#cbd5e1" },
    gold: { primary: "yellow", gradient: "from-yellow-400 to-yellow-600", accent: "#fbbf24" },
    platinum: { primary: "violet", gradient: "from-violet-400 to-violet-600", accent: "#a78bfa" },
  }[tier];

  const colorMap: Record<string, string> = {
    slate: 'text-slate-400',
    amber: 'text-amber-500',
    yellow: 'text-yellow-400',
    violet: 'text-violet-400'
  };

  const glowMap: Record<string, string> = {
    slate: 'bg-slate-400/5',
    amber: 'bg-amber-500/5',
    yellow: 'bg-yellow-400/5',
    violet: 'bg-violet-400/5'
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-3 md:p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-[500px] h-[500px] ${glowMap[tierTheme.primary]} rounded-full blur-[120px] opacity-50`} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] opacity-30" />
      </div>

      <div className="max-w-2xl mx-auto relative z-10 pt-4">
        
        {/* Extreme Compact Header */}
        <div className="flex items-center gap-5 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative shrink-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${tierTheme.gradient} rounded-full blur-xl opacity-20`} />
            <div className="relative w-20 h-20 rounded-[28px] overflow-hidden border border-white/10 p-0.5 bg-[#121214]">
              {user.lineProfileImage ? (
                <img src={user.lineProfileImage} alt={displayName} className="w-full h-full object-cover rounded-[26px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-[26px]">
                  <UserIcon className="w-10 h-10 text-white/10" />
                </div>
              )}
            </div>
            {/* Tier Badge overlapping avatar */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`absolute -bottom-2 -right-2 px-2.5 py-1 rounded-lg border border-white/10 bg-[#121214] shadow-2xl flex items-center gap-1.5`}
            >
              <Award className={`w-3 h-3 ${colorMap[tierTheme.primary]}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${colorMap[tierTheme.primary]}`}>{tier}</span>
            </motion.div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${user.isOnline ? 'bg-emerald-500' : 'bg-white/20'}`} />
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
                  {user.isOnline ? 'Online' : 'Offline'} • {user.branch || 'No Branch'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1 truncate">
                {displayName}
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">ID: {user.employeeId || '---'}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                  {user.status === 'active' ? 'Approved' : 'Pending'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons - Moved up for accessibility */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <motion.button 
            whileTap={{ scale: 0.97 }}
            onClick={onEditClick}
            className="h-11 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-wider hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
          >
            Edit Profile
          </motion.button>
          <motion.button 
            whileTap={{ scale: 0.97 }}
            className="h-11 rounded-2xl bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-wider hover:bg-white/10 transition-all"
          >
            Support
          </motion.button>
        </div>

        {/* Bento Grid - Compacted */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Real Quiz Scores */}
          <BentoCard className="p-5 flex flex-col justify-between" delay={0.1}>
            <div className="flex items-center justify-between mb-3">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Testing</span>
            </div>
            {loadingScores ? (
              <div className="py-4"><div className="w-5 h-5 border-2 border-white/10 border-t-emerald-400 rounded-full animate-spin" /></div>
            ) : (
              <div>
                <div className="text-3xl font-black tracking-tighter mb-1 text-emerald-400">
                  {taskScores?.overallPercentage || 0}<span className="text-lg opacity-50">%</span>
                </div>
                <p className="text-[11px] font-bold text-white/60 uppercase">{taskScores?.knowledgeLevelTh || 'กำลังประเมิน'}</p>
              </div>
            )}
            <div className="text-[9px] text-white/20 font-bold border-t border-white/5 pt-3 mt-4 flex items-center justify-between">
              <span>Quiz Impact</span>
              <TrendingUp className="w-3 h-3" />
            </div>
          </BentoCard>

          {/* Ranking Card */}
          <BentoCard className="p-5 flex flex-col justify-between" delay={0.2}>
            <div className="flex items-center justify-between mb-3">
              <Shield className="w-4 h-4 text-white/40" />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Ranking</span>
            </div>
            <div>
              <div className="text-3xl font-black tracking-tighter mb-1">
                Lvl <span className="text-white/40">{user.performanceLevel || 1}</span>
              </div>
              <p className="text-[11px] font-bold text-white/60 uppercase">System Rank</p>
            </div>
            <div className="text-[9px] text-white/20 font-bold border-t border-white/5 pt-3 mt-4">
              {user.performancePoints || 0} Efficiency pts
            </div>
          </BentoCard>

          {/* Leave Balance - Wide */}
          <BentoCard className="col-span-2 p-5" delay={0.3}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Leave Balance</h4>
              <Calendar className="w-4 h-4 text-white/20" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Vacation', val: user.vacationDays, icon: Umbrella, color: 'text-sky-400' },
                { label: 'Sick', val: user.sickDays, icon: Thermometer, color: 'text-rose-400' },
                { label: 'Personal', val: user.personalDays, icon: Briefcase, color: 'text-indigo-400' }
              ].map((q) => (
                <div key={q.label} className="text-center py-3 rounded-2xl bg-white/[0.02] border border-white/5">
                  <q.icon className={`w-4 h-4 mx-auto mb-2 ${q.color}`} />
                  <div className="text-lg font-black leading-none">{q.val || 0}</div>
                  <div className="text-[9px] font-bold text-white/30 uppercase mt-1.5">{q.label}</div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Tasks Completed */}
          <BentoCard className="col-span-2 p-5 flex items-center gap-5" delay={0.4}>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              <CheckCircle2 className="w-6 h-6 text-emerald-500/80" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Modules Completed</p>
              <h4 className="text-xl font-black truncate">{taskScores?.completedTasks || 0} <span className="text-sm font-bold text-white/40">Modules</span></h4>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-[10px] font-black text-emerald-500">+12%</div>
              <div className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">This month</div>
            </div>
          </BentoCard>

          {/* Contact Support Info */}
          <BentoCard className="col-span-2 p-5" delay={0.5}>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                  <Phone className="w-4 h-4 text-white/30" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest leading-none mb-1">Phone</p>
                  <p className="text-xs font-black truncate">{user.phone || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-emerald-400/40 uppercase tracking-widest leading-none mb-1">LINE</p>
                  <p className="text-xs font-black truncate text-emerald-400">@{user.lineDisplayName || 'N/A'}</p>
                </div>
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-12 text-center pb-12">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
              ITL Logistics Driver Network • V2.6.0
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
