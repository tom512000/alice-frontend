import { cn } from '@/lib/cn';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-gray-700 font-poppins">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-poppins text-gray-900',
            'placeholder:text-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:border-gray-900',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
            error && 'border-red-400 focus:ring-red-400',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-poppins">{error}</p>}
        {hint && !error && <p className="text-xs text-gray-500 font-poppins">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
