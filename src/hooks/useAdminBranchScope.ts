'use client';

import { useMemo, useState } from 'react';

export function useAdminBranchScope(defaultBranch = 'all') {
  const [selectedBranch, setSelectedBranch] = useState<string>(defaultBranch);

  const branchCode = useMemo(
    () => (selectedBranch !== 'all' ? selectedBranch : null),
    [selectedBranch],
  );

  const withBranchParam = (url: string) => {
    if (!branchCode) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}branch=${encodeURIComponent(branchCode)}`;
  };

  const appendBranchToParams = (params: URLSearchParams) => {
    if (branchCode) {
      params.set('branch', branchCode);
    } else {
      params.delete('branch');
    }
    return params;
  };

  return {
    selectedBranch,
    setSelectedBranch,
    branchCode,
    withBranchParam,
    appendBranchToParams,
  };
}

export default useAdminBranchScope;
