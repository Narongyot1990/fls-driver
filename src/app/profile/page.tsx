'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { X, Phone, PhoneCall, User, Hash, Circle, CheckCircle2, AlertCircle, Pencil, MapPin, Flag, Brain, Trophy, Star, Zap, BookOpen, TrendingUp } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import UserAvatar from '@/components/UserAvatar';
import { formatRelativeTime, isUserOnline } from '@/lib/date-utils';

interface DriverUser {
  id: string;
  lineDisplayName: string;
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
  lastSeen?: string;
  isOnline?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<DriverUser | null>(null);
  const [editField, setEditField] = useState<'name' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [knowledgeData, setKnowledgeData] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('driverUser', JSON.stringify(data.user));
          setUser(data.user);
        } else {
          const storedUser = localStorage.getItem('driverUser');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            router.push('/login');
          }
        }
      } catch (err) {
        const storedUser = localStorage.getItem('driverUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/car-wash?userId=${user.id}&marked=true&countOnly=true`)
      .then(r => r.json())
      .then(data => { if (data.success) setApprovedCount(data.total ?? 0); })
      .catch(() => {});

    fetch(`/api/tasks/scores?userId=${user.id}`)
      .then(r => r.json())
      .then(data => { if (data.success) setKnowledgeData(data.data); })
      .catch(() => {});
  }, [user?.id]);

  const handleStartEdit = (field: 'name' | 'phone') => {
    if (field === 'name') {
      setEditValue(`${user?.name || ''} ${user?.surname || ''}`.trim());
    } else {
      setEditValue(user?.phone || '');
    }
    setEditField(field);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditField(null);
    setEditValue('');
    setError('');
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const updates: any = {};

      if (editField === 'name') {
        const parts = editValue.trim().split(' ');
        updates.name = parts[0] || '';
        updates.surname = parts.slice(1).join(' ') || '';
      } else if (editField === 'phone') {
        updates.phone = editValue.trim();
      }

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...updates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const updatedUser = { 
          ...user, 
          name: data.user.name, 
          surname: data.user.surname,
          phone: data.user.phone 
        };
        localStorage.setItem('driverUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSuccess(true);
        setEditField(null);
        setEditValue('');
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setError(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const fullName = [user.name, user.surname].filter(Boolean).join(' ') || '-';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      <Sidebar role="driver" />

      <div className="lg:pl-[240px] pb-20 lg:pb-6">
        {/* Cover & Profile Section - Social Media Style */}
        <div className="relative">
          {/* Cover Background */}
          <div 
            className="h-32 sm:h-40 w-full"
            style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 100%)'
            }}
          />
          
          {/* Profile Info Overlay */}
          <div className="px-4 sm:px-8 pb-6">
            <div className="max-w-2xl mx-auto">
              {/* Avatar - Large & Prominent */}
              <div className="relative -mt-16 sm:-mt-20 mb-4">
                <div className="inline-block relative">
                  <UserAvatar imageUrl={user.lineProfileImage} displayName={user.lineDisplayName} tier={user.performanceTier} size="2xl" showTierBadge />
                  {/* Online Status Badge */}
                  <div 
                    className="absolute bottom-2 right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-3 flex items-center justify-center"
                    style={{ 
                      background: isUserOnline(user.lastSeen) ? 'var(--success)' : 'var(--text-muted)',
                      borderColor: 'var(--bg-surface)'
                    }}
                  >
                    <Circle className="w-2 h-2 sm:w-2.5 sm:h-2.5 fill-current text-white" />
                  </div>
                </div>
              </div>

              {/* Name & Status */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2 flex-wrap flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {fullName}
                    </h1>
                    {user.status === 'active' ? (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'var(--success-light)', color: 'var(--success)' }}
                      >
                        ใช้งาน
                      </span>
                    ) : (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ background: 'rgba(251, 191, 36, 0.1)', color: 'var(--warning)' }}
                      >
                        รออนุมัติ
                      </span>
                    )}
                    {user.branch && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                        <MapPin className="w-3 h-3 inline mr-0.5" />{user.branch}
                      </span>
                    )}
                  </div>
                  {user.phone && (
                    <a 
                      href={`tel:${user.phone}`}
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--success)' }}
                    >
                      <PhoneCall className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                  @{user.lineDisplayName}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: isUserOnline(user.lastSeen) ? 'var(--success)' : 'var(--text-muted)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: isUserOnline(user.lastSeen) ? 'var(--success)' : 'var(--text-muted)' }}>
                    {isUserOnline(user.lastSeen) ? 'ออนไลน์' : user.lastSeen ? formatRelativeTime(user.lastSeen) : 'ไม่ทราบ'}
                  </span>
                </div>
              </div>

              {/* Success/Error Messages */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card p-3 flex items-center gap-2 mb-4"
                >
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)' }}>บันทึกข้อมูลสำเร็จ!</span>
                </motion.div>
              )}

              {error && (
                <div 
                  className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] mb-4"
                  style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {/* Approved Stats */}
              {approvedCount > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="card p-4 flex items-center gap-4 mb-4"
                  style={{ background: 'linear-gradient(135deg, var(--success-light) 0%, var(--bg-surface) 100%)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--success)', boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold" style={{ color: 'var(--success)' }}>{approvedCount}</p>
                    <p className="text-fluid-xs" style={{ color: 'var(--text-muted)' }}>กิจกรรมที่ได้รับ Approved</p>
                  </div>
                </motion.div>
              )}

              {/* Knowledge Level Section */}
              {knowledgeData && knowledgeData.completedTasks > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="card p-0 overflow-hidden mb-4"
                >
                  {/* Header with gradient */}
                  <div
                    className="p-5 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${knowledgeData.levelColor}22 0%, ${knowledgeData.levelColor}08 100%)`,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Level badge - circular with glow */}
                      <div className="relative">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center relative"
                          style={{
                            background: `linear-gradient(135deg, ${knowledgeData.levelColor}, ${knowledgeData.levelColor}cc)`,
                            boxShadow: `0 4px 20px ${knowledgeData.levelColor}40`,
                          }}
                        >
                          <Brain className="w-7 h-7 text-white" />
                        </div>
                        {/* Animated ring */}
                        <svg className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]" viewBox="0 0 72 72">
                          <circle cx="36" cy="36" r="33" fill="none" stroke={`${knowledgeData.levelColor}20`} strokeWidth="3" />
                          <circle
                            cx="36" cy="36" r="33"
                            fill="none"
                            stroke={knowledgeData.levelColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={`${(knowledgeData.overallPercentage / 100) * 207} 207`}
                            transform="rotate(-90 36 36)"
                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                          />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold" style={{ color: knowledgeData.levelColor }}>
                            {knowledgeData.knowledgeLevel}
                          </h3>
                          {knowledgeData.overallPercentage >= 90 && (
                            <Trophy className="w-4 h-4" style={{ color: '#f59e0b' }} />
                          )}
                        </div>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {knowledgeData.knowledgeLevelTh} · ระดับความรู้
                        </p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5" style={{ color: knowledgeData.levelColor }} />
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {knowledgeData.overallPercentage}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {knowledgeData.completedTasks} แบบทดสอบ
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Overall score bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>คะแนนรวม</span>
                        <span className="text-xs font-bold" style={{ color: knowledgeData.levelColor }}>
                          {knowledgeData.totalScore}/{knowledgeData.totalQuestions}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${knowledgeData.overallPercentage}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${knowledgeData.levelColor}, ${knowledgeData.levelColor}cc)` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  {Object.keys(knowledgeData.categoryScores).length > 0 && (
                    <div className="px-5 py-3" style={{ borderTop: `1px solid var(--border)` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-muted)' }}>
                        คะแนนตามหมวดหมู่
                      </p>
                      <div className="space-y-2.5">
                        {Object.entries(knowledgeData.categoryScores).map(([cat, data]: [string, any]) => {
                          const pct = data.total > 0 ? Math.round((data.score / data.total) * 100) : 0;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                                <span className="text-xs font-semibold" style={{ color: pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                                  {pct}% ({data.score}/{data.total})
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-inset)' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.5 }}
                                  className="h-full rounded-full"
                                  style={{ background: pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent scores */}
                  {knowledgeData.recentScores.length > 0 && (
                    <div className="px-5 py-3" style={{ borderTop: `1px solid var(--border)` }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                        ผลทดสอบล่าสุด
                      </p>
                      <div className="space-y-1.5">
                        {knowledgeData.recentScores.map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 py-1">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                              style={{
                                background: s.percentage >= 80 ? 'var(--success-light)' : s.percentage >= 50 ? 'rgba(251,191,36,0.1)' : 'var(--danger-light)',
                              }}
                            >
                              {s.percentage >= 80 ? (
                                <Star className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                              ) : s.percentage >= 50 ? (
                                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
                              ) : (
                                <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                            </div>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: s.percentage >= 80 ? 'var(--success-light)' : s.percentage >= 50 ? 'rgba(251,191,36,0.1)' : 'var(--danger-light)',
                                color: s.percentage >= 80 ? 'var(--success)' : s.percentage >= 50 ? 'var(--warning)' : 'var(--danger)',
                              }}
                            >
                              {s.score}/{s.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Employee Info Card */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.1 }}
                className="card p-0 overflow-hidden"
              >
                {/* Employee ID */}
                <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-inset)' }}>
                    <Hash className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>รหัสพนักงาน</p>
                    <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                      {user.employeeId || '-'}
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="p-4 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-inset)' }}>
                    <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>ชื่อ-นามสกุล</p>
                    {editField === 'name' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input flex-1"
                          placeholder="กรอกชื่อ-นามสกุล"
                          autoFocus
                        />
                        <button onClick={handleSave} disabled={loading} className="btn btn-primary px-3">
                          {loading ? '...' : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={handleCancelEdit} className="btn btn-ghost px-3">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{fullName}</p>
                        <button onClick={() => handleStartEdit('name')} className="btn btn-ghost p-2">
                          <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-inset)' }}>
                    <Phone className="w-5 h-5" style={{ color: 'var(--success)' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>เบอร์โทรศัพท์</p>
                    {editField === 'phone' ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="tel"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="input flex-1"
                          placeholder="กรอกเบอร์โทรศัพท์"
                          autoFocus
                        />
                        <button onClick={handleSave} disabled={loading} className="btn btn-primary px-3">
                          {loading ? '...' : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button onClick={handleCancelEdit} className="btn btn-ghost px-3">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{user.phone || '-'}</p>
                        <button onClick={() => handleStartEdit('phone')} className="btn btn-ghost p-2">
                          <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
