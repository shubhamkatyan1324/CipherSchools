import React from 'react';
import { EvaluationCriterion } from '../types';
import { CheckCircle2, AlertTriangle, Lightbulb, Quote, ShieldCheck } from 'lucide-react';

interface RubricCardProps {
  criterion: EvaluationCriterion;
}

export const RubricCard: React.FC<RubricCardProps> = ({ criterion }) => {
  const { criterionKey, score, maxScore = 10, evidence, concern, suggestion, confidence } = criterion;

  const getScoreBadge = (s: number) => {
    if (s >= 8) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-300', fill: 'bg-emerald-500' };
    if (s >= 6) return { bg: 'bg-orange-50 text-[#F98513] border-orange-300', fill: 'bg-[#F98513]' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-300', fill: 'bg-rose-500' };
  };

  const theme = getScoreBadge(score);
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <div className="bg-white border-2 border-slate-200 hover:border-[#F98513] rounded-2xl p-7 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h4 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#F98513] transition-colors">
              {criterionKey}
            </h4>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-mono font-normal text-slate-600 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F98513]" />
                Confidence: {Math.round(confidence * 100)}%
              </span>
            </div>
          </div>

          <div className={`px-4 py-1 rounded-xl border font-mono font-semibold text-base ${theme.bg}`}>
            {score} / {maxScore}
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-5 border border-slate-200">
          <div
            className={`h-full ${theme.fill} transition-all duration-1000 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Evidence Section */}
        {evidence && (
          <div className="mb-4 bg-white border border-slate-200 rounded-2xl p-4 text-sm sm:text-base">
            <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
              <Quote className="w-4 h-4 text-[#F98513]" />
              <span>Submission Evidence</span>
            </div>
            <p className="text-slate-900 italic font-mono leading-relaxed bg-white p-3 rounded-xl border border-slate-200 font-normal">
              "{evidence}"
            </p>
          </div>
        )}

        {/* Concern Section */}
        {concern && (
          <div className="mb-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm sm:text-base">
            <div className="flex items-center gap-2 font-semibold text-rose-900 mb-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Design Concern</span>
            </div>
            <p className="text-rose-950 font-normal leading-relaxed">{concern}</p>
          </div>
        )}

        {/* Suggestion Section */}
        {suggestion && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm sm:text-base">
            <div className="flex items-center gap-2 font-semibold text-[#F98513] mb-1.5">
              <Lightbulb className="w-4 h-4 text-[#F98513]" />
              <span>Actionable Recommendation</span>
            </div>
            <p className="text-slate-900 font-normal leading-relaxed">{suggestion}</p>
          </div>
        )}
      </div>
    </div>
  );
};
