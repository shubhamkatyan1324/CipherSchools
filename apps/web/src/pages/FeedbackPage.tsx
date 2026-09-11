import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Attempt, Submission } from '../types';
import { api } from '../services/api';
import { ScoreGauge } from '../components/ScoreGauge';
import { RubricCard } from '../components/RubricCard';
import { StateStepper } from '../components/StateStepper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb,
  FileCode, Layers, History, Sparkles, Loader2, AlertCircle
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [retrying, setRetrying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'rubric' | 'submission'>('rubric');

  useEffect(() => {
    if (id) {
      loadAttempt(id);
    }
  }, [id]);

  const loadAttempt = async (attemptId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAttempt(attemptId);
      setAttempt(data);
      if (data.submissions && data.submissions.length > 0) {
        setSelectedSubmissionIndex(data.submissions.length - 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load evaluation feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRetry = async () => {
    if (!attempt?.problem) return;
    try {
      setRetrying(true);
      const newAttempt = await api.createAttempt(attempt.problem.slug);
      navigate(`/attempt/${newAttempt.id}`);
    } catch (err: any) {
      alert(`Failed to create retry attempt: ${err.message}`);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F98513] animate-spin mb-4" />
        <p className="text-lg font-mono font-bold text-slate-600">Loading structured 8-dimension rubric feedback...</p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="w-full px-6 py-16 text-center max-w-4xl mx-auto">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">Evaluation Feedback Unavailable</h2>
        <p className="text-lg text-slate-600 mb-6">{error || 'Unable to retrieve evaluation results.'}</p>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-5 h-5" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const currentSubmission: Submission | null =
    attempt.submissions[selectedSubmissionIndex] || attempt.latestSubmission || null;

  const evaluation = currentSubmission?.evaluation || null;

  return (
    <div className="w-full px-6 lg:px-12 py-10 space-y-10">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={attempt.problem ? `/problem/${attempt.problem.slug}` : '/'}
            className="p-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Design Review Feedback: {attempt.problem?.title}
            </h1>
            <p className="text-base text-slate-600 font-mono font-medium mt-1">
              Attempt ID: <span className="text-[#F98513]">{attempt.id.substring(0, 8)}...</span> • Version #{currentSubmission?.version || 1}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {attempt.problem && (
            <Link to={`/problem/${attempt.problem.slug}/history`}>
              <Button variant="secondary" size="lg" icon={<History className="w-5 h-5" />}>
                Attempt History
              </Button>
            </Link>
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleStartRetry}
            loading={retrying}
            icon={<RefreshCw className="w-5 h-5" />}
          >
            Improve My Design →
          </Button>
        </div>
      </div>

      {/* State Machine Stepper */}
      <StateStepper status={attempt.status} />

      {/* FLAGSHIP HERO SCORE DASHBOARD */}
      {evaluation ? (
        <Card className="bg-white border-2 border-slate-200 relative overflow-hidden bg-grid-overlay p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
            {/* Score Radial Gauge */}
            <div className="flex items-center gap-10">
              <ScoreGauge score={evaluation.overallScore} maxScore={100} size="lg" />
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 text-[#F98513] text-sm font-mono font-semibold uppercase tracking-wider">
                  <Sparkles className="w-5 h-5 text-[#F98513]" />
                  Structured Rubric Review Outcome
                </div>
                <h2 className="text-4xl font-bold text-slate-900">Overall Design Score</h2>
                <p className="text-lg text-slate-700 font-normal max-w-3xl leading-relaxed">
                  {evaluation.summary
                    .replace('[Rule-Based Fallback] Rule-Based Evaluation', 'Evaluation')
                    .replace('[Rule-Based Fallback]', '[Evaluation]')
                    .replace('Rule-Based Evaluation', 'Evaluation')}
                </p>
              </div>
            </div>

            {/* Submission Version Selector */}
            {attempt.submissions.length > 1 && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 text-base">
                <span className="text-slate-600 font-mono font-semibold block mb-3">Version Selector:</span>
                <div className="flex flex-wrap gap-2.5">
                  {attempt.submissions.map((sub, idx) => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubmissionIndex(idx)}
                      className={`px-5 py-2.5 rounded-xl font-mono font-semibold text-base transition-all ${
                        selectedSubmissionIndex === idx
                          ? 'bg-[#F98513] text-white shadow-md shadow-orange-500/25'
                          : 'bg-white text-slate-700 hover:text-slate-900 border border-slate-200'
                      }`}
                    >
                      v{sub.version} ({sub.evaluation?.overallScore || 0} pts)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="bg-amber-50 border-2 border-amber-200 text-center text-base text-amber-900 p-10 font-medium">
          <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <span>Evaluation pending or failed. Your submission snapshot has been saved safely.</span>
        </Card>
      )}

      {/* Content Navigation Tabs */}
      <div className="flex items-center gap-3 border-b-2 border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('rubric')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-base font-semibold transition-all ${
            activeTab === 'rubric'
              ? 'bg-[#F98513] text-white shadow-md shadow-orange-500/25'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>8-Dimension Rubric Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('submission')}
          className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl text-base font-semibold transition-all ${
            activeTab === 'submission'
              ? 'bg-[#F98513] text-white shadow-md shadow-orange-500/25'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-5 h-5" />
          <span>Inspect Submitted Design (v{currentSubmission?.version || 1})</span>
        </button>
      </div>

      {/* TAB 1: RUBRIC BREAKDOWN & SUMMARY PILLS */}
      {activeTab === 'rubric' && evaluation && (
        <div className="space-y-10">
          {/* Summary Tri-Column: Strengths, Weaknesses, Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Strengths */}
            <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-7 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2.5 font-mono">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>✓ What You Did Well (Strengths)</span>
              </h3>
              <ul className="space-y-3.5 text-base text-emerald-950 font-normal leading-relaxed">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-7 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-rose-900 flex items-center gap-2.5 font-mono">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
                <span>⚠ Areas to Improve (Weaknesses)</span>
              </h3>
              <ul className="space-y-3.5 text-base text-rose-950 font-normal leading-relaxed">
                {evaluation.weaknesses.map((wk, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-rose-200 shadow-sm">
                    <span className="text-rose-600 font-bold">•</span>
                    <span>{wk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="bg-orange-50/70 border-2 border-orange-200 rounded-3xl p-7 shadow-sm space-y-5">
              <h3 className="text-lg font-bold text-[#F98513] flex items-center gap-2.5 font-mono">
                <Lightbulb className="w-6 h-6 text-[#F98513]" />
                <span>→ Next-Step Recommendations</span>
              </h3>
              <ul className="space-y-3.5 text-base text-slate-800 font-normal leading-relaxed">
                {evaluation.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-orange-200 shadow-sm">
                    <span className="text-[#F98513] font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 8 Rubric Cards Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Rubric Dimension Scores & Evidence</h3>
              <span className="text-base font-mono font-medium text-slate-600">8 Fixed Evaluation Dimensions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {evaluation.criteria.map((c) => (
                <RubricCard key={c.id || c.criterionKey} criterion={c} />
              ))}
            </div>
          </div>

          {/* Prominent Bottom CTA Card */}
          <Card className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-2 border-orange-400 p-8 sm:p-10 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold">Ready to refine your architecture?</h3>
              <p className="text-orange-50 text-base sm:text-lg">Apply feedback and address design concerns in a new practice attempt.</p>
            </div>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleStartRetry}
              loading={retrying}
              className="bg-white text-[#F98513] hover:bg-orange-50 border-none font-bold text-lg px-8 py-4 shadow-md shrink-0"
              icon={<RefreshCw className="w-6 h-6 text-[#F98513]" />}
            >
              Improve My Design →
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 2: INSPECT SUBMITTED DESIGN */}
      {activeTab === 'submission' && currentSubmission && (
        <Card className="bg-white border-2 border-slate-200 space-y-8 p-10 shadow-sm">
          <div className="flex items-center justify-between pb-6 border-b-2 border-slate-200">
            <div>
              <h3 className="text-2xl font-black text-slate-900">Submitted Design Snapshot (v{currentSubmission.version})</h3>
              <p className="text-base text-slate-600 font-mono font-bold mt-1">Submitted at: {new Date(currentSubmission.createdAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Requirements Understood</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.requirements}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Assumptions & Scope</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.assumptions}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Classes & Entities</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.classes}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Class Responsibilities</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.responsibilities}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Relationships & Dependencies</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.relationships}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Interfaces & Abstractions</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.interfaces}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Design Decisions & Trade-offs</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.decisions}</p>
            </div>

            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Edge Cases & Concurrency</h4>
              <p className="text-base font-mono text-slate-900 font-medium whitespace-pre-wrap leading-relaxed">{currentSubmission.edgeCases}</p>
            </div>
          </div>

          {currentSubmission.pseudocode && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
              <h4 className="text-sm font-black text-[#F98513] font-mono uppercase tracking-wider mb-3">Pseudocode / Code Snippets</h4>
              <pre className="text-base font-mono font-semibold text-emerald-900 bg-emerald-50 p-6 rounded-2xl border-2 border-emerald-200 overflow-x-auto leading-relaxed">
                {currentSubmission.pseudocode}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
