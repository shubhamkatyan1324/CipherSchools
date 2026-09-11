import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Attempt, CreateSubmissionPayload } from '../types';
import { api } from '../services/api';
import { StateStepper } from '../components/StateStepper';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import {
  ArrowLeft, Send, Sparkles, AlertCircle, FileText, CheckCircle2,
  Box, GitFork, Cpu, ShieldAlert, Code2, Loader2, BookOpen
} from 'lucide-react';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('requirements');

  const [formData, setFormData] = useState<CreateSubmissionPayload>({
    requirements: '',
    assumptions: '',
    classes: '',
    responsibilities: '',
    relationships: '',
    interfaces: '',
    decisions: '',
    edgeCases: '',
    pseudocode: '',
  });

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

      if (data.status === 'COMPLETED' && data.latestSubmission) {
        navigate(`/attempt/${data.id}/feedback`);
        return;
      }

      if (data.latestSubmission) {
        setFormData({
          requirements: data.latestSubmission.requirements || '',
          assumptions: data.latestSubmission.assumptions || '',
          classes: data.latestSubmission.classes || '',
          responsibilities: data.latestSubmission.responsibilities || '',
          relationships: data.latestSubmission.relationships || '',
          interfaces: data.latestSubmission.interfaces || '',
          decisions: data.latestSubmission.decisions || '',
          edgeCases: data.latestSubmission.edgeCases || '',
          pseudocode: data.latestSubmission.pseudocode || '',
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load attempt.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateSubmissionPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const loadSampleTemplate = () => {
    if (!attempt?.problem) return;
    const title = attempt.problem.title.toLowerCase();

    if (title.includes('parking')) {
      setFormData({
        requirements:
          '1. Support multi-floor parking lot for Compact, Large, Disabled, and Motorcycle vehicles.\n2. Automatically allocate nearest available spot to incoming vehicle.\n3. Calculate parking fee on exit based on vehicle type and duration (hourly rate).\n4. Display real-time spot counts per floor entrance board.',
        assumptions:
          'Single entry gate and exit gate per floor. Fixed hourly billing rates.',
        classes:
          'ParkingLot, Floor, Spot (abstract), CompactSpot, LargeSpot, MotorcycleSpot, Vehicle (abstract), Car, Bus, Motorcycle, Ticket, PaymentGateway, ParkingRateStrategy (interface).',
        responsibilities:
          'ParkingLot: Owns array of Floors and manages entry/exit gates.\nFloor: Manages collection of Spots and tracks available count.\nSpot: Holds occupied state, spot number, and vehicle reference.\nTicket: Records entry timestamp, spot id, vehicle license number.',
        relationships:
          'ParkingLot HAS-A Floor (Composition).\nFloor HAS-A Spot (Composition).\nCar IS-A Vehicle (Inheritance).\nCompactSpot IS-A Spot (Inheritance).\nParkingLot HAS-A ParkingRateStrategy (Strategy Pattern).',
        interfaces:
          'interface PricingStrategy {\n  calculateFee(durationHours: number, vehicleType: VehicleType): number;\n}\n\nclass PeakPricingStrategy implements PricingStrategy { ... }',
        decisions:
          'Applied Strategy Pattern for fee calculation to support peak vs off-peak rates without changing code (Open-Closed Principle). Used composition over inheritance for floor spot management.',
        edgeCases:
          '1. Race Condition: Two vehicles attempting to grab the last available spot simultaneously. Handled via mutex lock on Floor spot allocation method.\n2. Parking Lot Full: System immediately rejects entry ticket generation and displays "LOT FULL" alert.',
        pseudocode:
          'class Floor {\n  private final ReentrantLock lock = new ReentrantLock();\n  public Spot allocateSpot(Vehicle vehicle) {\n    lock.lock();\n    try {\n      for(Spot s : spots) {\n        if(!s.isOccupied() && s.canFit(vehicle)) {\n          s.occupy(vehicle);\n          return s;\n        }\n      }\n      return null;\n    } finally { lock.unlock(); }\n  }\n}',
      });
      showToast('success', 'Sample Template Loaded', 'Pre-filled structured solution for Parking Lot System.');
    } else {
      setFormData({
        requirements:
          'Functional requirements: Manage core state lifecycle, handle user inputs, process core transactions safely, and update state counters in real time.',
        assumptions:
          'Fixed capacity limits; thread-safe memory state updates.',
        classes:
          'ManagerService, EntityModel, StateController, EventNotifier, TransactionReceipt.',
        responsibilities:
          'ManagerService: Coordinates business operations.\nEntityModel: Owns internal state and validation rules.',
        relationships:
          'ManagerService HAS-A EntityModel; EventNotifier uses Observer pattern.',
        interfaces:
          'interface StrategyHandler {\n  processAction(): boolean;\n}',
        decisions:
          'Applied State Pattern to transition entity states safely without nested if-else blocks.',
        edgeCases:
          'Concurrency race conditions, invalid parameter inputs, out-of-stock or invalid balance exceptions.',
        pseudocode:
          'class Service {\n  public void execute() {\n    // Thread-safe state update\n  }\n}',
      });
      showToast('success', 'Sample Template Loaded', 'Pre-filled structured solution template.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt) return;

    try {
      setSubmitting(true);
      setError(null);
      showToast('info', 'Evaluating Rubric', 'Running deterministic validation and AI rubric scoring...');
      await api.submitSolution(attempt.id, formData);
      showToast('success', 'Evaluation Complete', 'Redirecting to 8-dimension rubric feedback page...');
      navigate(`/attempt/${attempt.id}/feedback`);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
      showToast('error', 'Submission Error', err.message || 'Failed deterministic validation.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-20 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F98513] animate-spin mb-4" />
        <p className="text-lg font-mono font-bold text-slate-600">Loading design workspace...</p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="w-full px-6 py-16 text-center max-w-4xl mx-auto">
        <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-slate-900 mb-2">Error Loading Workspace</h2>
        <p className="text-lg text-slate-600 mb-6">{error}</p>
        <Link to="/">
          <Button variant="secondary" icon={<ArrowLeft className="w-5 h-5" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const sectionTabs = [
    { key: 'requirements', label: 'Requirements', icon: FileText },
    { key: 'assumptions', label: 'Assumptions', icon: CheckCircle2 },
    { key: 'classes', label: 'Classes', icon: Box },
    { key: 'responsibilities', label: 'Responsibilities', icon: Cpu },
    { key: 'relationships', label: 'Relationships', icon: GitFork },
    { key: 'interfaces', label: 'Interfaces', icon: Code2 },
    { key: 'decisions', label: 'Design Decisions', icon: Sparkles },
    { key: 'edgeCases', label: 'Edge Cases', icon: AlertCircle },
    { key: 'pseudocode', label: 'Pseudocode (Optional)', icon: Code2 },
  ];

  // Calculate section progress (8 required sections, pseudocode optional)
  const requiredKeys: (keyof CreateSubmissionPayload)[] = [
    'requirements', 'assumptions', 'classes', 'responsibilities',
    'relationships', 'interfaces', 'decisions', 'edgeCases'
  ];
  const completedCount = requiredKeys.filter(
    (k) => (formData[k]?.trim()?.length || 0) >= 10
  ).length;
  const progressPercent = Math.round((completedCount / 8) * 100);

  return (
    <div className="w-full px-6 lg:px-12 py-8 space-y-8 relative">
      {/* Polished Submitting / Evaluation Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-300 flex items-center justify-center mx-auto text-[#F98513]">
              <Loader2 className="w-9 h-9 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">AI-Powered Design Evaluation</h3>
              <p className="text-base text-slate-600 font-mono font-medium">Running deterministic validation & 8-dimension rubric AI scoring...</p>
            </div>

            {/* Lifecycle stepper */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" /> SUBMITTED
              </div>
              <span className="text-slate-400 font-bold font-mono">→</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-mono font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> EVALUATING
              </div>
              <span className="text-slate-400 font-bold font-mono">→</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-mono font-semibold">
                COMPLETED
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={attempt?.problem ? `/problem/${attempt.problem.slug}` : '/'}
            className="p-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Design Workspace: {attempt?.problem?.title}
            </h1>
            <p className="text-base text-slate-600 font-mono font-medium mt-1">
              Attempt Version #{attempt?.submissions?.length ? attempt.submissions.length + 1 : 1} • Fill structured LLD details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={loadSampleTemplate}
            icon={<Sparkles className="w-5 h-5" />}
          >
            Load Sample Template
          </Button>
        </div>
      </div>

      {/* Section Completion Progress Indicator Banner */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-slate-900">Design Completion Status:</span>
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold ${
              completedCount === 8 ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-[#F98513]'
            }`}>
              {completedCount} / 8 Required Sections Complete ({progressPercent}%)
            </span>
          </div>
          <p className="text-sm font-mono text-slate-500">
            Fill all 8 required sections (min 10 chars each) to enable AI-Powered Design Evaluation.
          </p>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full sm:w-64 h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-[#F98513] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* State Machine Stepper */}
      <StateStepper status={attempt?.status || 'IN_PROGRESS'} />

      {/* Split Workspace Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Problem Briefing Card (Sticky) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="sticky top-28 bg-white border-2 border-slate-200 space-y-6 p-7 shadow-sm">
            <div className="flex items-center gap-2.5 pb-4 border-b-2 border-slate-200 text-[#F98513] font-bold text-lg">
              <BookOpen className="w-6 h-6" />
              <span>Problem Briefing</span>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 font-mono">Title</h4>
              <p className="text-lg font-bold text-slate-900">{attempt?.problem?.title}</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Functional Scope</h4>
              <ul className="space-y-2.5 text-base text-slate-800 font-normal">
                {attempt?.problem?.requirements?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-[#F98513] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 font-mono">Constraints</h4>
              <ul className="space-y-2 text-base text-slate-700 font-normal">
                {attempt?.problem?.constraints?.map((c, i) => (
                  <li key={i}>• {c}</li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Structured Design Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Navigation Tabs */}
          <div className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-2.5 flex flex-wrap gap-2">
            {sectionTabs.map((tab) => {
              const hasContent = (formData[tab.key as keyof CreateSubmissionPayload]?.trim()?.length || 0) >= 10;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F98513] text-white shadow-md shadow-orange-500/25'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {hasContent && <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-600'}`} />}
                </button>
              );
            })}
          </div>

          {/* Active Section Textarea */}
          <Card className="bg-white border-2 border-slate-200 space-y-6 p-8 shadow-sm">
            {sectionTabs.map((tab) => {
              if (tab.key !== activeTab) return null;

              const fieldKey = tab.key as keyof CreateSubmissionPayload;
              const currentVal = formData[fieldKey] || '';
              const charCount = currentVal.trim().length;

              return (
                <div key={tab.key} className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200">
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-7 h-7 text-[#F98513]" />
                      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{tab.label}</h3>
                    </div>
                    <span
                      className={`text-sm font-mono px-3.5 py-1 rounded-full border font-semibold ${
                        charCount >= 10
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {charCount} chars {charCount < 10 && '(Min 10 required)'}
                    </span>
                  </div>

                  <textarea
                    rows={14}
                    value={currentVal}
                    onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                    placeholder={`Describe ${tab.label.toLowerCase()} in detail... (e.g. classes, relationships, patterns, edge cases)`}
                    className="w-full bg-slate-50 border-2 border-slate-200 focus:border-[#F98513] focus:ring-2 focus:ring-orange-500/20 rounded-2xl p-6 text-base font-mono font-normal text-slate-900 placeholder-slate-400 leading-relaxed outline-none transition-colors resize-y"
                  />
                </div>
              );
            })}

            <div className="pt-6 border-t-2 border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-600 font-mono font-medium">
                Mandatory sections require min 10 chars for deterministic validation gate.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={submitting}
                icon={<Send className="w-5 h-5" />}
              >
                Submit Design Solution →
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
