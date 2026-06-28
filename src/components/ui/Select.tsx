import { cn } from '@/lib/cn';
import type { SelectHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  label?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={selectId} className="text-xs font-medium text-gray-700 font-poppins">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-poppins text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-xs text-red-600 font-poppins">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 font-poppins">{hint}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
