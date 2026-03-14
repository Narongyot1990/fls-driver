'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import DriverProfile from '@/components/DriverProfile';

export interface ProfileUser {
  id: string; // Changed from _id to id for consistency
  _id?: string;
  lineDisplayName: string;
  linePublicId?: string;
  lineProfileImage?: string;
  performanceTier?: string;
  performancePoints?: number;
  performanceLevel?: number;
  name?: string;
  surname?: string;
  phone?: string;
  employeeId?: string;
  branch?: string;
  status?: 'active' | 'pending';
  approvedCount?: number;
  lastSeen?: string;
  isOnline?: boolean;
}

interface ProfileModalProps {
  user: ProfileUser | null;
  open: boolean;
  onClose: () => void;
}

export default function ProfileModal({ user, open, onClose }: ProfileModalProps) {
  const [fullUser, setFullUser] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !(user?._id || user?.id)) {
      setFullUser(null);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userId = user.id || user._id;
        const [userRes, countRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/car-wash?userId=${userId}&marked=true&countOnly=true`).catch(() => null),
        ]);
        const userData = await userRes.json();
        let approvedCount = 0;
        if (countRes) {
          const countData = await countRes.json();
          approvedCount = countData.total ?? 0;
        }
        if (userData.success && userData.user) {
          setFullUser({ ...userData.user, id: userData.user._id, approvedCount });
        } else {
          setFullUser({ ...user, id: userId as string, approvedCount });
        }
      } catch {
        setFullUser(user);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [open, user]);

  if (!open || !user) return null;

  const displayUser = fullUser || user;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-auto"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-5xl max-h-[90vh] overflow-hidden relative rounded-[32px] shadow-2xl"
            style={{ background: 'var(--bg-base)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-black/10 hover:bg-black/20 text-white md:text-gray-500 md:bg-gray-100 md:hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            {loading ? (
              <div className="h-[600px] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="h-full overflow-y-auto md:overflow-hidden">
                <DriverProfile user={displayUser} isMe={false} />
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
