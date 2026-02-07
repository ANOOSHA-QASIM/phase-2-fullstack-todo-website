import { InputHTMLAttributes, DetailedHTMLProps } from 'react';

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  ...props
}: InputProps) {
  const widthClass = fullWidth ? 'w-full' : '';
  const containerClasses = `mb-4 ${widthClass}`;

  const inputClasses = `w-full px-3 py-2 bg-[rgb(var(--input))] text-[rgb(var(--foreground))] rounded-md border ${
    error ? 'border-[rgb(var(--destructive))]' : 'border-[rgb(var(--border))]'
  } focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ring))] focus:border-transparent transition-all duration-200 ${
    className
  }`;

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
          {label}
        </label>
      )}
      <input {...props} className={inputClasses} />
      {helperText && !error && (
        <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">{helperText}</p>
      )}
      {error && <p className="mt-1 text-sm text-[rgb(var(--destructive))]">{error}</p>
      }
    </div>
  );
}