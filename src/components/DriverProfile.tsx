"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  User as UserIcon, Calendar, Award, Star, 
  MapPin, Phone, Briefcase, Bell, Settings,
  TrendingUp, Clock, ShieldCheck, Mail, LogOut
} from "lucide-react";

interface DriverProfileProps {
  user: any;
  isMe?: boolean;
}

export default function DriverProfile({ user, isMe = true }: DriverProfileProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden p-4 md:p-6" style={{ background: 'var(--bg-base)' }}>
      {/* ── Bento Grid Layout ── */}
      <div className="grid grid-cols-12 grid-rows-12 gap-3 h-full max-h-[850px]">
        
        {/* 1. Identity Card (Main) */}
        <div className="col-span-12 md:col-span-6 row-span-4 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {user?.lineProfileImage ? (
                <img src={user.lineProfileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-white dark:border-slate-900">
              <ShieldCheck size={16} />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {user?.name} {user?.surname}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
              {user?.employeeId || "DRIVER-ID"}
            </p>
            <div className="flex items-center gap-2 mt-4">
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-full">
                {user?.branch || "General"}
              </span>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                {user?.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Performance (Small Stats) */}
        <div className="col-span-6 md:col-span-3 row-span-4 bg-blue-600 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-lg shadow-blue-200/50 dark:shadow-none">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Tier: {user?.performanceTier || "Silver"}</span>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter">{user?.performancePoints || 0}</p>
            <p className="text-[10px] font-bold uppercase opacity-80">Total Points</p>
          </div>
        </div>

        {/* 3. Rating (Small Stats) */}
        <div className="col-span-6 md:col-span-3 row-span-4 bg-indigo-600 rounded-[32px] p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-200/50 dark:shadow-none">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Star size={20} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">Level {user?.performanceLevel || 1}</span>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter">4.8</p>
            <p className="text-[10px] font-bold uppercase opacity-80">Drive Rating</p>
          </div>
        </div>

        {/* 4. Leave Quota (Medium) */}
        <div className="col-span-12 md:col-span-5 row-span-5 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar size={14} className="text-blue-500" /> Leave Balance
          </h3>
          <div className="space-y-4">
            <QuotaRow label="Vacation" current={user?.vacationDays || 0} total={10} color="bg-blue-500" />
            <QuotaRow label="Sick Leave" current={user?.sickDays || 0} total={10} color="bg-red-500" />
            <QuotaRow label="Personal" current={user?.personalDays || 0} total={5} color="bg-emerald-500" />
          </div>
        </div>

        {/* 5. Contact Info (Vertical) */}
        <div className="col-span-12 md:col-span-4 row-span-5 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-dashed border-slate-200 dark:border-slate-700">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Support & Contact</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                <Phone size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Mobile</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{user?.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Current Branch</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{user?.branch || "Central Warehouse"}</p>
              </div>
            </div>
          </div>
          {isMe && (
            <button className="w-full mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-sm transition-transform active:scale-95 shadow-xl">
              Edit Profile
            </button>
          )}
        </div>

        {/* 6. Quick Actions (Small) */}
        <div className="col-span-6 md:col-span-3 row-span-3 bg-red-50 dark:bg-red-900/10 rounded-[32px] p-5 flex flex-col justify-center items-center gap-2 group cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={24} className="text-red-500 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black text-red-600 uppercase">Logout</span>
        </div>

        {/* 7. Settings (Small) */}
        <div className="col-span-6 md:col-span-3 row-span-3 bg-slate-100 dark:bg-slate-800 rounded-[32px] p-5 flex flex-col justify-center items-center gap-2 group cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
          <Settings size={24} className="text-slate-500 group-hover:rotate-45 transition-transform" />
          <span className="text-[10px] font-black text-slate-600 uppercase">Settings</span>
        </div>

        {/* 8. Badge / Awards (Bottom Wide) */}
        <div className="col-span-12 md:col-span-5 row-span-3 bg-emerald-500 rounded-[32px] p-6 relative overflow-hidden flex items-center gap-4 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Award size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black">Top Performer of March</h4>
            <p className="text-[10px] font-medium opacity-80 italic">"Consistency is the key to success"</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        </div>

      </div>
    </div>
  );
}

function QuotaRow({ label, current, total, color }: { label: string, current: number, total: number, color: string }) {
  const percent = Math.min(100, (current / total) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-tight">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-white">{current}/{total}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}
