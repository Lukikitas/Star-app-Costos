import { forwardRef } from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, hint, error, className = "", children, ...props }, ref) => {
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</span>}
      <select
        ref={ref}
        className={`w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error ? (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-300">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
});

Select.displayName = "Select";

