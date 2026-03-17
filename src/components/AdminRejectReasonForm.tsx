'use client';

interface AdminRejectReasonFormProps {
  rejectReason: string;
  isSubmitting: boolean;
  onRejectReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AdminRejectReasonForm({
  rejectReason,
  isSubmitting,
  onRejectReasonChange,
  onCancel,
  onConfirm,
}: AdminRejectReasonFormProps) {
  return (
    <>
      <h3 className="text-fluid-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>เน€เธซเธ•เธธเธเธฅเธ—เธตเนเนเธกเนเธญเธเธธเธกเธฑเธ•เธด</h3>
      <textarea
        value={rejectReason}
        onChange={(event) => onRejectReasonChange(event.target.value)}
        rows={4}
        className="input resize-none"
        placeholder="เธเธฃเธธเธ“เธฒเธฃเธฐเธเธธเน€เธซเธ•เธธเธเธฅ..."
        autoFocus
      />
      <div className="flex gap-3 mt-4">
        <button onClick={onCancel} className="btn btn-secondary flex-1">
          เธขเธเน€เธฅเธดเธ
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting || !rejectReason.trim()}
          className="btn btn-danger flex-1"
        >
          {isSubmitting ? 'เธเธณเธฅเธฑเธ...' : 'เธขเธทเธเธขเธฑเธ'}
        </button>
      </div>
    </>
  );
}
