import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report } from '../types/report';
import { HotspotItem } from '../types/intelligence';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  PlusCircle,
  Compass,
  CheckCircle2,
  ShieldCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  FileText,
  Layers,
  Wrench,
  Activity,
  CheckCheck,
  ExternalLink,
  Search
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: reportsData, isLoading: reportsLoading } = useReports({ limit: 100 });
  const { data: hotspotsData, isLoading: hotspotsLoading } = useHotspots();
  const [activeFilter, setActiveFilter] = useState<'all' | 'roads' | 'water' | 'lighting' | 'sanitation'>('all');

  // Real Database Metrics
  const totalReportsCount = reportsData?.total ?? reportsData?.items?.length ?? 0;
  const activeHotspotsCount = hotspotsData?.hotspots
    ? hotspotsData.hotspots.filter((h: HotspotItem) => h.status === 'ACTIVE').length
    : (hotspotsData?.count ?? 0);
  const unverifiedCount = reportsData?.items
    ? reportsData.items.filter(
        (r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW'
      ).length
    : 0;
  const resolvedCount = reportsData?.items
    ? reportsData.items.filter((r: Report) => r.status === 'RESOLVED').length
    : 0;

  // Format strings (while loading show "—", once loaded display real value)
  const totalReportsStr = reportsLoading ? '—' : String(totalReportsCount);
  const activeHotspotsStr = hotspotsLoading ? '—' : String(activeHotspotsCount);
  const unverifiedStr = reportsLoading ? '—' : String(unverifiedCount);
  const resolvedStr = reportsLoading ? '—' : String(resolvedCount);

  // Filter real database reports for activity section
  const allReports = reportsData?.items || [];
  const filteredReports = allReports.filter((report) => {
    if (activeFilter === 'roads') return report.category === 'POTHOLE';
    if (activeFilter === 'water') return report.category === 'WATER_LEAK';
    if (activeFilter === 'lighting') return report.category === 'STREETLIGHT';
    if (activeFilter === 'sanitation') return report.category === 'GARBAGE';
    return true;
  });

  const topHotspot = hotspotsData?.hotspots && hotspotsData.hotspots.length > 0
    ? hotspotsData.hotspots[0]
    : null;

  return (
    <div className="flex flex-col w-full bg-[#fcf9f2] font-sans text-[#1c1c18]">
      {/* ==================================================
          1. HERO SECTION
         ================================================== */}
      <section className="w-full py-16 sm:py-20 lg:py-24 border-b border-[#e5e2da]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb] text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5 text-[#2f685f]" />
                <span>Civic Technology & Signal Intelligence</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#1c1c18] tracking-tight font-headline leading-[1.15] text-balance">
                See what's happening around you.{' '}
                <span className="text-[#06291b] underline decoration-[#2f685f]/40 underline-offset-8">
                  Help make your city better.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-[#484742] max-w-2xl leading-relaxed font-sans">
                Invisible City connects community observations to surface underlying problems, helping neighborhood teams address root causes before small cracks become major infrastructure failures.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 w-full sm:w-auto">
                <Link to="/report">
                  <Button size="lg" className="w-full sm:w-auto" leftIcon={<PlusCircle className="h-5 w-5" />} rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Report an Issue
                  </Button>
                </Link>
                <Link to="/map">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto" leftIcon={<Compass className="h-5 w-5 text-[#2f685f]" />}>
                    Explore the City
                  </Button>
                </Link>
              </div>

              {/* Value Props */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#e5e2da] w-full text-[#787770] text-xs font-medium">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#2f685f]" />
                  <span>Verified community signals</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#2f685f]" />
                  <span>Privacy-first reporting</span>
                </div>
              </div>
            </div>

            {/* Right Column: Platform Intelligence Snapshot */}
            <div className="lg:col-span-5 relative w-full">
              <Card variant="container" className="space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#d0cdc5]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#787770] font-headline">
                      Live City Intelligence
                    </span>
                    <h3 className="text-sm font-bold text-[#1c1c18] font-headline">
                      {topHotspot ? topHotspot.title : 'Geographic Signal Overview'}
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">
                    {topHotspot ? 'Pattern Detected' : 'Active Monitoring'}
                  </span>
                </div>

                <div className="bg-[#fcf9f2] rounded-xl p-5 border border-[#e5e2da] space-y-3">
                  {topHotspot ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[#06291b] font-bold">
                        <span className="flex items-center space-x-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#2f685f]" />
                          <span>Active Pattern Cluster</span>
                        </span>
                        <span className="font-mono text-[11px] text-[#787770]">{topHotspot.report_count} linked reports</span>
                      </div>
                      <p className="text-[#484742] leading-relaxed">
                        Multiple nearby resident reports indicate connected root causes in this area.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-center py-4">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb] mx-auto">
                        <Activity className="h-5 w-5 text-[#2f685f]" />
                      </div>
                      <h4 className="text-xs font-bold text-[#1c1c18] font-headline">Signal Pattern Clustering</h4>
                      <p className="text-xs text-[#787770] leading-relaxed max-w-xs mx-auto">
                        Reports are automatically linked by geographic proximity to reveal underlying city issues.
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#e5e2da] flex items-center justify-between text-xs">
                    <span className="text-[#787770]">Database Status</span>
                    <span className="font-bold text-[#06291b] font-mono">
                      {reportsLoading ? 'Loading metrics...' : `${totalReportsCount} platform reports`}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. LIVE CITY SNAPSHOT (METRICS)
         ================================================== */}
      <section className="w-full bg-[#f1eee7] border-b border-[#e5e2da] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#787770] font-headline">
              Live Platform Snapshot
            </h2>
            <span className="text-xs text-[#787770] font-mono">Real-time database metrics</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {/* Metric 1 */}
            <Card variant="surface" className="flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787770] font-headline">
                Total Reports
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c1c18] font-headline">{totalReportsStr}</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Total observations submitted by residents.
              </p>
            </Card>

            {/* Metric 2 */}
            <Card variant="surface" className="flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#06291b] font-headline">
                Active Patterns
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#06291b] font-headline">{activeHotspotsStr}</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Clusters of connected reports requiring coordinate review.
              </p>
            </Card>

            {/* Metric 3 */}
            <Card variant="surface" className="flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787770] font-headline">
                Under Review
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-amber-900 font-headline">{unverifiedStr}</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Submitted signals in municipal triage queue.
              </p>
            </Card>

            {/* Metric 4 */}
            <Card variant="surface" className="flex flex-col justify-between space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#787770] font-headline">
                Resolved Issues
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#06291b] font-headline">{resolvedStr}</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Infrastructure hazards addressed by local teams.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HOW IT WORKS (MINIMAL PROCESS)
         ================================================== */}
      <section className="w-full py-16 sm:py-20 border-b border-[#e5e2da] bg-[#fcf9f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              How Invisible City Works
            </h2>
            <p className="text-xs sm:text-sm text-[#787770]">
              Simple, transparent civic reporting designed for neighborhood impact.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="space-y-3 p-5 rounded-2xl bg-[#f1eee7] border border-[#e5e2da]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#06291b] font-mono">01</span>
                <Search className="h-5 w-5 text-[#2f685f]" />
              </div>
              <h3 className="text-base font-bold text-[#1c1c18] font-headline">Spot</h3>
              <p className="text-xs text-[#484742] leading-relaxed">
                Notice a broken streetlight, pothole, or drainage issue in your area.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-3 p-5 rounded-2xl bg-[#f1eee7] border border-[#e5e2da]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#06291b] font-mono">02</span>
                <FileText className="h-5 w-5 text-[#2f685f]" />
              </div>
              <h3 className="text-base font-bold text-[#1c1c18] font-headline">Report</h3>
              <p className="text-xs text-[#484742] leading-relaxed">
                Submit report details, pinpoint location on the map, and attach evidence.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-3 p-5 rounded-2xl bg-[#f1eee7] border border-[#e5e2da]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#06291b] font-mono">03</span>
                <Activity className="h-5 w-5 text-[#2f685f]" />
              </div>
              <h3 className="text-base font-bold text-[#1c1c18] font-headline">Track</h3>
              <p className="text-xs text-[#484742] leading-relaxed">
                Follow report status updates and see connected pattern clusters.
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-3 p-5 rounded-2xl bg-[#f1eee7] border border-[#06291b]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#06291b] font-mono">04</span>
                <Wrench className="h-5 w-5 text-[#06291b]" />
              </div>
              <h3 className="text-base font-bold text-[#06291b] font-headline">Improve</h3>
              <p className="text-xs text-[#484742] leading-relaxed">
                Municipal teams verify and fix root causes to keep public spaces safe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. CITY ACTIVITY & MAP PREVIEW
         ================================================== */}
      <section className="w-full py-16 sm:py-20 border-b border-[#e5e2da]" id="explore-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
                Current Community Activity
              </h2>
              <p className="text-xs sm:text-sm text-[#787770]">
                Explore recent reports and verified pattern clusters across neighborhood streets.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                All ({totalReportsCount})
              </button>
              <button
                onClick={() => setActiveFilter('roads')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'roads'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Potholes & Roads
              </button>
              <button
                onClick={() => setActiveFilter('water')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'water'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Water & Sewage
              </button>
              <button
                onClick={() => setActiveFilter('lighting')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'lighting'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Streetlights & Power
              </button>
              <button
                onClick={() => setActiveFilter('sanitation')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'sanitation'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Garbage & Waste
              </button>
            </div>
          </div>

          {/* Real Data Reports Grid / Intentional Empty State */}
          {reportsLoading ? (
            <div className="p-12 text-center text-[#787770] space-y-3 bg-[#f1eee7] rounded-2xl border border-[#e5e2da]">
              <div className="h-6 w-6 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs">Loading community activity...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="No reports found in this category"
              description="Be the first to report an issue in your area to surface civic insights."
              action={
                <Link to="/report">
                  <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                    Report an Issue
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.slice(0, 6).map((report) => (
                <Card
                  key={report.id}
                  variant="surface"
                  className="hover:border-[#d0cdc5] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#f1eee7] text-[#484742] uppercase border border-[#e5e2da]">
                        {report.category.replace('_', ' ')}
                      </span>
                      <StatusBadge status={report.status} size="sm" />
                    </div>

                    <h3 className="font-bold text-sm text-[#1c1c18] font-headline leading-snug line-clamp-1">
                      {report.title}
                    </h3>
                    <p className="text-xs text-[#484742] line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#e5e2da] flex items-center justify-between text-[11px] text-[#787770]">
                    <div className="flex items-center space-x-1 truncate max-w-[70%]">
                      <MapPin className="h-3.5 w-3.5 text-[#2f685f] flex-shrink-0" />
                      <span className="truncate">{report.address || `${report.latitude}, ${report.longitude}`}</span>
                    </div>
                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] hover:underline"
                    >
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Map Exploration Navigation Bar */}
          <div className="pt-4 flex items-center justify-between border-t border-[#e5e2da]">
            <span className="text-xs text-[#787770]">
              Showing {filteredReports.length} of {totalReportsCount} active reports
            </span>
            <Link to="/map">
              <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
                Open Interactive Map View
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. SUPPORTED CIVIC CATEGORIES
         ================================================== */}
      <section className="w-full py-16 sm:py-20 border-b border-[#e5e2da] bg-[#f1eee7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              Supported Issue Categories
            </h2>
            <p className="text-xs sm:text-sm text-[#484742]">
              Report problems affecting public transit roads, utilities, sanitation, and neighborhood safety.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="surface" className="flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <MapPin className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Potholes & Roads</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Damaged asphalt, pavement cracks, sunken trenches, or transit hazards.
                </p>
              </div>
              <Link to="/report" className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] group-hover:underline">
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card variant="surface" className="flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Wrench className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Garbage & Sanitation</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Illegal dumping along easements, uncollected bins, or bulk debris.
                </p>
              </div>
              <Link to="/report" className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] group-hover:underline">
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card variant="surface" className="flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Sparkles className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Streetlights & Power</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Dark lamps, damaged poles, exposed wiring, or neighborhood outages.
                </p>
              </div>
              <Link to="/report" className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] group-hover:underline">
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>

            <Card variant="surface" className="flex flex-col justify-between space-y-4 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Activity className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Water & Sewage</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Water main seepage, street ponding, clogged drains, or manhole hazards.
                </p>
              </div>
              <Link to="/report" className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] group-hover:underline">
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
