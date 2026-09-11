import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'orange' | 'emerald' | 'amber' | 'rose' | 'neutral' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'orange',
  size = 'md',
  icon,
  className = '',
}) => {
  const variants = {
    orange: 'bg-orange-50 text-[#F98513] border-orange-200 shadow-sm',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 shadow-sm',
    rose: 'bg-rose-50 text-rose-700 border-rose-200 shadow-sm',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200 shadow-sm',
  };

  const sizes = {
    sm: 'text-sm sm:text-base px-3.5 py-1 rounded-lg gap-2 font-mono font-medium',
    md: 'text-base sm:text-lg px-4 py-1.5 rounded-xl gap-2.5 font-mono font-semibold',
    lg: 'text-lg sm:text-xl px-5 py-2 rounded-xl gap-3 font-mono font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border tracking-wide uppercase ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
