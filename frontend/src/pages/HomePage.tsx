import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  MapPin,
  Sparkles,
  TrendingUp,
  Droplets,
  Zap,
  Trash2,
  Construction,
  ArrowRight
} from 'lucide-react';

const categories = [
  { title: 'Potholes & Roads', icon: Construction, color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-800/40' },
  { title: 'Garbage & Waste', icon: Trash2, color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-800/40' },
  { title: 'Broken Streetlights', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-950/40 border-yellow-800/40' },
  { title: 'Water Leaks', icon: Droplets, color: 'text-cyan-400', bg: 'bg-cyan-950/40 border-cyan-800/40' },
];

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-8 md:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 rounded-full bg-cyan-950/80 border border-cyan-800/60 px-3.5 py-1 text-xs font-semibold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Civic Intelligence & Aggregation Platform</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            See the <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">Invisible Patterns</span> Shaping Your City
          </h1>
          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Invisible City empowers citizens to report everyday urban problems. Our AI backend clusters micro-reports into macro infrastructure insights for municipal authorities.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-900/50 transition-all hover:scale-[1.02]"
            >
              <span>Submit a Report</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center space-x-2 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-200 transition-all"
            >
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span>Explore Problem Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Reported Issues</span>
            <AlertCircle className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-slate-500">System initialized for hackathon MVP</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>AI Macro Clusters</span>
            <Sparkles className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-slate-500">pgvector semantic clustering ready</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-sm">
            <span>Resolution Rate</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">100%</div>
          <p className="text-xs text-slate-500">Target municipal response efficiency</p>
        </div>
      </div>

      {/* Reportable Categories */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Reportable Urban Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className={`rounded-xl border ${cat.bg} p-5 space-y-3 transition-transform hover:-translate-y-1`}>
                <div className={`p-2.5 rounded-lg w-fit bg-slate-900/80 ${cat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white text-base">{cat.title}</h3>
                <p className="text-xs text-slate-400">Report incidents to alert nearby citizens and local municipality.</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
