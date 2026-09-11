import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverGlow?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, hoverGlow = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 ${
        hoverGlow ? 'hover:border-[#F98513] hover:shadow-orange-500/10' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
