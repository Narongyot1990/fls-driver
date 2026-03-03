'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Pencil, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Sidebar from '@/components/Sidebar';

interface DriverUser {
  id: string;
  lineDisplayName: string;
  lineProfileImage?: string;
  name?: string;
  surname?: string;
  phone?: string;
  employeeId?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<DriverUser | null>(null);
  const [editField, setEditField] = useState<'name' | 'phone' | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('driverUser');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(storedUser);
    setUser(userData);
  }, [router]);

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
        <div className="px-4 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto space-y-4">
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card p-4 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--success-light)' }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                </div>
                <span className="text-fluid-sm font-medium" style={{ color: 'var(--success)' }}>บันทึกข้อมูลสำเร็จ!</span>
              </motion.div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] text-fluid-sm" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Profile Header */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden shrink-0" style={{ background: 'var(--accent)' }}>
                  {user.lineProfileImage ? (
                    <img src={user.lineProfileImage} alt={user.lineDisplayName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{user.lineDisplayName.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-fluid-lg font-bold" style={{ color: 'var(--text-primary)' }}>{user.lineDisplayName}</h2>
                  <p className="text-fluid-xs" style={{ color: 'var(--text-muted)' }}>พนักงานขับรถ</p>
                </div>
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card p-0 overflow-hidden">
              {/* Name Field */}
              <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-fluid-xs" style={{ color: 'var(--text-muted)' }}>ชื่อ-นามสกุล</p>
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
                      <p className="text-fluid-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{fullName}</p>
                    )}
                  </div>
                  {editField !== 'name' && (
                    <button onClick={() => handleStartEdit('name')} className="btn btn-ghost p-2">
                      <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-fluid-xs" style={{ color: 'var(--text-muted)' }}>เบอร์โทรศัพท์</p>
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
                      <p className="text-fluid-base font-medium mt-1" style={{ color: 'var(--text-primary)' }}>{user.phone || '-'}</p>
                    )}
                  </div>
                  {editField !== 'phone' && (
                    <button onClick={() => handleStartEdit('phone')} className="btn btn-ghost p-2">
                      <Pencil className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <BottomNav role="driver" />
    </div>
  );
}
