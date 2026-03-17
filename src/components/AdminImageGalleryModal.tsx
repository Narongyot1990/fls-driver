'use client';

/* eslint-disable @next/next/no-img-element */

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AdminImageGalleryModalProps {
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelectIndex: (index: number) => void;
}

export default function AdminImageGalleryModal({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  onSelectIndex,
}: AdminImageGalleryModalProps) {
  return (
    <AnimatePresence>
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.95)' }}
          onClick={onClose}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute top-5 left-0 right-0 text-center text-white text-fluid-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          <img
            src={images[currentIndex]}
            alt=""
            className="max-w-[90vw] max-h-[80vh] rounded-[var(--radius-lg)] object-contain"
            onClick={(event) => event.stopPropagation()}
          />

          {currentIndex > 0 && (
            <button
              onClick={(event) => { event.stopPropagation(); onPrev(); }}
              className="absolute left-3 w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {currentIndex < images.length - 1 && (
            <button
              onClick={(event) => { event.stopPropagation(); onNext(); }}
              className="absolute right-3 w-10 h-10 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-4">
              {images.map((src, index) => (
                <button
                  key={index}
                  onClick={(event) => { event.stopPropagation(); onSelectIndex(index); }}
                  className="w-12 h-12 rounded-[var(--radius-sm)] overflow-hidden shrink-0 transition-all"
                  style={{
                    border: index === currentIndex ? '2px solid #fff' : '2px solid transparent',
                    opacity: index === currentIndex ? 1 : 0.5,
                  }}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
