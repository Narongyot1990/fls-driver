'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

interface LikeUser {
  _id: string;
  lineDisplayName: string;
  lineProfileImage?: string;
  performanceTier?: string;
  name?: string;
  surname?: string;
}

interface LikesPopupProps {
  likes: LikeUser[];
  open: boolean;
  onClose: () => void;
}

function getDisplayName(u: LikeUser) {
  if (u.name && u.surname) return `${u.name} ${u.surname}`;
  return u.lineDisplayName || 'Unknown';
}

export default function LikesPopup({ likes, open, onClose }: LikesPopupProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="card w-full max-w-sm rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-xl)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                >
                  <Heart className="w-5 h-5 fill-current" style={{ color: 'var(--danger)' }} />
                </motion.div>
                <h3 className="text-fluid-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  ถูกใจ
                </h3>
                <span
                  className="px-2 py-0.5 rounded-full text-fluid-xs font-semibold"
                  style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                >
                  {likes.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User list */}
            <div
              className="overflow-y-auto px-3 py-2"
              style={{ maxHeight: '60vh' }}
            >
              {likes.length === 0 ? (
                <div className="py-8 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-fluid-sm" style={{ color: 'var(--text-muted)' }}>
                    ยังไม่มีคนกดถูกใจ
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {likes.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: index * 0.05,
                        type: 'spring',
                        damping: 20,
                        stiffness: 300,
                      }}
                      className="flex items-center gap-3 px-2 py-2.5 rounded-[var(--radius-md)] transition-colors"
                      style={{ background: 'transparent' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-inset)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div className="relative shrink-0">
                        <UserAvatar
                          imageUrl={user.lineProfileImage}
                          displayName={user.name || user.lineDisplayName}
                          tier={user.performanceTier}
                          size="sm"
                        />
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.05 + 0.15, type: 'spring', damping: 15 }}
                          className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'var(--danger)', border: '2px solid var(--bg-surface)' }}
                        >
                          <Heart className="w-2 h-2 fill-current text-white" />
                        </motion.div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-fluid-sm font-semibold truncate"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {getDisplayName(user)}
                        </p>
                        <p
                          className="text-[11px] truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          @{user.lineDisplayName}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
