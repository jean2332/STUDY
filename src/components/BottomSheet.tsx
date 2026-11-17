import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl max-h-[85dvh] flex flex-col pb-safe"
      >
        {/* Drag handle affordance */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h2 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Cerrar ${title}`}
            className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-5 py-4 overflow-y-auto overflow-x-hidden app-scroll">
          {children}
        </div>
      </motion.div>
    </div>
  );
};
