"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  User as UserIcon, Calendar, Award, Star, 
  MapPin, Phone
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

interface DriverProfileProps {
  user: ProfileUserData;
  isMe?: boolean;
  onEditClick?: () => void;
}

export default function DriverProfile({ user, isMe = true, onEditClick }: DriverProfileProps) {
  const displayName = user.name && user.surname ? `${user.name} ${user.surname}` : user.lineDisplayName || 'Driver';
  
  // Normalize tier
  const tier = normalizePerformanceTier(user.performanceTier);
  const tierConfig = PERFORMANCE_TIER_CONFIG[tier];
  
  const tierColors: Record<PerformanceTier, { bg: string; text: string; border: string }> = {
    standard: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
    bronze: { bg: '#fef3c7', text: '#b45309', border: '#f59e0b' },
    silver: { bg: '#f1f5f9', text: '#64748b', border: '#94a3b8' },
    gold: { bg: '#fef9c3', text: '#a16207', border: '#eab308' },
    platinum: { bg: '#f5f3ff', text: '#7c3aed', border: '#8b5cf6' },
  };
  const colors = tierColors[tier];

  return (
    <div className="p-4" style={{ background: 'var(--bg-base)' }}>
      {/* Header - Simple Row */}
      <div className="flex items-center gap-3 mb-4">
        {/* Avatar */}
        <div 
          className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
          style={{ background: colors.bg }}
        >
          {user.lineProfileImage ? (
            <img 
              src={user.lineProfileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-lg font-bold" style={{ color: colors.text }}>
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {displayName}
          </h1>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {user.employeeId || 'รอกำหนด'} • {user.branch || '—'}
          </p>
        </div>
        
        {/* Status Badge */}
        <span 
          className="px-2 py-1 rounded text-[10px] font-bold"
          style={{ 
            background: user.status === 'active' ? 'var(--success-light)' : 'var(--warning-light)',
            color: user.status === 'active' ? 'var(--success)' : 'var(--warning)'
          }}
        >
          {user.status === 'active' ? 'ใช้งาน' : 'รอ'}
        </span>
      </div>

      {/* Stats Row - Simple */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 card p-3 flex items-center gap-2">
          <Award className="w-4 h-4" style={{ color: colors.text }} />
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{tierConfig.label}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tier</p>
          </div>
        </div>
        <div className="flex-1 card p-3 flex items-center gap-2">
          <Star className="w-4 h-4" style={{ color: 'var(--warning)' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.performanceLevel ?? 1}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Level</p>
          </div>
        </div>
        <div className="flex-1 card p-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" style={{ color: 'var(--success)' }} />
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{(user.vacationDays ?? 0) + (user.sickDays ?? 0)}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>วันลา</p>
          </div>
        </div>
      </div>

      {/* Contact Row */}
      <div className="card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{user.branch || '—'}</span>
        </div>
      </div>
    </div>
  );
}
