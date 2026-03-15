'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/ThemeToggle';
import ParticleEmitter from '@/components/ParticleEmitter';
import SnowEmitter from '@/components/SnowEmitter';
import { Truck } from 'lucide-react';

const LINE_ICON_PATH =
  'M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  const handleLineLogin = () => {
    setLoading(true);
    const lineChannelId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
    const redirectUri = window.location.origin + '/login/callback';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: lineChannelId || '',
      redirect_uri: redirectUri,
      scope: 'openid profile',
      state: 'driver_login',
    });
    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  };

  const lightBg = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
  const darkBg  = 'var(--bg-base)';

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-700"
      style={{ background: isDark ? darkBg : lightBg }}
    >
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Effects Layer */}
      {isDark ? (
        <ParticleEmitter
          count={50}
          speed={0.2}
          maxSize={2.5}
          lineDistance={110}
          colors={['rgba(6, 199, 85, 0.2)', 'rgba(56, 189, 248, 0.1)']}
        />
      ) : (
        <SnowEmitter count={80} />
      )}

      {/* Decorative Orbs (Subtle) */}
      {!isDark && (
        <>
          <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full opacity-20 blur-[100px] pointer-events-none" style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-10 blur-[80px] pointer-events-none" style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)' }} />
        </>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[340px] relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="flex justify-center mb-8"
        >
          <div
            className="w-20 h-20 rounded-[28px] flex items-center justify-center text-white shadow-2xl"
            style={{ 
              background: 'var(--accent)', 
              boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.5)' : 'var(--shadow-accent)' 
            }}
          >
            <Truck className="w-10 h-10" strokeWidth={1.5} />
          </div>
        </motion.div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>ITL Drivers</h1>
          <p className="text-sm font-semibold mt-2 opacity-50 uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Fleet Management</p>
        </div>

        {/* Login Card - Clean version */}
        <div 
          className="card-neo p-8 backdrop-blur-xl"
          style={{ 
            background: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.7)',
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)'
          }}
        >
          <p className="text-xs font-bold text-center mb-10 leading-relaxed opacity-60" style={{ color: 'var(--text-primary)' }}>
            ระบบบันทึกเวลาปฏิบัติงาน <br/> และจัดการงานขนส่ง
          </p>

          <motion.button
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLineLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#06C755]/20 hover:shadow-[#06C755]/40 flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #06C755 0%, #04B44C 100%)' }}
          >
            {loading ? (
              <div className="w-6 h-6 rounded-full border-3 border-white/20 border-t-white animate-spin" />
            ) : (
              <>
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d={LINE_ICON_PATH} /></svg>
                <span>Login with LINE</span>
              </>
            )}
          </motion.button>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/leader/login"
            className="text-[11px] font-black uppercase tracking-[0.2em] transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            Sign in as Leader / Admin
          </a>
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-center opacity-20 pointer-events-none">
        <p className="text-[10px] font-black tracking-[0.5em] uppercase" style={{ color: 'var(--text-primary)' }}>FLS Fleet Management</p>
      </div>
    </div>
  );
}
