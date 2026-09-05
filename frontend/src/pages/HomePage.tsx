import React from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { Report } from '../types/report';
import {
  AlertCircle,
  MapPin,
  Sparkles,
  TrendingUp,
  Droplets,
  Zap,
  Trash2,
  Construction,
  ArrowRight,
  GitMerge,
  Flame,
  ShieldCheck
} from 'lucide-react';

const categories = [
  { title: 'Potholes & Roads', icon: Construction, color: 'text-amber-400', bg: 'bg-amber-950/30 border-amber-800/40', desc: 'Damaged asphalt, road collapses, or hazards.' },
  { title: 'Garbage & Waste', icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800/40', desc: 'Illegal dumping, uncollected trash, overflow.' },
  { title: 'Streetlights & Power', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-950/30 border-yellow-800/40', desc: 'Blacked-out lamps, exposed wiring, outages.' },
  { title: 'Water & Sewage', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-950/30 border-cyan-800/40', desc: 'Pipe bursts, flooding, open manholes.' },
];

const pipelineSteps = [
  { step: '01', title: 'Citizen Report', desc: 'Submit photo, location, and description of the issue.', icon: AlertCircle, color: 'text-sky-400' },
  { step: '02', title: 'AI Analysis', desc: 'Automatic category, severity, and factual observation extraction.', icon: Sparkles, color: 'text-cyan-400' },
  { step: '03', title: 'Signal Matching', desc: 'Proximity and multi-signal similarity comparison across reports.', icon: GitMerge, color: 'text-indigo-400' },
  { step: '04', title: 'Pattern Detection', desc: 'Spatial density analysis pinpoints recurring problem areas.', icon: Flame, color: 'text-amber-400' },
  { step: '05', title: 'Municipal Action', desc: 'Priority scoring guides municipal review and resolution.', icon: ShieldCheck, color: 'text-emerald-400' },
];

export const HomePage: React.FC = () => {
  const { data: reportsData } = useReports({ limit: 100 });
  const totalReports = reportsData?.items.length || 0;
  const unverifiedCount = reportsData?.items.filter((r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW').length || 0;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/80 border border-cyan-800/60 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Civic Intelligence Platform</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Small problems can reveal <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">bigger problems.</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Report issues in your city and help uncover patterns that might otherwise go unnoticed. Invisible City connects individual citizen complaints into a clearer picture of urban infrastructure.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/50 transition-all hover:scale-[1.02]"
            >
              <span>Report an Issue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
            >
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>Explore Interactive Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real Civic Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Community Reports</span>
            <AlertCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">{totalReports}</div>
          <p className="text-xs text-slate-500">Issues reported by citizens</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Possible Hotspots</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">Active</div>
          <p className="text-xs text-slate-500">Recurring issue patterns detected</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Under Review</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">{unverifiedCount}</div>
          <p className="text-xs text-slate-500">Reports awaiting municipal triage</p>
        </div>
      </div>

      {/* Intelligence Pipeline Breakdown */}
      <div className="space-y-6">
        <div className="flex flex-col space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <GitMerge className="h-5 w-5 text-cyan-400" />
            <span>How Invisible City Connects Signals</span>
          </h2>
          <p className="text-sm text-slate-400">
            These aren't just separate complaints. Invisible City connects them to reveal possible bigger problems.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-950 text-cyan-400 border border-slate-800 font-mono">
                    {step.step}
                  </span>
                  <Icon className={`h-5 w-5 ${step.color} transition-transform group-hover:scale-110`} />
                </div>
                <h3 className="font-bold text-white text-sm tracking-tight">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>

                {/* Visual Connector Arrow for desktop */}
                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Reportable Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Reportable Urban Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className={`rounded-xl border ${cat.bg} p-5 space-y-3 transition-all hover:border-slate-700`}>
                <div className={`p-2.5 rounded-lg w-fit bg-slate-900/80 ${cat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white text-base">{cat.title}</h3>
                <p className="text-xs text-slate-400">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

