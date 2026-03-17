'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminSessionUser {
  id: string;
  _id?: string;
  role: 'admin';
  branch?: string;
  name?: string;
  surname?: string;
  phone?: string;
  employeeId?: string;
  [key: string]: unknown;
}

export function useAdminSession() {
  const router = useRouter();
  const [user, setUser] = useState<AdminSessionUser | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user?.role === 'admin') {
          setUser(data.user as AdminSessionUser);
        } else {
          router.push('/admin/login');
        }
      } catch {
        router.push('/admin/login');
      }
    };

    fetchMe();
  }, [router]);

  return { user };
}

export default useAdminSession;
