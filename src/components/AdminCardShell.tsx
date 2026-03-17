'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface AdminCardShellProps extends HTMLMotionProps<'div'> {
  className?: string;
}

export default function AdminCardShell({ className = '', ...props }: AdminCardShellProps) {
  return <motion.div {...props} className={`card ${className}`.trim()} />;
}
