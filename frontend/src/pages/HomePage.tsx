import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report } from '../types/report';
import { HotspotItem } from '../types/intelligence';
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
  ShieldCheck,
  Activity,
  Layers,
  Network,
  XCircle,
  CheckCircle2,
  Compass,
  Building2,
  Check
} from 'lucide-react';

const categories = [
  {
    title: 'Potholes & Road Surface',
    icon: Construction,
    color: 'text-amber-400',
    bg: 'bg-amber-950/30 border-amber-800/40',
    desc: 'Damaged asphalt, sunken utility trenches, road collapses, or surface hazards affecting transit.',
    count: '12 active'
  },
  {
    title: 'Garbage & Sanitation',
    icon: Trash2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30 border-emerald-800/40',
    desc: 'Illegal dumping along public easements, overflowing park receptacles, and uncollected bulk waste.',
    count: '04 active'
  },
  {
    title: 'Streetlights & Power',
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/30 border-yellow-800/40',
    desc: 'Blacked-out lamps, exposed wiring, outages, or damaged utility poles across corridors.',
    count: '06 active'
  },
  {
    title: 'Water & Sewage',
    icon: Droplets,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/30 border-cyan-800/40',
    desc: 'Sub-surface pipe leaks, curb water ponding, flooding, or open manholes requiring immediate triage.',
    count: '05 active'
  },
];

const pipelineSteps = [
  {
    step: '01',
    title: 'Report',
    desc: 'A resident notes a damaged surface, pooling water, or broken lamp in under 60 seconds with location context.',
    icon: AlertCircle,
    color: 'text-sky-400',
    inputLabel: 'Input: Citizen Note'
  },
  {
    step: '02',
    title: 'Understand',
    desc: 'The report is structured by civic category, precinct boundary, and infrastructure domain for archival consistency.',
    icon: Layers,
    color: 'text-cyan-400',
    inputLabel: 'Structured Docket'
  },
  {
    step: '03',
    title: 'Connect',
    desc: 'Related reports within proximate geography and timeline are correlated to map the boundary of the condition.',
    icon: Network,
    color: 'text-indigo-400',
    inputLabel: 'Spatial Correlation'
  },
  {
    step: '04',
    title: 'Find Patterns',
    desc: 'Recurring issues become visible before major damage occurs, providing an evidence trail for local ward representatives.',
    icon: Flame,
    color: 'text-amber-400',
    inputLabel: 'Root Diagnostic'
  },
  {
    step: '05',
    title: 'Take Action',
    desc: 'Prioritized municipal review and coordinated repair team dispatch to treat the foundational problem.',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    inputLabel: 'Targeted Repair'
  },
];

export const HomePage: React.FC = () => {
  const { data: reportsData } = useReports({ limit: 100 });
  const { data: hotspotsData } = useHotspots();
  const [activeFilter, setActiveFilter] = useState<'all' | 'roads' | 'water' | 'lighting'>('all');

  const totalReports = reportsData?.items.length || 6;
  const activeHotspotsCount = hotspotsData?.hotspots?.filter((h: HotspotItem) => h.status === 'ACTIVE').length || 1;
  const unverifiedCount = reportsData?.items.filter(
    (r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW'
  ).length || 6;

  return (
    <div className="space-y-12">
      {/* Top Dossier / Status Ribbon */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-300 font-mono font-semibold uppercase tracking-wider text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Cycle 2025.04 Active
          </span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span className="hidden sm:inline font-mono uppercase tracking-wide text-slate-300">
            Public Civic Registry · Oak District · Ward 4
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-400 uppercase tracking-wider text-[11px]">
            Stewardship Ledger: Open for verification
          </span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 md:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Civic Intelligence Platform</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Small problems can reveal{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent underline decoration-cyan-500/40 underline-offset-8">
                bigger problems.
              </span>
            </h1>

            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-xl">
              Invisible City helps communities turn individual civic reports into a clearer picture of what is happening around them, addressing underlying root causes before they become systemic failures.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-lg shadow-cyan-950/60 transition-all hover:scale-[1.02]"
              >
                <span>Report an Issue</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#explore-map"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-medium transition-colors"
              >
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Explore Nearby Issues</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-cyan-400" />
                <span>Precinct-verified signals</span>
              </div>
              <span className="text-slate-700">•</span>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>No resident tracking</span>
              </div>
            </div>
          </div>

          {/* Right Cartographic Schematic Visual */}
          <div className="lg:col-span-6 relative">
            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 shadow-xl relative overflow-hidden space-y-4">
              {/* Architectural Title Block */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Corridor Cartography
                  </span>
                  <p className="text-sm font-semibold text-white">Oak Street & 4th Avenue Incline</p>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 font-bold uppercase tracking-wider border border-rose-800/60">
                  Priority Triage
                </span>
              </div>

              {/* Stylized Schematic Map Canvas */}
              <div className="relative h-60 bg-slate-950 rounded-lg p-4 overflow-hidden border border-slate-800">
                {/* Grid Matrix Lines */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#0284c7 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />

                {/* Street Network Drawings */}
                <svg className="absolute inset-0 w-full h-full text-slate-800" fill="none" viewBox="0 0 460 240">
                  <path d="M 40 40 L 420 40" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 40 180 L 420 180" stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 120 10 L 120 230" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />
                  <path d="M 320 10 L 320 230" stroke="#1e293b" strokeWidth="14" strokeLinecap="round" />

                  <path d="M 40 40 L 420 40" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 6" />
                  <path d="M 40 180 L 420 180" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 6" />
                  <path d="M 120 10 L 120 230" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 6" />
                  <path d="M 320 10 L 320 230" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 6" />

                  {/* Polygon Area of Influence */}
                  <polygon
                    points="120,40 190,55 240,110 160,140"
                    fill="#0284c7"
                    fillOpacity="0.15"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Hairline Connection Vectors */}
                  <line x1="120" y1="40" x2="190" y2="55" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="190" y1="55" x2="240" y2="110" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="240" y1="110" x2="160" y2="140" stroke="#38bdf8" strokeWidth="1.5" />
                  <line x1="160" y1="140" x2="120" y2="40" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Nodes */}
                  <circle cx="120" cy="40" r="5" fill="#38bdf8" />
                  <circle cx="120" cy="40" r="9" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

                  <circle cx="190" cy="55" r="5" fill="#38bdf8" />
                  <circle cx="190" cy="55" r="9" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

                  <circle cx="240" cy="110" r="5" fill="#38bdf8" />
                  <circle cx="240" cy="110" r="9" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

                  <circle cx="160" cy="140" r="5" fill="#38bdf8" />
                  <circle cx="160" cy="140" r="9" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                </svg>

                {/* Badges */}
                <span className="absolute top-2 left-28 text-[10px] font-mono text-slate-300 uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  4th Ave
                </span>
                <span className="absolute bottom-4 left-10 text-[10px] font-mono text-slate-300 uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                  Oak Street Corridor
                </span>

                <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-mono font-semibold text-cyan-300">Cluster #882 · 4 Connected Points</span>
                </div>
              </div>

              {/* Synthesized Notice Card */}
              <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Emerging Pattern Detected
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">Synthesis Verified</span>
                </div>
                <p className="text-xs font-medium text-slate-200 leading-snug">
                  Sub-surface water line leak inducing multi-point pavement subsidence along Oak Street Corridor.
                </p>
                <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                  <span>4 individual citizen reports unified</span>
                  <span className="font-semibold text-emerald-400">Municipal Escalation: Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY METRICS (REAL CIVIC DATA LAYOUT) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Community Reports */}
        <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Citizen Submissions
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
              Logged Current Cycle
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {totalReports < 10 ? `0${totalReports}` : totalReports}
            </span>
            <span className="text-sm text-slate-400">reports logged</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Distinct citizen observations logged across neighborhood blocks within the current active cycle.
          </p>
        </div>

        {/* Metric 2: Emerging Patterns */}
        <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
              Cross-Report Synthesis
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-cyan-950 text-cyan-300 font-mono font-bold uppercase tracking-wider border border-cyan-800/60">
              Priority Triage
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-cyan-400 font-mono">
              {activeHotspotsCount < 10 ? `0${activeHotspotsCount}` : activeHotspotsCount}
            </span>
            <span className="text-sm text-white font-medium">pattern active</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Corridors with recurring connected signals indicative of underlying structural erosion.
          </p>
        </div>

        {/* Metric 3: Under Review */}
        <div className="bg-slate-900/70 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Department Dispatch
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
              Active Review
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-white font-mono">
              {unverifiedCount < 10 ? `0${unverifiedCount}` : unverifiedCount}
            </span>
            <span className="text-sm text-slate-400">dispatches queued</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Submitted signals queued with municipal infrastructure authorities for on-site assessment.
          </p>
        </div>
      </section>

      {/* 3. CORE PRODUCT VALUE SECTION (ARCHITECTURAL COMPARISON) */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Architectural Comparison
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            From individual reports to emerging patterns
          </h2>
          <p className="text-sm text-slate-400">
            Instead of treating every complaint in isolation, Invisible City helps link related reports to address root causes before small cracks become major infrastructure failures.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Traditional 311 Reporting */}
          <div className="bg-slate-900/60 rounded-xl p-6 border border-slate-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-slate-500" />
                  <h3 className="font-semibold text-white text-base">Traditional 311 Reporting</h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Isolated Records
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each complaint exists inside its own bureaucratic ticket. Inspectors patch the surface repeatedly without noticing that multiple neighbors are reporting connected damage.
              </p>

              {/* Fragmented Tickets Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 font-bold">TICKET #101</div>
                  <div className="text-xs font-medium text-slate-200">Pothole on Oak</div>
                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Closed · Patched
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 font-bold">TICKET #108</div>
                  <div className="text-xs font-medium text-slate-200">Pavement Crack</div>
                  <div className="text-[11px] text-rose-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Closed · Sealed
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 font-bold">TICKET #115</div>
                  <div className="text-xs font-medium text-slate-200">Water Seep at Curb</div>
                  <div className="text-[11px] text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Review
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 font-bold">TICKET #122</div>
                  <div className="text-xs font-medium text-slate-200">Curb Sag & Dip</div>
                  <div className="text-[11px] text-amber-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Dispatched Alone
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 bg-slate-950/60 -mx-6 -mb-6 p-4 rounded-b-xl">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-200 font-semibold">System Blindness:</strong> Treated separately as temporary asphalt patches; underlying water erosion remains unaddressed until roadway collapse.
                </p>
              </div>
            </div>
          </div>

          {/* Invisible City Synthesis */}
          <div className="bg-slate-900/90 rounded-xl p-6 border-2 border-cyan-500/40 shadow-xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-cyan-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
              Connected Intelligence
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-semibold text-cyan-300 text-base">Invisible City Synthesis</h3>
                </div>
                <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                  Spatial Clustering
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nearby reports are cross-referenced across space, infrastructure maps, and community timelines to reveal the root phenomenon driving surface symptoms.
              </p>

              {/* Synthesized Pattern Box */}
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-wider font-semibold text-cyan-400">
                    Unified Corridor Dossier
                  </span>
                  <span className="text-slate-400 text-[11px]">4 Citizen Observations Linked</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800">
                    #101 Pothole
                  </span>
                  <span className="text-cyan-400 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800">
                    #108 Crack
                  </span>
                  <span className="text-cyan-400 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800">
                    #115 Water Seep
                  </span>
                  <span className="text-cyan-400 font-bold">+</span>
                  <span className="px-2 py-1 rounded bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800">
                    #122 Curb Sag
                  </span>
                </div>

                <div className="p-3 rounded bg-cyan-950/40 border-l-4 border-cyan-400 space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold">
                    Diagnosed Root Factor
                  </div>
                  <div className="text-xs font-semibold text-white">
                    Sub-surface main fissure washing away foundation underlayment
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 bg-emerald-950/30 -mx-6 -mb-6 p-4 rounded-b-xl">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-200 leading-relaxed">
                  <strong className="font-semibold text-white">Proactive Remediation:</strong> Dispatches combined water utility and road engineering team simultaneously. Avoids repetitive resurfacing costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (THE CIVIC PIPELINE) */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              The Civic Pipeline
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              How Invisible City connects signals
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">
            A continuous loop from individual neighbor observation to municipal resolution and community verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {pipelineSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-slate-900/60 rounded-xl p-5 border border-slate-800 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-extrabold text-slate-600 group-hover:text-cyan-400 transition-colors">
                      {step.step}
                    </span>
                    <Icon className={`h-5 w-5 ${step.color} transition-transform group-hover:scale-110`} />
                  </div>
                  <h3 className="font-bold text-white text-sm tracking-tight">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  {step.inputLabel}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. LOCAL OBSERVABILITY MAP PREVIEW */}
      <section className="space-y-6" id="explore-map">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
              Local Observability
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              See what's happening around you
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Explore reported issues and see where problems may be coming together in your community.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === 'all'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Active ({totalReports})
            </button>
            <button
              onClick={() => setActiveFilter('roads')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === 'roads'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Potholes & Roads
            </button>
            <button
              onClick={() => setActiveFilter('water')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === 'water'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Water & Drainage
            </button>
            <button
              onClick={() => setActiveFilter('lighting')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                activeFilter === 'lighting'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Lighting
            </button>
          </div>
        </div>

        {/* Map Preview Interface */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-2 relative overflow-hidden">
          <div className="relative w-full h-[420px] bg-slate-950 rounded-lg overflow-hidden border border-slate-850">
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 1000 500">
              <line x1="50" y1="120" x2="950" y2="120" stroke="#1e293b" strokeWidth="24" />
              <line x1="50" y1="360" x2="950" y2="360" stroke="#1e293b" strokeWidth="24" />
              <line x1="280" y1="20" x2="280" y2="480" stroke="#1e293b" strokeWidth="28" />
              <line x1="720" y1="20" x2="720" y2="480" stroke="#1e293b" strokeWidth="28" />

              <line x1="120" y1="20" x2="120" y2="480" stroke="#0f172a" strokeWidth="16" />
              <line x1="500" y1="20" x2="500" y2="480" stroke="#0f172a" strokeWidth="20" />
              <line x1="880" y1="20" x2="880" y2="480" stroke="#0f172a" strokeWidth="16" />

              <line x1="50" y1="120" x2="950" y2="120" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" />
              <line x1="50" y1="360" x2="950" y2="360" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" />
              <line x1="280" y1="20" x2="280" y2="480" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" />
              <line x1="720" y1="20" x2="720" y2="480" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 8" />

              {/* Hotspot Polygon Overlay */}
              <polygon
                points="260,200 480,210 520,270 290,265"
                fill="#0284c7"
                fillOpacity="0.15"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              <line x1="300" y1="225" x2="360" y2="240" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="360" y1="240" x2="420" y2="230" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="420" y1="230" x2="470" y2="250" stroke="#38bdf8" strokeWidth="1.5" />
            </svg>

            {/* Street Cartographic Labels */}
            <span className="absolute top-[96px] left-16 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              Pine Street
            </span>
            <span className="absolute top-[216px] left-16 text-[10px] font-mono font-semibold text-cyan-300 uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              Oak Street
            </span>
            <span className="absolute top-[336px] left-16 text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              Market Street
            </span>

            {/* Pins */}
            <div className="absolute top-[215px] left-[295px]">
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg border border-slate-950">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </div>
            </div>
            <div className="absolute top-[230px] left-[355px]">
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg border border-slate-950">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>
            <div className="absolute top-[220px] left-[415px]">
              <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center shadow-lg border border-slate-950">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Interactive Hotspot Overlay Card */}
            <div className="absolute bottom-6 right-6 sm:max-w-md w-[calc(100%-3rem)] bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-2xl space-y-2">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                    Possible Hotspot
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Oak Street Area · 4 Reports</span>
              </div>
              <p className="text-xs text-slate-300">
                Multiple reports of asphalt sinking and persistent pooling water along the south curb of Oak St between 3rd & 4th Ave.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">First reported 3 days ago</span>
                <Link
                  to="/map"
                  className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:text-cyan-300 hover:underline"
                >
                  <span>View Connected Reports</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Map Legend Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800 shadow-md flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span className="text-[11px] text-slate-200 font-mono">Emerging Hotspot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-500"></span>
                <span className="text-[11px] text-slate-400 font-mono">Isolated Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT CAN YOU REPORT (CIVIC SCOPE CATEGORIES) */}
      <section className="space-y-6">
        <div className="max-w-2xl space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-cyan-400">
            Civic Scope
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">What can you report?</h2>
          <p className="text-sm text-slate-400">
            Public spaces belong to all of us. Invisible City accepts observations across four foundational infrastructure domains.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link
                key={idx}
                to="/report"
                className={`rounded-xl border ${cat.bg} p-5 flex flex-col justify-between space-y-4 group hover:border-slate-700 transition-all hover:scale-[1.01]`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-lg bg-slate-900/90 ${cat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400">
                      {cat.count}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-base group-hover:text-cyan-300 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:text-cyan-300">
                  <span>Log an observation</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};


