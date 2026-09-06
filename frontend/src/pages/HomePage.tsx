import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report, ReportCategory } from '../types/report';
import { HotspotItem } from '../types/intelligence';
import {
  PlusCircle,
  Compass,
  ArrowRight,
  MapPin,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FileText,
  Layers,
  Activity,
  Wrench,
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const {
    data: reportsData,
    isLoading: isReportsLoading,
    isError: isReportsError,
    refetch: refetchReports
  } = useReports({ limit: 100 });

  const {
    data: hotspotsData,
    isLoading: isHotspotsLoading,
    isError: isHotspotsError,
    refetch: refetchHotspots
  } = useHotspots();

  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Real backend metrics
  const totalReports = reportsData?.total ?? reportsData?.items?.length ?? 0;
  const activeHotspotsCount = hotspotsData?.hotspots?.filter((h: HotspotItem) => h.status === 'ACTIVE')?.length ?? 0;
  const unverifiedCount = reportsData?.items?.filter(
    (r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW'
  )?.length ?? 0;

  // Filtered real reports for map preview
  const rawReports = reportsData?.items || [];
  const filteredReports = activeFilter === 'all'
    ? rawReports
    : rawReports.filter((r: Report) => {
        if (activeFilter === 'POTHOLE') return r.category === 'POTHOLE' || r.category === 'DAMAGED_INFRASTRUCTURE';
        if (activeFilter === 'GARBAGE') return r.category === 'GARBAGE';
        if (activeFilter === 'STREETLIGHT') return r.category === 'STREETLIGHT';
        if (activeFilter === 'WATER_LEAK') return r.category === 'WATER_LEAK';
        return true;
      });

  const isLoading = isReportsLoading || isHotspotsLoading;
  const isError = isReportsError || isHotspotsError;

  const handleRefetch = () => {
    refetchReports();
    refetchHotspots();
  };

  return (
    <div className="flex flex-col w-full bg-[#faf8f5] font-sans text-[#191817] pt-16">
      {/* ==================================================
          1. HERO SECTION — URBAN SIGNAL ASYMMETRIC LAYOUT
         ================================================== */}
      <section className="w-full py-16 lg:py-24 border-b border-[#e2ded6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column (~52%) */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#f3efea] border border-[#e2ded6] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#66645e]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9531e]"></span>
                <span>Civic Information System</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#191817] tracking-tight font-headline leading-[1.1] text-balance">
                Small problems can reveal{' '}
                <span className="text-[#d9531e] underline decoration-[#d9531e]/30 underline-offset-8">
                  bigger problems.
                </span>
              </h1>

              <p className="text-base text-[#474540] max-w-xl leading-relaxed">
                Report everyday city problems and help uncover patterns that individual reports might otherwise miss.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-md bg-[#d9531e] hover:bg-[#c44715] text-white font-headline text-sm font-semibold transition-all shadow-xs"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#explore-map"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-md bg-[#f3efea] hover:bg-[#eae6e0] text-[#191817] border border-[#d6d1c7] font-headline text-sm font-semibold transition-colors"
                >
                  <Compass className="h-4 w-4 text-[#66645e]" />
                  <span>Explore the Map</span>
                </a>
              </div>
            </div>

            {/* Right Column (~48%) Minimal Conceptual Graphic */}
            <div className="lg:col-span-5 relative w-full">
              <div className="bg-[#ffffff] rounded-lg border border-[#e2ded6] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2ded6] text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-[#66645e] text-[10px]">
                    CONCEPT ILLUSTRATION: HOW SIGNALS CONNECT
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f3efea] border border-[#e2ded6] text-[10px] font-mono text-[#191817]">
                    SYSTEM MODEL
                  </span>
                </div>

                {/* Minimal Grid Schematic */}
                <div className="relative h-60 bg-[#faf8f5] rounded border border-[#e2ded6] p-4 overflow-hidden">
                  {/* Subtle Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#191817 1px, transparent 1px)',
                      backgroundSize: '24px 24px'
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full text-[#e2ded6]" fill="none" viewBox="0 0 400 240">
                    <line x1="50" y1="60" x2="350" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="50" y1="180" x2="350" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="120" y1="20" x2="120" y2="220" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="280" y1="20" x2="280" y2="220" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                    
                    {/* Connecting Signal Polyline */}
                    <path
                      d="M 120 70 L 160 110 L 220 140 L 280 170"
                      stroke="#d9531e"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </svg>

                  {/* Signal Pins */}
                  <div className="absolute top-[62px] left-[112px]" title="Signal 01: Pavement crack">
                    <span className="w-4 h-4 rounded-full bg-[#191817] flex items-center justify-center text-white text-[9px] font-mono font-bold">1</span>
                  </div>
                  <div className="absolute top-[102px] left-[152px]" title="Signal 02: Pothole">
                    <span className="w-4 h-4 rounded-full bg-[#191817] flex items-center justify-center text-white text-[9px] font-mono font-bold">2</span>
                  </div>
                  <div className="absolute top-[132px] left-[212px]" title="Signal 03: Water seepage">
                    <span className="w-4 h-4 rounded-full bg-[#d9531e] flex items-center justify-center text-white text-[9px] font-mono font-bold">3</span>
                  </div>
                  <div className="absolute top-[162px] left-[272px]" title="Signal 04: Curb dip">
                    <span className="w-4 h-4 rounded-full bg-[#191817] flex items-center justify-center text-white text-[9px] font-mono font-bold">4</span>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#ffffff] border border-[#e2ded6] px-3 py-1 rounded text-[10px] font-mono text-[#66645e]">
                    Connected Cluster Concept
                  </div>
                </div>

                <p className="text-xs text-[#66645e] leading-relaxed pt-1">
                  Individual neighborhood reports are cross-referenced spatially to reveal shared root causes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. REAL METRICS — EDITORIAL MINIMALIST FORMAT
         ================================================== */}
      <section className="w-full bg-[#f3efea] border-b border-[#e2ded6] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            /* Loading State */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="space-y-3">
                  <div className="h-4 w-28 bg-[#e2ded6] rounded"></div>
                  <div className="h-12 w-20 bg-[#e2ded6] rounded"></div>
                  <div className="h-4 w-48 bg-[#e2ded6] rounded"></div>
                </div>
              ))}
            </div>
          ) : isError ? (
            /* Error State */
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
              <AlertCircle className="h-6 w-6 text-[#d9531e]" />
              <p className="text-sm font-medium text-[#191817]">Unable to load city insights.</p>
              <button
                onClick={handleRefetch}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#191817] text-white text-xs font-semibold hover:bg-[#d9531e] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : (
            /* Real Data Presentation */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#e2ded6]">
              {/* Metric 1 */}
              <div className="pt-4 md:pt-0 md:pr-6 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#66645e]">
                  COMMUNITY REPORTS
                </span>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#191817] font-mono tracking-tight">
                  {totalReports < 10 ? `0${totalReports}` : totalReports}
                </div>
                <p className="text-xs text-[#66645e] leading-relaxed">
                  Distinct resident observations logged across neighborhood streets.
                </p>
              </div>

              {/* Metric 2 */}
              <div className="pt-4 md:pt-0 md:px-6 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#d9531e]">
                  POSSIBLE HOTSPOTS
                </span>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#d9531e] font-mono tracking-tight">
                  {activeHotspotsCount < 10 ? `0${activeHotspotsCount}` : activeHotspotsCount}
                </div>
                <p className="text-xs text-[#66645e] leading-relaxed">
                  Clusters of connected signals indicating potential underlying issues.
                </p>
              </div>

              {/* Metric 3 */}
              <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#66645e]">
                  UNDER REVIEW
                </span>
                <div className="text-4xl lg:text-5xl font-extrabold text-[#191817] font-mono tracking-tight">
                  {unverifiedCount < 10 ? `0${unverifiedCount}` : unverifiedCount}
                </div>
                <p className="text-xs text-[#66645e] leading-relaxed">
                  Submitted signals queued for verification and municipal assessment.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          3. CORE PRODUCT STORY
         ================================================== */}
      <section className="w-full py-16 lg:py-24 border-b border-[#e2ded6] bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#66645e]">
              PRODUCT CONCEPT
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#191817] font-headline leading-tight tracking-tight">
              One report is an incident.<br />
              Several connected reports can reveal a pattern.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step A */}
            <div className="bg-[#ffffff] rounded-lg p-6 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#66645e]">
                  STAGE 1: ISOLATED REPORTS
                </div>
                <div className="h-20 bg-[#faf8f5] rounded border border-[#e2ded6] flex items-center justify-around px-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#191817]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#191817]"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#191817]"></span>
                </div>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Individual tickets are filed independently, treating symptoms separately without shared context.
                </p>
              </div>
            </div>

            {/* Step B */}
            <div className="bg-[#ffffff] rounded-lg p-6 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#d9531e]">
                  STAGE 2: CONNECTED SIGNALS
                </div>
                <div className="h-20 bg-[#faf8f5] rounded border border-[#e2ded6] flex items-center justify-center space-x-3 px-4 relative">
                  <svg className="absolute inset-0 w-full h-full text-[#d9531e]/50" fill="none" viewBox="0 0 200 80">
                    <line x1="40" y1="40" x2="100" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="100" y1="40" x2="160" y2="40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#191817] relative z-10"></span>
                  <span className="w-3 h-3 rounded-full bg-[#d9531e] relative z-10"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-[#191817] relative z-10"></span>
                </div>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Spatial proximity and timing link related reports into a coherent neighborhood cluster.
                </p>
              </div>
            </div>

            {/* Step C */}
            <div className="bg-[#ffffff] rounded-lg p-6 border-2 border-[#191817] space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#191817]">
                  STAGE 3: RECURRING ISSUE REVEALED
                </div>
                <div className="h-20 bg-[#f3efea] rounded border border-[#d6d1c7] flex items-center justify-center p-3 text-center">
                  <span className="text-xs font-bold text-[#191817]">Underlying Infrastructure Root Cause Identified</span>
                </div>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Municipal teams prioritize the root issue, preventing repeated surface repairs and recurring failures.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. HOW IT WORKS — CONNECTED TIMELINE
         ================================================== */}
      <section className="w-full py-16 lg:py-24 border-b border-[#e2ded6] bg-[#f3efea]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#66645e]">
              WORKFLOW PROCESS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191817] font-headline tracking-tight">
              How Invisible City works
            </h2>
            <p className="text-xs sm:text-sm text-[#66645e]">
              A continuous flow from citizen observation to effective resolution.
            </p>
          </div>

          {/* 5-Step Connected Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative items-stretch">
            {/* Connecting Architectural Line (Desktop) */}
            <div className="hidden md:block absolute top-10 left-10 right-10 h-0.5 bg-[#d6d1c7] z-0" />

            {/* Step 01 */}
            <div className="relative z-10 bg-[#faf8f5] rounded-lg p-5 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#66645e]">01</span>
                  <FileText className="h-4 w-4 text-[#66645e]" />
                </div>
                <h3 className="text-sm font-bold text-[#191817] font-headline">Report</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Tell us what you noticed in your community.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="relative z-10 bg-[#faf8f5] rounded-lg p-5 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#66645e]">02</span>
                  <Layers className="h-4 w-4 text-[#66645e]" />
                </div>
                <h3 className="text-sm font-bold text-[#191817] font-headline">Understand</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Your report is organized and understood.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="relative z-10 bg-[#faf8f5] rounded-lg p-5 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#66645e]">03</span>
                  <Activity className="h-4 w-4 text-[#66645e]" />
                </div>
                <h3 className="text-sm font-bold text-[#191817] font-headline">Connect</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Related reports can be linked across locations.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div className="relative z-10 bg-[#faf8f5] rounded-lg p-5 border border-[#e2ded6] space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#66645e]">04</span>
                  <Sparkles className="h-4 w-4 text-[#d9531e]" />
                </div>
                <h3 className="text-sm font-bold text-[#191817] font-headline">Find Patterns</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Repeated signals become easier to notice.
                </p>
              </div>
            </div>

            {/* Step 05 */}
            <div className="relative z-10 bg-[#faf8f5] rounded-lg p-5 border-2 border-[#d9531e] space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#d9531e]">05</span>
                  <Wrench className="h-4 w-4 text-[#d9531e]" />
                </div>
                <h3 className="text-sm font-bold text-[#191817] font-headline">Act</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Relevant issues can be reviewed and addressed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. MAP SECTION — REAL DATA OR POLISHED EMPTY STATE
         ================================================== */}
      <section className="w-full py-16 lg:py-24 border-b border-[#e2ded6] bg-[#faf8f5]" id="explore-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#66645e]">
                SPATIAL OBSERVE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191817] font-headline tracking-tight mt-1">
                See where signals are coming together.
              </h2>
              <p className="text-xs sm:text-sm text-[#66645e] mt-1">
                Explore reported issues and see where problems may be coming together.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#191817] text-white'
                    : 'bg-[#f3efea] text-[#66645e] hover:bg-[#e2ded6]'
                }`}
              >
                All Issues ({totalReports})
              </button>
              <button
                onClick={() => setActiveFilter('POTHOLE')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'POTHOLE'
                    ? 'bg-[#191817] text-white'
                    : 'bg-[#f3efea] text-[#66645e] hover:bg-[#e2ded6]'
                }`}
              >
                Potholes & Roads
              </button>
              <button
                onClick={() => setActiveFilter('GARBAGE')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'GARBAGE'
                    ? 'bg-[#191817] text-white'
                    : 'bg-[#f3efea] text-[#66645e] hover:bg-[#e2ded6]'
                }`}
              >
                Garbage & Waste
              </button>
              <button
                onClick={() => setActiveFilter('STREETLIGHT')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'STREETLIGHT'
                    ? 'bg-[#191817] text-white'
                    : 'bg-[#f3efea] text-[#66645e] hover:bg-[#e2ded6]'
                }`}
              >
                Streetlights & Power
              </button>
              <button
                onClick={() => setActiveFilter('WATER_LEAK')}
                className={`px-3 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  activeFilter === 'WATER_LEAK'
                    ? 'bg-[#191817] text-white'
                    : 'bg-[#f3efea] text-[#66645e] hover:bg-[#e2ded6]'
                }`}
              >
                Water & Sewage
              </button>
            </div>
          </div>

          {/* Map Preview Container */}
          <div className="bg-[#ffffff] rounded-lg border border-[#e2ded6] p-2 relative overflow-hidden shadow-xs">
            <div className="relative w-full h-[440px] sm:h-[480px] bg-[#f3efea] rounded overflow-hidden border border-[#e2ded6]">
              {/* Architectural Grid Background */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#191817 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />

              {filteredReports.length === 0 ? (
                /* POLISHED EMPTY MAP STATE (No Fake Markers!) */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#faf8f5]/90">
                  <MapPin className="h-8 w-8 text-[#66645e]/50" />
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-[#191817] font-headline">No reported issues to display yet.</h3>
                    <p className="text-xs text-[#66645e] max-w-sm">
                      Be the first to submit a community observation in your area.
                    </p>
                  </div>
                  <Link
                    to="/report"
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded bg-[#d9531e] text-white text-xs font-semibold hover:bg-[#c44715] transition-colors"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Report an Issue</span>
                  </Link>
                </div>
              ) : (
                /* DISPLAY REAL BACKEND REPORTS */
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-full">
                  {filteredReports.map((report: Report) => (
                    <div
                      key={report.id}
                      className="bg-[#ffffff] p-4 rounded border border-[#e2ded6] space-y-2 shadow-xs hover:border-[#191817] transition-colors"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-[#f3efea] font-bold text-[#191817] uppercase">
                          {report.category}
                        </span>
                        <span className="text-[#66645e]">{report.verification_status}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#191817] font-headline line-clamp-1">{report.title}</h4>
                      <p className="text-[11px] text-[#66645e] line-clamp-2 leading-relaxed">{report.description}</p>
                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-[#66645e] border-t border-[#e2ded6]">
                        <span>{report.address || `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`}</span>
                        <Link to={`/report/${report.id}`} className="text-[#d9531e] font-semibold hover:underline">
                          View →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. REPORT CATEGORIES
         ================================================== */}
      <section className="w-full py-16 lg:py-24 border-b border-[#e2ded6] bg-[#f3efea]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#66645e]">
              CIVIC SCOPE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#191817] font-headline tracking-tight">
              What can you report?
            </h2>
            <p className="text-xs sm:text-sm text-[#66645e] leading-relaxed">
              Everyday issues across roads, utilities, sanitation, and public infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category 1 */}
            <div className="bg-[#faf8f5] rounded-lg p-6 border border-[#e2ded6] flex flex-col justify-between space-y-4 hover:border-[#191817] transition-all shadow-xs group">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded bg-[#191817] flex items-center justify-center text-white font-mono text-xs">
                  01
                </div>
                <h3 className="text-base font-bold text-[#191817] font-headline">Potholes & Roads</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Damaged asphalt, sunken trenches, or surface hazards affecting transit.
                </p>
              </div>
              <Link
                to="/report"
                state={{ category: 'POTHOLE' }}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#d9531e] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 2 */}
            <div className="bg-[#faf8f5] rounded-lg p-6 border border-[#e2ded6] flex flex-col justify-between space-y-4 hover:border-[#191817] transition-all shadow-xs group">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded bg-[#191817] flex items-center justify-center text-white font-mono text-xs">
                  02
                </div>
                <h3 className="text-base font-bold text-[#191817] font-headline">Garbage & Waste</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Illegal dumping along public easements, uncollected bins, or bulk waste.
                </p>
              </div>
              <Link
                to="/report"
                state={{ category: 'GARBAGE' }}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#d9531e] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 3 */}
            <div className="bg-[#faf8f5] rounded-lg p-6 border border-[#e2ded6] flex flex-col justify-between space-y-4 hover:border-[#191817] transition-all shadow-xs group">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded bg-[#191817] flex items-center justify-center text-white font-mono text-xs">
                  03
                </div>
                <h3 className="text-base font-bold text-[#191817] font-headline">Streetlights & Power</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Dark streetlamps, exposed wiring, outages, or damaged utility poles.
                </p>
              </div>
              <Link
                to="/report"
                state={{ category: 'STREETLIGHT' }}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#d9531e] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 4 */}
            <div className="bg-[#faf8f5] rounded-lg p-6 border border-[#e2ded6] flex flex-col justify-between space-y-4 hover:border-[#191817] transition-all shadow-xs group">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded bg-[#191817] flex items-center justify-center text-white font-mono text-xs">
                  04
                </div>
                <h3 className="text-base font-bold text-[#191817] font-headline">Water & Sewage</h3>
                <p className="text-xs text-[#474540] leading-relaxed">
                  Pipe leaks, water ponding on roads, drainage blockages, or open manholes.
                </p>
              </div>
              <Link
                to="/report"
                state={{ category: 'WATER_LEAK' }}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#d9531e] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          7. FINAL CTA
         ================================================== */}
      <section className="w-full py-20 lg:py-28 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#191817] font-headline tracking-tight">
            Make the invisible visible.
          </h2>
          <p className="text-sm sm:text-base text-[#474540] max-w-xl mx-auto leading-relaxed">
            See something that needs attention? Report it and help build a clearer picture of what's happening in your community.
          </p>
          <div className="pt-2">
            <Link
              to="/report"
              className="inline-flex items-center space-x-2 px-7 py-4 rounded-md bg-[#d9531e] hover:bg-[#c44715] text-white font-headline text-sm font-semibold transition-all shadow-xs"
            >
              <span>Report an Issue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
