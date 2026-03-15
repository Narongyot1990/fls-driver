'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldCheck, AlertCircle, Mail, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import ParticleEmitter from '@/components/ParticleEmitter';

export default function LeaderLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/leader-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('leaderUser', JSON.stringify(data.leader));
        router.push('/leader/home');
      } else {
        setError(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    } catch {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Particle VFX Background */}
      <ParticleEmitter
        count={35}
        speed={0.25}
        maxSize={2}
        lineDistance={110}
        colors={['rgba(139,92,246,0.5)', 'rgba(99,102,241,0.4)', 'rgba(168,85,247,0.35)']}
      />

      {/* Gradient Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl animate-float" style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', animation: 'float 4s ease-in-out infinite reverse' }} />

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[340px] relative z-10"
      >
        {/* Logo with glow */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 15 }}
          className="flex justify-center mb-5"
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-40" style={{ background: '#8b5cf6' }} />
            <div
              className="relative w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-white"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 8px 32px rgba(124,58,237,0.35)' }}
            >
              <ShieldCheck className="w-9 h-9" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="text-center mb-7"
        >
          <h1 className="text-fluid-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>Leader Portal</h1>
          <p className="text-fluid-xs mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>เข้าสู่ระบบสำหรับหัวหน้างาน</p>
        </motion.div>

        {/* Login Form — Glass */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 25, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl p-6 space-y-4 backdrop-blur-md"
          style={{
            background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.08), 0 0 0 1px var(--border)',
          }}
        >
          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 4 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl text-fluid-xs font-medium overflow-hidden"
                style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="อีเมล"
              required
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10 pr-10"
              placeholder="รหัสผ่าน"
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: 'var(--text-muted)' }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-bold text-[15px] transition-all disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>กำลังเข้าสู่ระบบ...</span>
              </>
            ) : 'เข้าสู่ระบบ'}
          </motion.button>
        </motion.form>

        {/* Driver link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 text-center"
        >
          <a
            href="/login"
            className="inline-flex items-center gap-1 text-fluid-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            สำหรับพนักงานขับรถ
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom branding */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-[10px] font-medium tracking-wider uppercase z-10"
        style={{ color: 'var(--text-muted)', opacity: 0.5 }}
      >
        ITL Fleet Management System
      </motion.p>
    </div>
  );
}
