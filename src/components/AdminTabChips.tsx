'use client';

interface AdminTabOption {
  key: string;
  label: string;
}

interface AdminTabChipsProps {
  activeKey: string;
  onChange: (key: string) => void;
  options: AdminTabOption[];
}

export default function AdminTabChips({
  activeKey,
  onChange,
  options,
}: AdminTabChipsProps) {
  return (
    <div className="flex gap-2">
      {options.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className="btn text-fluid-sm"
          style={{
            background: activeKey === tab.key ? 'var(--accent)' : 'var(--bg-surface)',
            color: activeKey === tab.key ? 'white' : 'var(--text-secondary)',
            border: activeKey === tab.key ? 'none' : '1px solid var(--border)',
            boxShadow: activeKey === tab.key ? 'var(--shadow-accent)' : 'none',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
