import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report } from '../types/report';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MapContainer } from '../components/map/MapContainer';
import {
  PlusCircle,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  FileText,
  Wrench,
  Droplets,
  Zap,
  Trash2,
  ExternalLink,
  Check
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: reportsData, isLoading: reportsLoading } = useReports({ limit: 50 });
  const { data: hotspotsData, isLoading: hotspotsLoading } = useHotspots();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Real Database Metrics
  const totalReportsCount = reportsData?.total ?? reportsData?.items?.length ?? 0;
  const activeIssuesCount = reportsData?.items
    ? reportsData.items.filter((r: Report) => r.status === 'OPEN' || r.status === 'IN_PROGRESS' || r.status === 'VERIFIED').length
    : (reportsData?.total ?? 0);
  const resolvedCount = reportsData?.items
    ? reportsData.items.filter((r: Report) => r.status === 'RESOLVED').length
    : 0;

  // Format strings (while loading show "—", once loaded display real string value)
  const totalReportsStr = reportsLoading ? '—' : String(totalReportsCount);
  const activeIssuesStr = reportsLoading ? '—' : String(activeIssuesCount);
  const resolvedStr = reportsLoading ? '—' : String(resolvedCount);

  // Real database reports filtered for preview grid
  const allReports = reportsData?.items || [];
  const filteredReports = allReports.filter((report) => {
    if (activeCategory === 'roads') return report.category === 'POTHOLE';
    if (activeCategory === 'water') return report.category === 'WATER_LEAK';
    if (activeCategory === 'lighting') return report.category === 'STREETLIGHT';
    if (activeCategory === 'waste') return report.category === 'GARBAGE';
    return true;
  });

  return (
    <div className="flex flex-col w-full bg-[#fcf9f2] font-sans text-[#1c1c18]">
      {/* ==================================================
          1. HERO SECTION & CONCEPT STATEMENT (DESKTOP min-h-[70vh])
         ================================================== */}
      <section className="w-full py-20 lg:py-28 border-b border-[#e5e2da] min-h-[70vh] flex flex-col justify-center">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12 w-full">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb] text-xs font-semibold">
              <Sparkles className="h-4 w-4 text-[#2f685f]" />
              <span>Civic Platform & Signal Intelligence</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#1c1c18] tracking-tight font-headline leading-[1.1]">
              Make your city <span className="text-[#06291b] underline decoration-[#2f685f]/40 underline-offset-8">visible.</span>
            </h1>

            <p className="text-base sm:text-xl text-[#484742] leading-relaxed max-w-2xl font-sans">
              Report local problems. Let AI analyze them. Track what happens next.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link to="/report">
                <Button size="lg" className="w-full sm:w-auto px-8 py-3.5 text-sm" leftIcon={<PlusCircle className="h-5 w-5" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Report an issue
                </Button>
              </Link>
              <Link to="/map">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto px-8 py-3.5 text-sm" leftIcon={<Compass className="h-5 w-5 text-[#2f685f]" />}>
                  Explore the city
                </Button>
              </Link>
            </div>
          </div>

          {/* HERO VISUAL FLOW STRIP */}
          <div className="p-6 lg:p-8 rounded-3xl bg-[#f1eee7] border border-[#e5e2da] shadow-xs w-full">
            <div className="text-xs font-bold text-[#787770] uppercase tracking-wider mb-4 font-headline">
              The Complete Civic Flow
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs font-semibold text-[#1c1c18]">
              <div className="flex items-center space-x-2.5 bg-[#fcf9f2] p-4 rounded-2xl border border-[#e5e2da]">
                <span className="text-lg">📍</span>
                <span>Spot a problem</span>
              </div>
              <div className="flex items-center space-x-2.5 bg-[#fcf9f2] p-4 rounded-2xl border border-[#e5e2da]">
                <span className="text-lg">📷</span>
                <span>Report it</span>
              </div>
              <div className="flex items-center space-x-2.5 bg-[#fcf9f2] p-4 rounded-2xl border border-[#e5e2da]">
                <span className="text-lg">✦</span>
                <span className="text-[#06291b]">AI analyzes</span>
              </div>
              <div className="flex items-center space-x-2.5 bg-[#fcf9f2] p-4 rounded-2xl border border-[#e5e2da]">
                <span className="text-lg">✓</span>
                <span>City verifies</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center space-x-2.5 bg-[#06291b] text-white p-4 rounded-2xl">
                <span className="text-lg">→</span>
                <span>Issue resolves</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. LIVE CITY SNAPSHOT (REAL DATABASE METRICS)
         ================================================== */}
      <section className="w-full bg-[#f1eee7] border-b border-[#e5e2da] py-16 lg:py-20">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-8 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#787770] font-headline">
              Live City Snapshot
            </h2>
            <span className="text-xs text-[#787770] font-mono">Real database records</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full">
            <Card variant="surface" className="p-6 lg:p-8 space-y-3 min-h-[160px] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787770] font-headline">
                Reports
              </span>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c1c18] font-headline">
                {totalReportsStr}
              </div>
              <p className="text-xs text-[#787770]">Total community observations</p>
            </Card>

            <Card variant="surface" className="p-6 lg:p-8 space-y-3 min-h-[160px] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-headline">
                Active Issues
              </span>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-amber-900 font-headline">
                {activeIssuesStr}
              </div>
              <p className="text-xs text-[#787770]">Under review or in progress</p>
            </Card>

            <Card variant="surface" className="p-6 lg:p-8 space-y-3 min-h-[160px] flex flex-col justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#06291b] font-headline">
                Resolved
              </span>
              <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#06291b] font-headline">
                {resolvedStr}
              </div>
              <p className="text-xs text-[#787770]">Successfully addressed</p>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. CENTRAL FEATURE: HOW IT WORKS (5-STEP PROCESS)
         ================================================== */}
      <section className="w-full py-20 lg:py-28 border-b border-[#e5e2da] bg-[#fcf9f2]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-12 w-full">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              How Invisible City Works
            </h2>
            <p className="text-xs sm:text-sm text-[#787770]">
              From neighborhood observation to verified resolution in five simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 w-full">
            <div className="p-6 rounded-2xl bg-[#f1eee7] border border-[#e5e2da] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-extrabold text-[#06291b]">01</div>
                <h3 className="text-sm font-extrabold text-[#1c1c18] font-headline uppercase">SPOT</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  See something wrong in your neighborhood.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#f1eee7] border border-[#e5e2da] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-extrabold text-[#06291b]">02</div>
                <h3 className="text-sm font-extrabold text-[#1c1c18] font-headline uppercase">REPORT</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Add location, photo evidence, and details.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#e1f3ee] border border-[#a2d8cb] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-extrabold text-[#06291b]">03</div>
                <h3 className="text-sm font-extrabold text-[#06291b] font-headline uppercase">ANALYZE</h3>
                <p className="text-xs text-[#06291b] leading-relaxed">
                  AI categorizes and assesses severity instantly.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#f1eee7] border border-[#e5e2da] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-mono font-extrabold text-[#06291b]">04</div>
                <h3 className="text-sm font-extrabold text-[#1c1c18] font-headline uppercase">VERIFY</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Municipal reviewers validate the report.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#06291b] text-white space-y-3 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div className="space-y-3">
                <div className="text-xs font-mono font-extrabold text-[#8ac9be]">05</div>
                <h3 className="text-sm font-extrabold text-white font-headline uppercase">RESOLVE</h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Track progress through final completion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. AI VALUE DEMONSTRATION BLOCK
         ================================================== */}
      <section className="w-full py-20 lg:py-28 border-b border-[#e5e2da] bg-[#f1eee7]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10 w-full">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#06291b] uppercase tracking-wider font-headline">
              <Sparkles className="h-4 w-4 text-[#2f685f]" />
              <span>AI Classification Signal</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              Instant AI Analysis
            </h2>
            <p className="text-xs text-[#787770]">
              Every submitted report is automatically processed to determine category, severity, and urgency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch w-full">
            {/* Citizen Input Mock */}
            <div className="lg:col-span-6 p-8 rounded-3xl bg-[#fcf9f2] border border-[#e5e2da] space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#787770] font-headline flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-[#2f685f]" />
                  <span>Citizen Input</span>
                </div>
                <p className="text-sm text-[#1c1c18] font-medium leading-relaxed italic bg-[#f1eee7] p-5 rounded-2xl border border-[#e5e2da]">
                  "Large pothole near the main road causing severe traffic slowdowns and rim damage to cars during evening rain."
                </p>
              </div>
            </div>

            {/* AI Output Card */}
            <div className="lg:col-span-6 p-8 rounded-3xl bg-[#06291b] text-white space-y-6 shadow-md flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8ac9be] font-headline flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Structured AI Output</span>
                </span>
                <span className="text-xs font-mono bg-[#8ac9be]/20 text-[#8ac9be] px-3 py-1 rounded border border-[#8ac9be]/30">
                  94% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs">
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-headline">Category</div>
                  <div className="font-bold text-white text-sm font-headline">Roads & Potholes</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-headline">Severity</div>
                  <div className="font-bold text-amber-400 text-sm font-headline">High Severity</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-headline">Priority Score</div>
                  <div className="font-bold text-[#8ac9be] font-mono text-lg">82 / 100</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-headline">Suggested Action</div>
                  <div className="font-bold text-white text-sm font-headline">Dispatch Road Crew</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. CITY MAP PREVIEW SECTION
         ================================================== */}
      <section className="w-full py-20 lg:py-28 border-b border-[#e5e2da] bg-[#fcf9f2]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10 w-full">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
                Where are problems happening?
              </h2>
              <p className="text-xs text-[#787770]">Real-time location map of community reports</p>
            </div>

            <Link to="/map">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Explore the map →
              </Button>
            </Link>
          </div>

          <div className="h-[420px] lg:h-[480px] w-full rounded-3xl overflow-hidden border border-[#e5e2da] shadow-xs relative">
            <MapContainer
              reports={allReports.slice(0, 25)}
              center={[12.9716, 77.5946]}
              zoom={12}
              className="h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          6. ISSUE CATEGORIES
         ================================================== */}
      <section className="w-full py-20 lg:py-28 border-b border-[#e5e2da] bg-[#f1eee7]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 space-y-10 w-full">
          <div className="space-y-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              Supported Categories
            </h2>
            <p className="text-xs text-[#787770]">Report problems across infrastructure and municipal services</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 w-full text-xs font-bold font-headline text-[#1c1c18]">
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <MapPin className="h-6 w-6 text-[#2f685f]" />
              <span>Roads</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <Droplets className="h-6 w-6 text-[#2f685f]" />
              <span>Water</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <Zap className="h-6 w-6 text-[#2f685f]" />
              <span>Lighting</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <Trash2 className="h-6 w-6 text-[#2f685f]" />
              <span>Waste</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <Wrench className="h-6 w-6 text-[#2f685f]" />
              <span>Infrastructure</span>
            </div>
            <div className="p-6 rounded-2xl bg-[#fcf9f2] border border-[#e5e2da] flex flex-col items-center justify-center space-y-3 text-center hover:border-[#06291b] transition-colors">
              <Sparkles className="h-6 w-6 text-[#2f685f]" />
              <span>Other</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. FINAL HOME CALL TO ACTION
         ================================================== */}
      <section className="w-full py-20 lg:py-28 bg-[#06291b] text-white">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6 w-full">
          <h2 className="text-3xl sm:text-5xl font-extrabold font-headline tracking-tight max-w-3xl mx-auto">
            See something that needs attention?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-sans leading-relaxed">
            Report an issue in your neighborhood. Help city teams locate, prioritize, and resolve problems faster.
          </p>
          <div className="pt-2">
            <Link to="/report">
              <Button size="lg" variant="accent" className="px-8 py-3.5 text-sm" leftIcon={<PlusCircle className="h-5 w-5" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                Report an issue →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
