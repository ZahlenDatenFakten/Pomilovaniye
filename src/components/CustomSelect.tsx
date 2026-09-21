import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  badgeColor?: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | { value: T; label: string; badgeColor?: string })[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

const SEVERITY_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  admin: { dot: 'bg-slate-400', text: 'text-slate-300', bg: 'bg-slate-500/10' },
  small: { dot: 'bg-teal-400', text: 'text-teal-300', bg: 'bg-teal-500/10' },
  medium: { dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-500/10' },
  heavy: { dot: 'bg-orange-400', text: 'text-orange-300', bg: 'bg-orange-500/10' },
  especially: { dot: 'bg-rose-400', text: 'text-rose-300', bg: 'bg-rose-500/10' }
};

export function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  buttonClassName = '',
  dropdownClassName = '',
  disabled = false,
  size = 'sm',
  label
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; placeAbove: boolean } | null>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  const valKey = String(value);
  const colorStyle = SEVERITY_COLORS[valKey];

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 240 && rect.top > 240;

      setCoords({
        top: placeAbove ? rect.top : rect.bottom,
        left: rect.left,
        width: Math.max(rect.width, 180),
        placeAbove
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();

      const handleScrollOrResize = () => updateCoords();
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          buttonRef.current && !buttonRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  const handleSelect = (val: T, optionDisabled?: boolean) => {
    if (optionDisabled) return;
    onChange(val);
    setIsOpen(false);
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs font-semibold rounded-md min-h-[30px]',
    md: 'px-3 py-1.5 text-sm font-semibold rounded-lg min-h-[36px]',
    lg: 'px-4 py-2 text-sm font-bold rounded-lg min-h-[42px]'
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 dark-input text-slate-100 transition-all duration-100 cursor-pointer ${
          sizeClasses[size]
        } ${isOpen ? 'border-cyan-500 ring-1 ring-cyan-500/40 bg-[#0E1520]' : ''} ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-1.5">
          {colorStyle && (
            <span className={`w-2 h-2 rounded-full shrink-0 ${colorStyle.dot}`} />
          )}
          <span className={selectedOption && selectedOption.value ? (colorStyle ? colorStyle.text : 'text-slate-100 font-semibold') : 'text-slate-500'}>
            {selectedOption && selectedOption.value ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-100 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* PORTAL DROPDOWN MENU */}
      {isOpen && coords && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: coords.placeAbove ? 3 : -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: coords.placeAbove ? 3 : -3 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: coords.placeAbove ? 'auto' : `${coords.top + 4}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top + 4}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 999999,
            }}
            className={`max-h-64 overflow-y-auto bg-[#0B0F15] border border-[#1E293B] rounded-xl shadow-2xl shadow-black p-1 space-y-0.5 ${dropdownClassName}`}
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-500 italic text-center">
                Нет вариантов
              </div>
            ) : (
              options.map(option => {
                const isSelected = String(option.value) === String(value);
                const isDisabled = 'disabled' in option && option.disabled;
                const optColor = SEVERITY_COLORS[String(option.value)];

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(option.value, isDisabled)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left transition-all rounded-lg cursor-pointer ${
                      isSelected
                        ? 'bg-[#121B27] border border-cyan-500/30 text-white font-bold'
                        : 'text-slate-300 hover:bg-[#121B27] hover:text-white'
                    } ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {optColor ? (
                        <span className={`w-2 h-2 rounded-full shrink-0 ${optColor.dot}`} />
                      ) : (
                        <span className="w-2 h-2 rounded-full shrink-0 bg-slate-600" />
                      )}
                      <span className={`truncate font-medium ${optColor ? optColor.text : ''}`}>
                        {option.label}
                      </span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
