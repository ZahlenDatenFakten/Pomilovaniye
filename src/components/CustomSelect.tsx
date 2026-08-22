import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | { value: T; label: string })[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

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

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = spaceBelow < 240 && rect.top > 240;

      setCoords({
        top: placeAbove ? rect.top : rect.bottom,
        left: rect.left,
        width: rect.width,
        placeAbove
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();

      const handleScrollOrResize = () => {
        updateCoords();
      };

      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (
          buttonRef.current && !buttonRef.current.contains(target) &&
          dropdownRef.current && !dropdownRef.current.contains(target)
        ) {
          setIsOpen(false);
        }
      };

      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
        document.removeEventListener('mousedown', handleClickOutside);
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
    sm: 'px-3 py-2 text-xs font-semibold rounded-xl min-h-[38px]',
    md: 'px-4 py-2.5 sm:py-3 text-sm font-semibold rounded-2xl min-h-[46px]',
    lg: 'px-5 py-3.5 text-base font-bold rounded-2xl min-h-[54px]'
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {label && (
        <label className="text-xs font-bold text-zinc-400 block mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2.5 glass-input text-white transition-all duration-150 hover:border-white/30 focus:outline-none cursor-pointer ${
          sizeClasses[size]
        } ${isOpen ? 'border-white/50 ring-2 ring-white/20 bg-white/[0.08]' : ''} ${
          disabled ? 'opacity-40 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption && 'icon' in selectedOption && selectedOption.icon && (
            <span className="shrink-0 text-zinc-300">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-zinc-100 font-semibold' : 'text-zinc-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* PORTAL DROPDOWN MENU */}
      {isOpen && coords && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: coords.placeAbove ? 6 : -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: coords.placeAbove ? 6 : -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: coords.placeAbove ? 'auto' : `${coords.top + 6}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top + 6}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 999999,
            }}
            className={`max-h-72 overflow-y-auto bg-[#0a0a10]/98 border border-white/[0.1] rounded-xl shadow-2xl shadow-black/80 backdrop-blur-3xl p-1 space-y-0.5 ${dropdownClassName}`}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-500 italic text-center">
                Нет вариантов
              </div>
            ) : (
              options.map(option => {
                const isSelected = String(option.value) === String(value);
                const isDisabled = 'disabled' in option && option.disabled;

                return (
                  <button
                    key={String(option.value)}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelect(option.value, isDisabled)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-all rounded-lg cursor-pointer ${
                      isSelected
                        ? 'bg-white/[0.1] text-white font-bold'
                        : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {'icon' in option && option.icon && (
                        <span className="shrink-0 text-zinc-400">{option.icon}</span>
                      )}
                      <div className="truncate font-semibold">{option.label}</div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
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


