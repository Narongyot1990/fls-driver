'use client';

interface AdminBranchFilterProps {
  selectedBranch: string;
  onSelectBranch: (branch: string) => void;
  branchCodes: string[];
  allLabel?: string;
}

export default function AdminBranchFilter({
  selectedBranch,
  onSelectBranch,
  branchCodes,
  allLabel = 'ทุกสาขา',
}: AdminBranchFilterProps) {
  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
      <button
        onClick={() => onSelectBranch('all')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
          selectedBranch === 'all'
            ? 'bg-accent text-white shadow-lg shadow-accent/20'
            : 'bg-surface text-muted border border-border'
        }`}
      >
        {allLabel}
      </button>
      {branchCodes.map((code) => (
        <button
          key={code}
          onClick={() => onSelectBranch(code)}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            selectedBranch === code
              ? 'bg-accent text-white shadow-lg shadow-accent/20'
              : 'bg-surface text-muted border border-border'
          }`}
        >
          สาขา {code}
        </button>
      ))}
    </div>
  );
}
