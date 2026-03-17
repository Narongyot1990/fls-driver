"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

interface AdminModalShellProps {
  children: ReactNode;
  onClose: () => void;
  contentClassName?: string;
  backdropClassName?: string;
  backdropStyle?: CSSProperties;
}

export default function AdminModalShell({
  children,
  onClose,
  contentClassName,
  backdropClassName,
  backdropStyle,
}: AdminModalShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 ${backdropClassName ?? ""}`}
      style={backdropStyle ?? { background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className={contentClassName ?? "card-neo w-full sm:max-w-sm rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] p-4"}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
