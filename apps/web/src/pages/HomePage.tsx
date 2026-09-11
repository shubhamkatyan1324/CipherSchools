import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Problem, Attempt } from '../types';
import { api } from '../services/api';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { DifficultyBadge } from '../components/ui/DifficultyBadge';
import {
  ArrowRight, CheckCircle2, Sparkles, RefreshCw,
  Flame, Award, BookOpen, Check, Target, SearchX
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [attemptsMap, setAttemptsMap] = useState<Record<string, Attempt[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q')?.trim()?.toLowerCase() || '';

  useEffect(() => {
    loadProblemsAndStats();
  }, []);

  const loadProblemsAndStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProblems();
      setProblems(data);

      const attemptsResults = await Promise.all(
        data.map((p) => api.getAttemptsByProblem(p.slug).catch(() => []))
      );

      const map: Record<string, Attempt[]> = {};
      data.forEach((p, idx) => {
        map[p.slug] = attemptsResults[idx];
      });
      setAttemptsMap(map);
    } catch (err: any) {
      setError(err.message || 'Failed to load LLD problems.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    if (!searchQuery) return true;
    return (
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      p.slug.toLowerCase().includes(searchQuery) ||
      p.thinkingPoints?.some((tp) => tp.toLowerCase().includes(searchQuery))
    );
  });

  const totalAttempts = Object.values(attemptsMap).reduce((acc, list) => acc + list.length, 0);
  const completedAttempts = Object.values(attemptsMap)
    .flat()
    .filter((a) => a.status === 'COMPLETED').length;

  const scores = Object.values(attemptsMap)
    .flat()
    .map((a) => a.latestSubmission?.evaluation?.overallScore)
    .filter((s): s is number => typeof s === 'number');

  const avgScoreDisplay = scores.length > 0 ? `${Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)}` : '—';
  const streakDisplay = totalAttempts > 0 ? `${completedAttempts > 0 ? Math.min(completedAttempts + 1, 7) : 1} Days 🔥` : '0 Days';

  return (
    <div className="w-full px-6 lg:px-12 py-8 space-y-10 bg-white">
      {/* Hero Banner Section (Clean LLD Positioning) */}
      <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-slate-200 px-8 py-8 sm:px-12 sm:py-10 shadow-sm bg-grid-overlay">
        <div className="max-w-6xl relative z-10 space-y-5">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
            Practice <span className="text-[#F98513]">LLD</span>, Get Better
          </h1>

          <p className="text-slate-700 text-xl sm:text-2xl leading-relaxed font-normal max-w-5xl">
            The ultimate practice platform for Software Engineers preparing for Low-Level Design (LLD) interviews. Master object-oriented principles, submit class structures, and receive automated 8-dimension rubric feedback.
          </p>

          {/* CipherSchools Style Chips */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-base sm:text-lg font-arial font-medium text-slate-800 shadow-sm">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>4 Benchmark Problems</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-base sm:text-lg font-arial font-medium text-slate-800 shadow-sm">
              <Check className="w-5 h-5 text-[#F98513]" />
              <span>8-Dimension Rubric Review</span>
            </div>
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-base sm:text-lg font-arial font-medium text-slate-800 shadow-sm">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>AI-Powered Design Evaluation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Learner Statistics Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F98513]">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm text-slate-600 font-mono font-medium block">Problems Attempted</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900">{totalAttempts}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm text-slate-600 font-mono font-medium block">Completed Reviews</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-slate-900">{completedAttempts}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#F98513]">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm text-slate-600 font-mono font-medium block">Average Rubric Score</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-[#F98513]">{avgScoreDisplay} {scores.length > 0 && <span className="text-sm text-slate-500 font-normal">/ 100</span>}</span>
          </div>
        </div>

        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-slate-300 transition-all duration-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <span className="text-sm text-slate-600 font-mono font-medium block">Current Practice Streak</span>
            <span className="text-3xl sm:text-4xl font-bold font-mono text-amber-600">{streakDisplay}</span>
          </div>
        </div>
      </div>

      {/* Problem Cards Header */}
      <div id="problems-section" className="flex items-center justify-between scroll-mt-24">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-[#F98513]" />
            <span>Benchmark LLD Practice Problems</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-normal mt-1">Select an object-oriented design problem to review requirements and start your practice attempt</p>
        </div>

        <Button variant="secondary" size="md" onClick={loadProblemsAndStats} icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white border-2 border-slate-200 rounded-2xl p-8 animate-pulse space-y-5">
              <div className="h-7 bg-slate-100 rounded w-1/3"></div>
              <div className="h-6 bg-slate-100 rounded w-2/3"></div>
              <div className="h-5 bg-slate-100 rounded w-full"></div>
              <div className="h-12 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      )}

      {/* Problems Grid (Compact & Informative) */}
      {!loading && filteredProblems.length === 0 ? (
        <Card className="text-center py-16 p-8 border-2 shadow-sm space-y-4">
          <SearchX className="w-14 h-14 text-slate-400 mx-auto" />
          <h3 className="text-2xl font-bold text-slate-900">No Benchmark Problems Found</h3>
          <p className="text-base text-slate-600 font-normal max-w-md mx-auto">
            No LLD problems matched your query "<span className="font-semibold text-slate-900">{searchQuery}</span>". Try searching for topics like "parking", "elevator", "snake", or "vending".
          </p>
          <Button variant="outline" size="md" onClick={() => setSearchParams({})}>
            Clear Search Filter
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProblems.map((problem) => {
            const attempts = attemptsMap[problem.slug] || [];
            const completedAttempt = attempts.find((a) => a.status === 'COMPLETED');
            const latestAttempt = attempts[0] || null;
            const scores = attempts
              .map((a) => a.latestSubmission?.evaluation?.overallScore)
              .filter((s): s is number => typeof s === 'number');
            const bestScore = scores.length > 0 ? Math.max(...scores) : null;

            const practiceStatus = completedAttempt
              ? 'Completed'
              : latestAttempt
                ? 'In Progress'
                : 'Not Started';

            const statusStyle =
              practiceStatus === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : practiceStatus === 'In Progress'
                  ? 'bg-orange-50 text-[#F98513] border-orange-300'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

            return (
              <Card
                key={problem.id}
                hoverGlow
                className="flex flex-col justify-between group relative overflow-hidden p-6 sm:p-7 border-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <DifficultyBadge difficulty={problem.difficulty} />
                      <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${statusStyle}`}>
                        {practiceStatus}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-medium text-slate-500">
                      {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 group-hover:text-[#F98513] transition-colors mb-3 tracking-tight">
                    {problem.title}
                  </h3>

                  <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal line-clamp-3 mb-6">
                    {problem.description}
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <div className="text-xs font-semibold text-[#F98513] uppercase tracking-wider font-mono">
                      Core Concepts:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {problem.thinkingPoints?.slice(0, 3).map((point, idx) => (
                        <span key={idx} className="text-xs sm:text-sm bg-slate-100 text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-medium">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t-2 border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    {bestScore !== null ? (
                      <span className="text-sm font-mono font-semibold text-[#F98513]">
                        Best Score: {bestScore}/100
                      </span>
                    ) : (
                      <span className="text-sm font-mono font-normal text-slate-500">
                        Not attempted yet
                      </span>
                    )}
                  </div>

                  <Link to={`/problem/${problem.slug}`}>
                    <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                      Practice Problem
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
