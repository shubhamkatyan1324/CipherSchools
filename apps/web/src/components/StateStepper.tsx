import React from 'react';
import { AttemptStatus } from '../types';
import { CheckCircle2, Clock, Loader2, AlertCircle, Send } from 'lucide-react';

interface StateStepperProps {
  status: AttemptStatus;
}

export const StateStepper: React.FC<StateStepperProps> = ({ status }) => {
  const steps: { label: string; statusKey: AttemptStatus; icon: React.FC<{ className?: string }> }[] = [
    { label: 'Drafting Design', statusKey: 'IN_PROGRESS', icon: Clock },
    { label: 'Submitted', statusKey: 'SUBMITTED', icon: Send },
    { label: 'Rubric Evaluating', statusKey: 'EVALUATING', icon: Loader2 },
    { label: 'Evaluated & Saved', statusKey: 'COMPLETED', icon: CheckCircle2 },
  ];

  const getStepIndex = (s: AttemptStatus) => {
    switch (s) {
      case 'IN_PROGRESS': return 0;
      case 'SUBMITTED': return 1;
      case 'EVALUATING': return 2;
      case 'COMPLETED': return 3;
      case 'FAILED': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 left-6 right-6 h-1 bg-slate-200 -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const isDone = idx < currentIndex || status === 'COMPLETED';
          const isCurrent = idx === currentIndex && status !== 'COMPLETED';
          const isFailed = status === 'FAILED' && idx === 2;

          return (
            <div key={step.statusKey} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-orange-50 border-[#F98513] text-[#F98513] shadow-sm'
                    : isFailed
                    ? 'bg-rose-50 border-rose-500 text-rose-600 animate-pulse'
                    : isCurrent
                    ? 'bg-[#F98513] border-[#F98513] text-white shadow-lg shadow-orange-500/30 scale-110'
                    : 'bg-slate-100 border-slate-200 text-slate-400'
                }`}
              >
                {isFailed ? (
                  <AlertCircle className="w-5 h-5" />
                ) : isCurrent && status === 'EVALUATING' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`mt-2.5 text-xs font-mono font-bold ${
                  isDone
                    ? 'text-[#F98513]'
                    : isFailed
                    ? 'text-rose-600'
                    : isCurrent
                    ? 'text-slate-900 font-extrabold'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
