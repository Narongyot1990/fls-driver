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
    className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] backdrop-blur-md shadow-lg ${className}`}
  >
    {children}
  </motion.div>
);

const getStatusText = (user: ProfileUserData) => {
  if (!user.lastSeen) return "Offline";
  const lastSeen = new Date(user.lastSeen);
  const now = new Date();
  const diffInMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);

  if (diffInMins < 5) return "Online";
  if (diffInMins < 60) return `Active ${diffInMins}m ago`;
  if (diffInMins < 1440) return `Active ${Math.floor(diffInMins / 60)}h ago`;
  return `Active ${Math.floor(diffInMins / 1440)}d ago`;
};

const getStatusColor = (user: ProfileUserData) => {
  if (!user.lastSeen) return "bg-[var(--text-muted)]/20";
  const lastSeen = new Date(user.lastSeen);
  const now = new Date();
  const diffInMins = Math.floor((now.getTime() - lastSeen.getTime()) / 60000);
  return diffInMins < 5 ? "bg-emerald-500" : "bg-[var(--text-muted)]/40";
};

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
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-3 md:p-6 font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -left-40 w-[400px] h-[400px] ${glowMap[tierTheme.primary]} rounded-full blur-[100px] opacity-40`} />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-[80px] opacity-20" />
      </div>

      <div className="max-w-xl mx-auto relative z-10 pt-2 md:pt-4">
        
        {/* Extreme Compact Header */}
        <div className="flex items-center gap-4 mb-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="relative shrink-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-tr ${tierTheme.gradient} rounded-full blur-xl opacity-20`} />
            <div className="relative w-16 h-16 rounded-[22px] overflow-hidden border border-[var(--border)] p-0.5 bg-[var(--bg-surface)]">
              {user.lineProfileImage ? (
                <img src={user.lineProfileImage} alt={displayName} className="w-full h-full object-cover rounded-[20px]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[var(--bg-inset)] rounded-[20px]">
                  <UserIcon className="w-8 h-8 text-[var(--text-muted)]" />
                </div>
              )}
            </div>
            {/* Tier Badge overlapping avatar */}
            <motion.div 
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl flex items-center gap-1`}
            >
              <Award className={`w-2.5 h-2.5 ${colorMap[tierTheme.primary]}`} />
              <span className={`text-[8px] font-black uppercase tracking-widest ${colorMap[tierTheme.primary]}`}>{tier}</span>
            </motion.div>
          </motion.div>

          <div className="flex-1 min-w-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className={`w-1 h-1 rounded-full ${getStatusColor(user)}`} />
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">
                  {getStatusText(user)} • {user.branch || '---'}
                </span>
              </div>
              <h1 className="text-xl font-black tracking-tight mb-0.5 truncate leading-tight">
                {displayName}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">ID: {user.employeeId || '---'}</span>
                <span className="w-0.5 h-0.5 rounded-full bg-[var(--border)]" />
                <span className={`text-[9px] font-black uppercase tracking-widest ${user.status === 'active' ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
                  {user.status === 'active' ? 'Approved' : 'Pending'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Action Buttons Area - Simple separator */}
        <div className="mb-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[1px] w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
          />
        </div>

        {/* Bento Grid - densified */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Real Quiz Scores */}
          <BentoCard className="p-4 flex flex-col justify-between" delay={0.1}>
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Testing</span>
            </div>
            {loadingScores ? (
              <div className="py-2"><div className="w-4 h-4 border-2 border-[var(--border)] border-t-emerald-500 rounded-full animate-spin" /></div>
            ) : (
              <div>
                <div className="text-2xl font-black tracking-tighter mb-0.5 text-emerald-500">
                  {taskScores?.overallPercentage || 0}<span className="text-sm opacity-50 ml-0.5">%</span>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase truncate">{taskScores?.knowledgeLevelTh || 'ประเมิน...'}</p>
              </div>
            )}
            <div className="text-[8px] text-[var(--text-muted)] font-bold border-t border-[var(--border)] pt-2 mt-3 flex items-center justify-between">
              <span>Quiz Impact</span>
              <TrendingUp className="w-2.5 h-2.5" />
            </div>
          </BentoCard>

          {/* Ranking Card */}
          <BentoCard className="p-4 flex flex-col justify-between" delay={0.2}>
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">Ranking</span>
            </div>
            <div>
              <div className="text-2xl font-black tracking-tighter mb-0.5">
                Lvl <span className="text-[var(--text-muted)]">{user.performanceLevel || 1}</span>
              </div>
              <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">System Rank</p>
            </div>
            <div className="text-[8px] text-[var(--text-muted)] font-bold border-t border-[var(--border)] pt-2 mt-3">
              {user.performancePoints || 0} pts
            </div>
          </BentoCard>

          {/* Leave Balance - Dense Wide */}
          <BentoCard className="col-span-2 p-4" delay={0.3}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Leave Balance</h4>
              <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]/50" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Vacation', val: user.vacationDays, icon: Umbrella, color: 'text-sky-500' },
                { label: 'Sick', val: user.sickDays, icon: Thermometer, color: 'text-rose-500' },
                { label: 'Personal', val: user.personalDays, icon: Briefcase, color: 'text-indigo-500' }
              ].map((q) => (
                <div key={q.label} className="text-center py-2.5 rounded-xl bg-[var(--bg-inset)] border border-[var(--border)]">
                  <q.icon className={`w-3.5 h-3.5 mx-auto mb-1 ${q.color} opacity-80`} />
                  <div className="text-base font-black leading-none">{q.val || 0}</div>
                  <div className="text-[8px] font-bold text-[var(--text-muted)] uppercase mt-1">{q.label}</div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Tasks Completed */}
          <BentoCard className="col-span-2 p-4 flex items-center gap-4" delay={0.4}>
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] flex items-center justify-center shrink-0 border border-[var(--border)]">
              <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5">Modules Completed</p>
              <h4 className="text-lg font-black truncate leading-tight">{taskScores?.completedTasks || 0} <span className="text-xs font-bold text-[var(--text-muted)] uppercase ml-1">Tasks</span></h4>
            </div>
            <div className="flex flex-col items-end opacity-60">
              <div className="text-[9px] font-black text-emerald-500 leading-tight">+12%</div>
              <div className="text-[7px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Month</div>
            </div>
          </BentoCard>

          {/* Densified Contact Info - Click to call enabled */}
          <BentoCard className="col-span-2 p-4" delay={0.5}>
            <div className="grid grid-cols-2 gap-4">
              <a 
                href={user.phone ? `tel:${user.phone}` : "#"} 
                className="flex items-center gap-2.5 group active:scale-95 transition-transform"
              >
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-inset)] group-hover:bg-[var(--bg-hover)] flex items-center justify-center shrink-0 border border-[var(--border)] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Phone</p>
                  <p className="text-[11px] font-black truncate group-hover:text-emerald-500 transition-colors">{user.phone || '---'}</p>
                </div>
              </a>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/5 flex items-center justify-center shrink-0 border border-emerald-500/10">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500/60" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-bold text-emerald-500/40 uppercase tracking-widest leading-none mb-1">LINE</p>
                  <p className="text-[11px] font-black truncate text-emerald-500/80">@{user.lineDisplayName || '---'}</p>
                </div>
              </div>
            </div>
          </BentoCard>

        </div>

        {/* Minimalist Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 text-center pb-10">
          <p className="text-[8px] font-black text-[var(--text-muted)] opacity-20 uppercase tracking-[0.5em]">
            ITL Logistics Driver Network • V2.7.0
          </p>
        </motion.div>

      </div>
    </div>
  );
}
