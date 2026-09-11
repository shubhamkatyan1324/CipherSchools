import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyle =
    'inline-flex items-center justify-center font-semibold tracking-tight transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#F98513]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none cursor-pointer';

  const variants = {
    primary:
      'bg-[#F98513] hover:bg-[#e0710b] text-white shadow-md shadow-[#F98513]/30 hover:shadow-lg hover:shadow-[#F98513]/40 border border-[#F98513] transform hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 hover:border-slate-300',
    outline:
      'bg-white hover:bg-orange-50 text-[#F98513] border border-[#F98513] hover:border-[#e0710b]',
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 border border-rose-600',
  };

  const sizes = {
    sm: 'text-sm sm:text-base px-4 py-2.5 rounded-xl gap-2 font-medium',
    md: 'text-base sm:text-lg px-6 py-3 rounded-xl gap-2.5 font-semibold',
    lg: 'text-lg sm:text-xl px-7 py-3.5 rounded-2xl gap-3 font-semibold',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
