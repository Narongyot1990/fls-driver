'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckSquare, Users, Clock, CalendarDays, ClipboardCheck, MapPin, User, Shield, LogOut } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { usePusherMulti } from '@/hooks/usePusher';
import { useBranches } from '@/hooks/useBranches';
import { performLogout } from '@/lib/logout';

export default function AdminHomePage() {
  const router = useRouter();
  const { branches, loading: branchesLoading } = useBranches();
  const [user, setUser] = useState<any>(null);
  const [counts, setCounts] = useState({
    pendingLeaves: 0,
    pendingDrivers: 0,
    totalLeaders: 0,
    activeDrivers: 0
  });

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user.role === 'admin') {
          setUser(data.user);
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    };
    fetchMe();
  }, [router]);

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/counts?type=all');
      const data = await res.json();
      if (data.success) {
        setCounts(data.counts);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { if (user) fetchCounts(); }, [user, fetchCounts]);

  usePusherMulti([
    { channel: 'leave-requests', bindings: [
      { event: 'new-leave-request', callback: fetchCounts },
      { event: 'leave-status-changed', callback: fetchCounts },
    ]},
    { channel: 'users', bindings: [
      { event: 'new-driver', callback: fetchCounts },
      { event: 'driver-activated', callback: fetchCounts },
    ]},
  ], !!user);

  const handleLogout = async () => {
    if (!confirm('ต้องการออกจากระบบ?')) return;
    const path = await performLogout('admin');
    router.push(path);
  };

  if (!user) return null;

  const stats = [
    { val: branchesLoading ? '-' : branches.length, label: 'สาขา', color: 'var(--info)' },
    { val: counts.totalLeaders, label: 'LEADERS', color: 'var(--success)' },
    { val: counts.activeDrivers, label: 'DRIVERS', color: 'var(--accent)' },
    { val: counts.pendingDrivers, label: 'รออนุมัติ', color: 'var(--warning)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="admin" />

      <div className="lg:pl-[240px] pb-[72px] lg:pb-6">
        {/* Compact Admin Header */}
        <header className="px-4 lg:px-8 pt-6 pb-2">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tighter leading-none">ADMIN CONSOLE</h1>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">System Infrastructure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--bg-surface)] text-rose-500 hover:bg-rose-500/5 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="px-4 lg:px-8">
          <div className="max-w-2xl mx-auto space-y-6 pt-2">

            {/* Stats: 4 items in 1 row */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-2">
              {stats.map((s) => (
                <div key={s.label} className="card p-3 text-center border-b-2" style={{ borderBottomColor: s.color }}>
                  <p className="text-xl font-black leading-none" style={{ color: s.color }}>{s.val}</p>
                  <p className="text-[9px] uppercase font-bold mt-1.5 tracking-tighter" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Categorized Menu */}
            <div className="space-y-6">
              {/* Category 1: Attendance */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Attendance</h3>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/admin/attendance')}
                  className="w-full card p-5 flex items-center gap-4 cursor-pointer group hover:border-[var(--accent)]/30 transition-all shadow-sm"
                >
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-black leading-tight">ติดตามเวลา</p>
                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">Real-time Timeline Monitor</p>
                  </div>
                </motion.button>
              </div>

              {/* Category 2: Management */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-1">Management</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MenuCard label="อนุมัติลา" icon={CheckSquare} href="/leader/approve" color="var(--success)" desc="Leave Approval" />
                  <MenuCard label="ประวัติ" icon={Clock} href="/leader/history" color="var(--text-muted)" desc="Activity History" />
                  <MenuCard label="พนักงาน" icon={Users} href="/leader/drivers" color="var(--accent)" desc="Driver Management" />
                  <MenuCard label="มอบหมายงาน" icon={ClipboardCheck} href="/leader/tasks" color="var(--info)" desc="Task Assignment" />
                </div>
              </div>

              {/* Category 3: System */}
              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-1">System</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MenuCard label="Dashboard" icon={CalendarDays} href="/dashboard" color="var(--warning)" desc="Analytics" />
                  <MenuCard label="สาขา" icon={MapPin} href="/admin/branches" color="var(--info)" desc="Branches" />
                  <div className="col-span-2">
                    <MenuCard label="ตั้งค่า" icon={User} href="/leader/settings" color="var(--text-muted)" desc="System Settings" horizontal />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <BottomNav role="admin" />
    </div>
  );
}

function MenuCard({ label, icon: Icon, href, color, desc, horizontal }: any) {
  const router = useRouter();
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => router.push(href)}
      className={`card p-4 flex ${horizontal ? 'items-center gap-4' : 'flex-col items-center gap-2'} cursor-pointer group transition-all`}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-inset)] flex items-center justify-center group-hover:bg-[var(--bg-surface)] transition-colors">
        <Icon className="w-5 h-5" style={{ color }} strokeWidth={2.2} />
      </div>
      <div className={horizontal ? 'text-left' : 'text-center'}>
        <p className="text-[12px] font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">{desc}</p>
      </div>
    </motion.button>
  );
}
