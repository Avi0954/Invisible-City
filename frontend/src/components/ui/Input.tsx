import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, helperText, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full font-sans">
        {label && (
          <label className="block text-xs font-semibold text-[#484742]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[#787770] flex-shrink-0 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl border bg-[#fcf9f2] text-sm text-[#1c1c18] placeholder-[#a3a097] transition-colors focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b] ${
              leftIcon ? 'pl-10' : 'pl-4'
            } ${rightIcon ? 'pr-10' : 'pr-4'} ${
              error ? 'border-red-400 bg-red-50/50' : 'border-[#d0cdc5]'
            } py-2.5 ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-[#787770] flex-shrink-0 pointer-events-none">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-[11px] font-semibold text-red-700">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-[#787770]">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, helperText, error, options, children, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full font-sans">
        {label && (
          <label className="block text-xs font-semibold text-[#484742]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full rounded-xl border bg-[#fcf9f2] px-3.5 py-2.5 text-xs sm:text-sm text-[#1c1c18] transition-colors focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b] ${
            error ? 'border-red-400 bg-red-50/50' : 'border-[#d0cdc5]'
          } ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-[11px] font-semibold text-red-700">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-[#787770]">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, helperText, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full font-sans">
        {label && (
          <label className="block text-xs font-semibold text-[#484742]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full rounded-xl border bg-[#fcf9f2] px-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] transition-colors focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b] ${
            error ? 'border-red-400 bg-red-50/50' : 'border-[#d0cdc5]'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-[11px] font-semibold text-red-700">{error}</p>}
        {!error && helperText && <p className="text-[11px] text-[#787770]">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
