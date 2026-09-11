import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Problem, Attempt } from '../types';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import {
  ArrowLeft, Play, History, CheckSquare, ShieldCheck, HelpCircle, Loader2, AlertCircle
} from 'lucide-react';

export const ProblemDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [starting, setStarting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadData(slug);
    }
  }, [slug]);

  const loadData = async (problemSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      const [probData, attemptsData] = await Promise.all([
        api.getProblemBySlug(problemSlug),
        api.getAttemptsByProblem(problemSlug).catch(() => []),
      ]);
      setProblem(probData);
      setAttempts(attemptsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load problem details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAttempt = async () => {
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
        <Loader2 className="w-12 h-12 text-[#F98513] animate-spin mb-4" />
        <p className="text-lg font-mono font-bold text-slate-600">Loading challenge briefing...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="w-full px-6 py-16 text-center max-w-4xl mx-auto">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">Problem Not Found</h2>
        <p className="text-lg text-slate-600 mb-6">{error || 'The requested LLD problem does not exist.'}</p>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-5 h-5" />}>
            Back to Problems
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-10">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2.5 text-base font-medium text-slate-600 hover:text-[#F98513] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Problem Explorer</span>
        </Link>

        {attempts.length > 0 && (
          <Link to={`/problem/${problem.slug}/history`}>
            <Button variant="outline" size="md" icon={<History className="w-5 h-5" />}>
              View {attempts.length} Past Attempts
            </Button>
          </Link>
        )}
      </div>

      {/* Main Challenge Briefing Header */}
      <Card className="bg-white border-2 border-slate-200 p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6 pb-6 border-b-2 border-slate-200">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <DifficultyBadge difficulty={problem.difficulty} />
              <span className="text-base font-mono font-medium text-slate-600 uppercase tracking-wider">
                Slug: {problem.slug}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">{problem.title}</h1>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartAttempt}
            loading={starting}
            icon={<Play className="w-6 h-6 fill-white" />}
          >
            Start Practice Attempt →
          </Button>
        </div>

        {/* Learner Progress Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white border-2 border-slate-200 rounded-2xl p-5">
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Your Attempts</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{attempts.length}</span>
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Best Score</span>
            <span className={`text-xl sm:text-2xl font-bold ${
              attempts.some(a => a.submissions.some(s => s.evaluation))
                ? 'text-emerald-600 font-mono'
                : 'text-slate-500'
            }`}>
              {attempts.length > 0 && attempts.some(a => a.submissions.some(s => s.evaluation))
                ? `${Math.max(...attempts.flatMap(a => a.submissions.map(s => s.evaluation?.overallScore || 0)))} / 100`
                : '—'}
            </span>
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Last Attempt</span>
            <span className="text-base sm:text-lg font-medium text-slate-800">
              {attempts.length > 0
                ? new Date(attempts[0].createdAt).toLocaleDateString()
                : 'Not started'}
            </span>
          </div>
          <div>
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase block mb-1">Est. Practice Time</span>
            <span className="text-base sm:text-lg font-medium text-[#F98513]">~25 - 35 mins</span>
          </div>
        </div>

        {/* Overview */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xs font-bold text-[#F98513] uppercase tracking-wider font-mono mb-2">
              Challenge Overview
            </h3>
            <p className="text-slate-800 text-lg sm:text-xl leading-relaxed font-normal">{problem.description}</p>
          </div>

          {/* Functional Requirements vs Constraints */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <span>Functional Requirements</span>
              </h3>
              <ul className="space-y-2.5 text-base sm:text-lg text-slate-800 font-normal leading-relaxed">
                {problem.requirements?.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>System Constraints & Assumptions</span>
              </h3>
              <ul className="space-y-2.5 text-base sm:text-lg text-slate-800 font-normal leading-relaxed">
                {problem.constraints?.map((c, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Evaluation Pointers */}
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg sm:text-xl font-bold text-[#F98513] flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-[#F98513]" />
              <span>Expected Areas to Think About (Evaluation Pointers)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base sm:text-lg text-slate-800 font-normal">
              {problem.thinkingPoints?.map((tp, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-orange-200 shadow-sm flex items-start gap-2.5">
                  <span className="font-semibold text-[#F98513]">{idx + 1}.</span>
                  <span>{tp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
