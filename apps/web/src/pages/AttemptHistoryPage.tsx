import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Attempt, Problem } from '../types';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import {
  ArrowLeft, Play, History, Calendar, CheckCircle2, AlertCircle, ArrowRight, Loader2, TrendingUp
} from 'lucide-react';

export const AttemptHistoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadHistory(slug);
    }
  }, [slug]);

  const loadHistory = async (problemSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const [probData, attemptsData] = await Promise.all([
        api.getProblemBySlug(problemSlug),
        api.getAttemptsByProblem(problemSlug),
      ]);
      setProblem(probData);
      setAttempts(attemptsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load attempt history.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartNewAttempt = async () => {
    if (!slug) return;
    try {
      setStarting(true);
      const newAttempt = await api.createAttempt(slug);
      navigate(`/attempt/${newAttempt.id}`);
    } catch (err: any) {
      alert(`Error starting attempt: ${err.message}`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#F98513] animate-spin mb-4" />
        <p className="text-base font-mono text-slate-500">Loading attempt history...</p>
      </div>
    );
  }

  const scores = attempts
    .map((a) => a.submissions[a.submissions.length - 1]?.evaluation?.overallScore)
    .filter((s): s is number => typeof s === 'number');

  const maxScore = scores.length > 0 ? Math.max(...scores) : null;

  return (
    <div className="w-full px-6 lg:px-10 py-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to={problem ? `/problem/${problem.slug}` : '/'}
          className="inline-flex items-center gap-2.5 text-base font-semibold text-slate-600 hover:text-[#F98513] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Challenge Briefing</span>
        </Link>

        <Button
          variant="primary"
          size="lg"
          onClick={handleStartNewAttempt}
          loading={starting}
          icon={<Play className="w-5 h-5 fill-white" />}
        >
          Start New Practice Revision
        </Button>
      </div>

      {/* Hero Problem Summary Header */}
      <Card className="bg-white border-2 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-3.5 mb-2">
            <History className="w-7 h-7 text-[#F98513]" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Attempt Timeline: {problem?.title}</h1>
          </div>
          <p className="text-base sm:text-lg text-slate-600 font-normal">Review design evolution and score progression across practice attempts</p>
        </div>

        <div className="flex items-center gap-6 text-base font-mono text-slate-700">
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200">
            Total Attempts: <span className="font-bold text-[#F98513] text-lg">{attempts.length}</span>
          </div>

          {maxScore !== null && (
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Highest Score: <span className="font-bold text-emerald-600 text-lg">{maxScore}/100</span></span>
            </div>
          )}
        </div>
      </Card>

      {/* Attempts Timeline Cards */}
      {attempts.length === 0 ? (
        <Card className="text-center py-16 p-8 shadow-sm">
          <History className="w-14 h-14 text-slate-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Attempt History Yet</h3>
          <p className="text-base text-slate-600 mb-6 font-normal">Start your first practice attempt to evaluate your object-oriented design solution.</p>
          <Button variant="primary" size="lg" onClick={handleStartNewAttempt}>
            Start First Practice Attempt
          </Button>
        </Card>
      ) : (
        <div className="space-y-5">
          {attempts.map((attempt, idx) => {
            const latestSub = attempt.submissions[attempt.submissions.length - 1] || null;
            const score = latestSub?.evaluation?.overallScore ?? null;
            const attemptNumber = attempts.length - idx;

            // Calculate delta with respect to previous attempt (attempts array is sorted desc by createdAt, so idx + 1 is previous attempt)
            const prevAttempt = attempts[idx + 1];
            const prevSub = prevAttempt?.submissions[prevAttempt.submissions.length - 1] || null;
            const prevScore = prevSub?.evaluation?.overallScore ?? null;
            const scoreDelta = (score !== null && prevScore !== null) ? score - prevScore : null;

            return (
              <Card
                key={attempt.id}
                hoverGlow
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-7 border-2 shadow-sm"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center font-mono font-bold text-[#F98513] text-lg shadow-inner">
                    #{attemptNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-3.5 mb-1.5">
                      <span className="text-xl font-bold text-slate-900">Attempt #{attemptNumber}</span>
                      <StatusBadge status={attempt.status} />
                      {scoreDelta !== null && (
                        <span className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                          scoreDelta > 0 ? 'bg-emerald-100 text-emerald-800' : scoreDelta < 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {scoreDelta > 0 ? `+${scoreDelta} pts improvement ↑` : scoreDelta < 0 ? `${scoreDelta} pts ↓` : 'No score change'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-500 font-mono font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(attempt.createdAt).toLocaleDateString()} {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span>•</span>
                      <span>Submissions: {attempt.submissions.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  {score !== null ? (
                    <div className="text-right">
                      <span className="text-xs uppercase font-mono text-slate-500 block font-semibold">Rubric Score</span>
                      <span
                        className={`text-3xl font-mono font-bold ${
                          score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-[#F98513]' : 'text-rose-600'
                        }`}
                      >
                        {score} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500 italic font-normal">No evaluation score yet</span>
                  )}

                  <Link to={attempt.status === 'COMPLETED' ? `/attempt/${attempt.id}/feedback` : `/attempt/${attempt.id}`}>
                    <Button variant="secondary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                      {attempt.status === 'COMPLETED' ? 'View Rubric Feedback' : 'Continue Workspace'}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
