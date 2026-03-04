'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface TimePickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialTime?: string;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

const timeSlots = generateTimeSlots();

export default function TimePickerModal({ open, onClose, onConfirm, initialTime }: TimePickerModalProps) {
  const [selected, setSelected] = useState(initialTime || '08:00');

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="card-neo w-full max-w-md rounded-xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>เลือกเวลา</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto mb-4">
              {timeSlots.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelected(t)}
                  className="py-2.5 rounded-[var(--radius-md)] text-fluid-xs font-medium transition-all"
                  style={{
                    background: selected === t ? 'var(--accent)' : 'var(--bg-inset)',
                    color: selected === t ? '#fff' : 'var(--text-secondary)',
                    border: selected === t ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg mb-4" style={{ background: 'var(--bg-inset)' }}>
              <Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {selected} น.
              </span>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="btn btn-secondary flex-1">
                ยกเลิก
              </button>
              <button onClick={handleConfirm} className="btn btn-primary flex-1">
                ยืนยัน
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
