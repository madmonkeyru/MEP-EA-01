import { useId } from 'react';

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

/** Shared native select: one focus target, one accessible name and platform keyboard behavior. */
export function CustomSelect({ id, name, label, value, options, onChange, disabled = false,
  className = '', buttonClassName = '', placeholder = 'Seleccionar...', title, 'aria-label': ariaLabel,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const normalized = options.map(option => typeof option === 'string' ? { value: option, label: option } : option);
  return <span className={`custom-select-container block w-full min-w-0 ${className}`}>
    <select id={selectId} name={name} value={String(value)} disabled={disabled}
      aria-label={ariaLabel || label || title || placeholder} title={title}
      onChange={event => onChange(event.target.value)}
      className={`custom-select-trigger w-full min-w-0 ${buttonClassName}`}>
      {!normalized.some(option => option.value === String(value)) && <option value="" disabled>{placeholder}</option>}
      {normalized.map(option => <option key={option.value} value={option.value} disabled={option.disabled}
        title={option.description}>{option.label}{option.badge ? ` · ${option.badge}` : ''}</option>)}
    </select>
  </span>;
}
