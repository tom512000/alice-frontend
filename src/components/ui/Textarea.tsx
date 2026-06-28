import { cn } from '@/lib/cn';
import type { TextareaHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, id, rows = 3, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '_');
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-medium text-gray-700 font-poppins">
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-poppins text-gray-900',
            'placeholder:text-gray-400 transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900',
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
Textarea.displayName = 'Textarea';
