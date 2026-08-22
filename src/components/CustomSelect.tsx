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
    sm: 'px-3 py-1.5 text-xs rounded-md min-h-[32px]',
    md: 'px-3.5 py-2 text-sm rounded-lg min-h-[38px]',
    lg: 'px-4 py-3 text-base rounded-lg min-h-[46px]'
  };

  return (
    <div className={`relative inline-block w-full ${className}`}>
      {label && (
        <label className="text-[11px] font-semibold text-zinc-500 block mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}

      {/* TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between gap-2 app-input text-white cursor-pointer ${
          sizeClasses[size]
        } ${isOpen ? '!border-white/30 !bg-white/10' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${buttonClassName}`}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption && 'icon' in selectedOption && selectedOption.icon && (
            <span className="shrink-0 text-zinc-400">{selectedOption.icon}</span>
          )}
          <span className={selectedOption ? 'text-zinc-100 font-medium' : 'text-zinc-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-500 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* PORTAL DROPDOWN MENU */}
      {isOpen && coords && createPortal(
        <AnimatePresence>
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: coords.placeAbove ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: coords.placeAbove ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: coords.placeAbove ? 'auto' : `${coords.top + 4}px`,
              bottom: coords.placeAbove ? `${window.innerHeight - coords.top + 4}px` : 'auto',
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 999999,
            }}
            className={`max-h-64 overflow-y-auto bg-[#18181b] border border-white/10 rounded-lg shadow-xl shadow-black/80 p-1 space-y-0.5 ${dropdownClassName}`}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-zinc-500 italic text-center">
                Пусто
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
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs sm:text-sm text-left transition-colors rounded-md cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {'icon' in option && option.icon && (
                        <span className="shrink-0 text-zinc-500">{option.icon}</span>
                      )}
                      <div className="truncate">{option.label}</div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-2" />}
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
