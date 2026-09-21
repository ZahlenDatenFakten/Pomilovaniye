import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Check, X, Info } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'emerald' | 'cyan';
  badge?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const InAppConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'danger',
  badge,
  onConfirm,
  onCancel,
}) => {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const timer = setTimeout(() => confirmBtnRef.current?.focus(), 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onConfirm, onCancel]);

  const variantStyles = {
    danger: {
      icon: <Trash2 className="w-5 h-5 text-rose-400" />,
      iconBg: 'bg-rose-500/10 border-rose-500/25',
      btnBg: 'bg-rose-600 hover:bg-rose-500 text-white font-bold',
      border: 'border-rose-500/30'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      iconBg: 'bg-amber-500/10 border-amber-500/25',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-black font-extrabold',
      border: 'border-amber-500/30'
    },
    info: {
      icon: <Info className="w-5 h-5 text-slate-300" />,
      iconBg: 'bg-[#121B27] border-[#1E293B]',
      btnBg: 'bg-slate-200 hover:bg-white text-black font-bold',
      border: 'border-[#1E293B]'
    },
    emerald: {
      icon: <Check className="w-5 h-5 text-teal-400" />,
      iconBg: 'bg-teal-500/10 border-teal-500/25',
      btnBg: 'bg-teal-500 hover:bg-teal-400 text-black font-extrabold',
      border: 'border-teal-500/30'
    },
    cyan: {
      icon: <Check className="w-5 h-5 text-cyan-400" />,
      iconBg: 'bg-cyan-500/10 border-cyan-500/25',
      btnBg: 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-95 text-black font-extrabold',
      border: 'border-cyan-500/30'
    }
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
          {/* Opaque solid dark overlay - Zero backdrop-blur for max performance */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={onCancel}
            className="fixed inset-0 bg-[#040608]/85"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.12 }}
            className={`relative w-full max-w-md bg-[#0B0F15] border ${variantStyles.border} rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden text-left z-10`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}>
                {variantStyles.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {description}
                </p>

                {badge && (
                  <div className="mt-2.5 inline-block px-2.5 py-0.5 rounded-md bg-[#101722] border border-[#1E293B] text-[11px] font-mono text-slate-300">
                    {badge}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-[#121A26] hover:bg-[#182333] hover:text-white border border-[#1E293B] transition-all cursor-pointer active:scale-95"
              >
                {cancelText}
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={onConfirm}
                className={`px-4 py-2 rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${variantStyles.btnBg}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
