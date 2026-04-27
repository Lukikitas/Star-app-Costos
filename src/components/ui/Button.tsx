import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed";

const byVariant: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  secondary: "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
};

const bySize: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-3.5 py-2 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "secondary", size = "md", type = "button", ...props }, ref) => (
    <button ref={ref} type={type} className={`${base} ${byVariant[variant]} ${bySize[size]} ${className}`} {...props} />
  ),
);

Button.displayName = "Button";

