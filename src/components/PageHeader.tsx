'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  showThemeToggle?: boolean;
  rightContent?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, backHref, showThemeToggle, rightContent }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-30 px-4 lg:px-6"
      style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between h-14 max-w-5xl mx-auto">
        <div className="flex items-center gap-3 min-w-0">
          {backHref && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(backHref)}
              className="btn-ghost w-9 h-9 p-0 shrink-0 rounded-[var(--radius-md)]"
            >
              <ArrowLeft className="w-[18px] h-[18px]" />
            </motion.button>
          )}
          <div className="min-w-0">
            <h1 className="text-fluid-lg font-bold truncate" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h1>
            {subtitle && (
              <p className="text-fluid-xs truncate" style={{ color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {rightContent}
          {showThemeToggle && <span className="lg:hidden"><ThemeToggle /></span>}
        </div>
      </div>
    </header>
  );
}
