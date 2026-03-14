'use client';

import { useState, useEffect } from 'react';

export interface Branch {
  code: string;
  name: string;
  description?: string;
  location?: {
    lat: number;
    lon: number;
  } | null;
  active: boolean;
}

export function useBranches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        const data = await res.json();
        if (data.success && data.branches) {
          setBranches(data.branches.filter((b: Branch) => b.active));
        }
      } catch (error) {
        console.error('Failed to fetch branches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return { branches, loading };
}

export default useBranches;
