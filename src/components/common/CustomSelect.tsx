import React, { useEffect, useRef, useState, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  badge?: string;
  description?: string;
}

export interface CustomSelectProps {
  id?: string;
  name?: string;
  label?: string;
  value: string | number;
  options: (SelectOption | string)[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  title?: string;
  'aria-label'?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  id: propId,
  name,
  label,
  value,
  options: rawOptions,
  onChange,
  disabled = false,
  className = '',
  buttonClassName = '',
  placeholder = 'Seleccionar...',
  title,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId();
  const selectId = propId || generatedId;
  const listboxId = `${selectId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options: SelectOption[] = rawOptions.map(opt =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const stringValue = String(value);
  const selectedOption = options.find(o => o.value === stringValue);
  const selectedIndex = options.findIndex(o => o.value === stringValue);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keep focused item in view
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      const target = items[focusedIndex] as HTMLElement;
      if (target && typeof target.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [isOpen, focusedIndex]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(prev => {
      const next = !prev;
      if (next) {
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return next;
    });
  };

  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setFocusedIndex(prev => {
          let next = prev + 1;
          while (next < options.length && options[next].disabled) next++;
          return next < options.length ? next : prev;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setFocusedIndex(prev => {
          let next = prev - 1;
          while (next >= 0 && options[next].disabled) next--;
          return next >= 0 ? next : prev;
        });
        break;
      }
      case 'Home': {
        e.preventDefault();
        const first = options.findIndex(o => !o.disabled);
        if (first >= 0) setFocusedIndex(first);
        break;
      }
      case 'End': {
        e.preventDefault();
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            setFocusedIndex(i);
            break;
          }
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < options.length) {
          handleSelect(options[focusedIndex]);
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      }
      case 'Tab': {
        setIsOpen(false);
        break;
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`custom-select-container relative inline-block text-left w-full ${className}`}
    >
      {label ? (
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
      ) : null}
      {/* Hidden native select for form synchronization and test runners querying by label */}
      <select
        id={selectId}
        name={name}
        value={stringValue}
        disabled={disabled}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        className="sr-only"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Modern interactive trigger button */}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={label ? undefined : ariaLabel || title}
        title={title}
        className={`custom-select-trigger flex items-center justify-between gap-2.5 w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer text-left
          ${disabled ? 'opacity-50 cursor-not-allowed bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400' : 'bg-[var(--surface-card,#ffffff)] dark:bg-[var(--surface,#24201e)] border-[var(--card-border,#e7e2d8)] dark:border-[var(--card-border,#3d3733)] text-[var(--text-primary,#292524)] dark:text-[var(--text-primary,#f5f2eb)] hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500'}
          ${isOpen ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}
          ${buttonClassName}`}
      >
        <span className="truncate flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {selectedOption?.badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shrink-0 border border-indigo-200/50 dark:border-indigo-800/40">
            {selectedOption.badge}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Option List */}
      {isOpen && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            focusedIndex >= 0 ? `${selectId}-opt-${focusedIndex}` : undefined
          }
          className="custom-select-dropdown absolute z-50 mt-1.5 w-full min-w-[200px] max-h-64 overflow-y-auto rounded-xl p-1.5 shadow-xl border bg-[var(--surface,#ffffff)] dark:bg-[var(--surface,#24201e)] border-[var(--card-border,#e7e2d8)] dark:border-[var(--card-border,#3d3733)] text-[var(--text-primary,#292524)] dark:text-[var(--text-primary,#f5f2eb)] focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === stringValue;
            const isFocused = idx === focusedIndex;
            return (
              <li
                key={opt.value}
                id={`${selectId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => !opt.disabled && setFocusedIndex(idx)}
                className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors duration-100 select-none
                  ${opt.disabled ? 'opacity-40 cursor-not-allowed' : ''}
                  ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold' : 'hover:bg-stone-100 dark:hover:bg-stone-800/60'}
                  ${isFocused && !isSelected ? 'bg-stone-100 dark:bg-stone-800/80' : ''}
                `}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="truncate">{opt.label}</span>
                  {opt.description && (
                    <span className="text-[11px] font-normal text-stone-500 dark:text-stone-400 truncate">
                      {opt.description}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {opt.badge && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                      {opt.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check size={15} className="text-indigo-600 dark:text-indigo-400 stroke-[2.5]" aria-hidden="true" />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
