import React from 'react';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, maxScore = 100, size = 'md' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));

  const getColor = (pct: number) => {
    if (pct >= 80) return { stroke: '#F98513', bg: 'bg-orange-50', text: 'text-[#F98513]', border: 'border-orange-200' };
    if (pct >= 60) return { stroke: '#d97706', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { stroke: '#e11d48', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  };

  const theme = getColor(percentage);

  const radius = size === 'lg' ? 44 : size === 'md' ? 32 : 24;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg className="transform -rotate-90" width={dimension} height={dimension}>
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`font-extrabold font-mono tracking-tight ${theme.text} ${
            size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm'
          }`}>
            {score}
          </span>
          {maxScore !== 100 && (
            <span className="text-[10px] text-slate-400 font-mono">/{maxScore}</span>
          )}
        </div>
      </div>
      <div className={`mt-2.5 px-3 py-0.5 rounded-full text-xs font-extrabold tracking-wide uppercase border ${theme.bg} ${theme.text} ${theme.border}`}>
        {percentage >= 80 ? 'Strong Design' : percentage >= 60 ? 'Satisfactory' : 'Needs Improvement'}
      </div>
    </div>
  );
};
