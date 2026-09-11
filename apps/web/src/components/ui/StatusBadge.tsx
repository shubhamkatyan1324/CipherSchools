import React from 'react';
import { Badge } from './Badge';
import { AttemptStatus } from '../../types';
import { Clock, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const StatusBadge: React.FC<{ status: AttemptStatus | string }> = ({ status }) => {
  switch (status) {
    case 'IN_PROGRESS':
      return <Badge variant="neutral" icon={<Clock className="w-3 h-3 text-slate-400" />}>Drafting</Badge>;
    case 'SUBMITTED':
      return <Badge variant="amber" icon={<Send className="w-3 h-3 text-amber-400" />}>Submitted</Badge>;
    case 'EVALUATING':
      return <Badge variant="orange" icon={<Loader2 className="w-3 h-3 text-cs-orange-400 animate-spin" />}>Evaluating</Badge>;
    case 'COMPLETED':
      return <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}>Evaluated</Badge>;
    case 'FAILED':
      return <Badge variant="rose" icon={<AlertCircle className="w-3 h-3 text-rose-400" />}>Failed</Badge>;
    default:
      return <Badge variant="neutral">{status}</Badge>;
  }
};
