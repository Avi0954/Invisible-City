import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report } from '../types/report';
import { HotspotItem } from '../types/intelligence';
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
  ChevronRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: reportsData } = useReports({ limit: 100 });
  const { data: hotspotsData } = useHotspots();
  const [activeFilter, setActiveFilter] = useState<'all' | 'roads' | 'water' | 'lighting' | 'sanitation'>('all');

  const totalReports = reportsData?.items.length || 6;
  const activeHotspotsCount = hotspotsData?.hotspots?.filter((h: HotspotItem) => h.status === 'ACTIVE').length || 1;
  const unverifiedCount = reportsData?.items.filter(
    (r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW'
  ).length || 6;

  const totalReportsStr = totalReports < 10 ? `0${totalReports}` : `${totalReports}`;
  const activeHotspotsStr = activeHotspotsCount < 10 ? `0${activeHotspotsCount}` : `${activeHotspotsCount}`;
  const unverifiedStr = unverifiedCount < 10 ? `0${unverifiedCount}` : `${unverifiedCount}`;

  return (
    <div className="flex flex-col w-full bg-[#fcf9f2] font-sans text-[#1c1c18]">
      {/* ==================================================
          1. HERO SECTION
         ================================================== */}
      <section className="w-full py-12 lg:py-16 border-b border-[#e5e2da]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column (~52%) */}
            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1c1c18] tracking-tight font-headline leading-tight text-balance">
                Small problems can reveal{' '}
                <span className="text-[#06291b] underline decoration-[#2f685f]/40 underline-offset-8">
                  bigger problems.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#484742] max-w-2xl leading-relaxed">
                Invisible City connects community reports to surface underlying issues, helping local teams address root causes before small cracks become major failures.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 w-full sm:w-auto">
                <Link
                  to="/report"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#06291b] hover:bg-[#0a3826] text-white font-headline text-sm font-semibold transition-all shadow-sm"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Report an Issue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#explore-map"
                  className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-[#f1eee7] hover:bg-[#e5e2da] text-[#1c1c18] border border-[#d0cdc5] font-headline text-sm font-semibold transition-colors"
                >
                  <Compass className="h-4 w-4 text-[#2f685f]" />
                  <span>Explore Nearby Issues</span>
                </a>
              </div>

              {/* Value Indicators */}
              <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[#e5e2da] w-full text-[#787770] text-xs">
                <div className="flex items-center space-x-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-[#2f685f]" />
                  <span>Community-verified signals</span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1.5 font-medium">
                  <ShieldCheck className="h-4 w-4 text-[#2f685f]" />
                  <span>Privacy-first reporting</span>
                </div>
              </div>
            </div>

            {/* Right Column (~48%) Visual Component */}
            <div className="lg:col-span-5 relative w-full">
              <div className="bg-[#f1eee7] rounded-2xl border border-[#e5e2da] p-5 shadow-sm space-y-4">
                {/* Title Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#d0cdc5]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#787770]">
                      Connected Reports Preview
                    </span>
                    <p className="text-sm font-bold text-[#1c1c18] font-headline">Oak Street & 4th Avenue Area</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">
                    Pattern Detected
                  </span>
                </div>

                {/* Map Preview Schematic */}
                <div className="relative h-56 bg-[#fcf9f2] rounded-xl p-4 overflow-hidden border border-[#e5e2da]">
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#787770 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full text-[#e5e2da]" fill="none" viewBox="0 0 460 220">
                    <path className="text-[#d0cdc5]" d="M 40 40 L 420 40" stroke="currentColor" strokeLinecap="round" strokeWidth="10" />
                    <path className="text-[#d0cdc5]" d="M 40 170 L 420 170" stroke="currentColor" strokeLinecap="round" strokeWidth="10" />
                    <path className="text-[#d0cdc5]" d="M 120 10 L 120 210" stroke="currentColor" strokeLinecap="round" strokeWidth="12" />
                    <path className="text-[#d0cdc5]" d="M 320 10 L 320 210" stroke="currentColor" strokeLinecap="round" strokeWidth="12" />
                  </svg>

                  <span className="absolute top-2 left-28 text-[10px] font-bold text-[#787770] uppercase bg-[#f1eee7] px-2 py-0.5 rounded border border-[#e5e2da]">
                    4th Ave
                  </span>
                  <span className="absolute bottom-4 left-10 text-[10px] font-bold text-[#787770] uppercase bg-[#f1eee7] px-2 py-0.5 rounded border border-[#e5e2da]">
                    Oak Street Area
                  </span>

                  {/* Connected Cluster Pins */}
                  <div className="absolute top-[80px] left-[115px]" title="Reported: Surface crack">
                    <div className="w-4 h-4 rounded-full bg-[#06291b] flex items-center justify-center text-white border border-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8ac9be]"></span>
                    </div>
                  </div>
                  <div className="absolute top-[130px] left-[150px]" title="Reported: Pothole">
                    <div className="w-4 h-4 rounded-full bg-[#06291b] flex items-center justify-center text-white border border-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8ac9be] animate-pulse"></span>
                    </div>
                  </div>
                  <div className="absolute top-[150px] left-[220px]" title="Reported: Water leak">
                    <div className="w-4 h-4 rounded-full bg-[#06291b] flex items-center justify-center text-white border border-white shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8ac9be]"></span>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-[#fcf9f2]/95 border border-[#e5e2da] px-3 py-1.5 rounded-lg flex items-center space-x-2 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-[#06291b]"></span>
                    <span className="text-[11px] font-bold text-[#1c1c18] font-mono">
                      4 Connected Reports
                    </span>
                  </div>
                </div>

                {/* Connected Reports Explanation */}
                <div className="bg-[#fcf9f2] rounded-xl p-3.5 border border-[#e5e2da] space-y-1 text-xs">
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    <span className="font-bold text-[#06291b]">Possible Root Cause</span>
                    <span className="text-[#787770]">•</span>
                    <span className="text-[#787770]">Water main seepage</span>
                  </div>
                  <p className="text-[#484742] leading-snug">
                    Multiple nearby reports near Oak Street indicate a water line leak causing surface pavement damage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. KEY CIVIC OVERVIEW (METRICS)
         ================================================== */}
      <section className="w-full bg-[#f1eee7] border-b border-[#e5e2da] py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Metric 1 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787770] font-headline">
                Community Reports
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-4xl lg:text-5xl font-extrabold text-[#1c1c18] font-headline">{totalReportsStr}</span>
                <span className="text-xs font-semibold text-[#787770]">active reports</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Distinct observations submitted by residents across neighborhood streets.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#06291b] font-headline">
                Emerging Patterns
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-4xl lg:text-5xl font-extrabold text-[#06291b] font-headline">{activeHotspotsStr}</span>
                <span className="text-xs font-semibold text-[#787770]">patterns identified</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Clusters of connected reports indicating potential underlying issues.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#787770] font-headline">
                Issues Requiring Attention
              </span>
              <div className="my-1 flex items-baseline space-x-2">
                <span className="text-4xl lg:text-5xl font-extrabold text-[#1c1c18] font-headline">{unverifiedStr}</span>
                <span className="text-xs font-semibold text-[#787770]">in review queue</span>
              </div>
              <p className="text-xs text-[#484742] leading-relaxed">
                Submitted signals queued for verification and municipal assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. HOW INVISIBLE CITY WORKS (HORIZONTAL PROCESS)
         ================================================== */}
      <section className="w-full py-16 lg:py-20 border-b border-[#e5e2da] bg-[#fcf9f2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              How Invisible City connects signals
            </h2>
            <p className="text-xs sm:text-sm text-[#787770]">
              Turning individual reports into connected neighborhood insights.
            </p>
          </div>

          {/* 5-Step Horizontal Flow */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-4 relative items-stretch">
            {/* Step 01 */}
            <div className="bg-[#f1eee7] rounded-2xl p-5 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#d0cdc5] transition-colors relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#787770] font-mono">01</span>
                  <FileText className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Report</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Tell us what you noticed in your community.
                </p>
              </div>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-[#fcf9f2] rounded-full p-1 border border-[#e5e2da]">
                <ChevronRight className="h-3.5 w-3.5 text-[#787770]" />
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-[#f1eee7] rounded-2xl p-5 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#d0cdc5] transition-colors relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#787770] font-mono">02</span>
                  <Layers className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Understand</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Reports are categorized by location and issue type.
                </p>
              </div>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-[#fcf9f2] rounded-full p-1 border border-[#e5e2da]">
                <ChevronRight className="h-3.5 w-3.5 text-[#787770]" />
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-[#f1eee7] rounded-2xl p-5 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#d0cdc5] transition-colors relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#787770] font-mono">03</span>
                  <Activity className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Connect</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Related reports are linked by area and timing.
                </p>
              </div>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-[#fcf9f2] rounded-full p-1 border border-[#e5e2da]">
                <ChevronRight className="h-3.5 w-3.5 text-[#787770]" />
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-[#f1eee7] rounded-2xl p-5 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#d0cdc5] transition-colors relative">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#787770] font-mono">04</span>
                  <Sparkles className="h-5 w-5 text-[#2f685f]" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Find Patterns</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Clusters reveal recurring root problems.
                </p>
              </div>
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 bg-[#fcf9f2] rounded-full p-1 border border-[#e5e2da]">
                <ChevronRight className="h-3.5 w-3.5 text-[#787770]" />
              </div>
            </div>

            {/* Step 05 (Stronger Emphasis) */}
            <div className="bg-[#f1eee7] rounded-2xl p-5 border-2 border-[#06291b] flex flex-col justify-between space-y-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#06291b] font-mono">05</span>
                  <Wrench className="h-5 w-5 text-[#06291b]" />
                </div>
                <h3 className="text-base font-bold text-[#06291b] font-headline">Take Action</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Teams address underlying causes effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. EXPLORE / MAP SECTION
         ================================================== */}
      <section className="w-full py-16 lg:py-20 border-b border-[#e5e2da]" id="explore-map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
                See what's happening around you
              </h2>
              <p className="text-xs sm:text-sm text-[#787770] mt-1">
                Explore nearby community reports and active pattern clusters.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                All Issues ({totalReports})
              </button>
              <button
                onClick={() => setActiveFilter('roads')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'roads'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Potholes & Roads
              </button>
              <button
                onClick={() => setActiveFilter('water')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'water'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Water & Sewage
              </button>
              <button
                onClick={() => setActiveFilter('lighting')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'lighting'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Streetlights & Power
              </button>
              <button
                onClick={() => setActiveFilter('sanitation')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeFilter === 'sanitation'
                    ? 'bg-[#06291b] text-white'
                    : 'bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
                }`}
              >
                Garbage & Sanitation
              </button>
            </div>
          </div>

          {/* Full-Width Map Container */}
          <div className="bg-[#f1eee7] rounded-2xl border border-[#e5e2da] p-2 relative overflow-hidden shadow-sm">
            <div className="relative w-full h-[480px] sm:h-[520px] bg-[#ebe6dc] rounded-xl overflow-hidden border border-[#d0cdc5]">
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#24241d 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              <span className="absolute top-[96px] left-16 text-[11px] font-bold text-[#787770] uppercase bg-[#fcf9f2]/80 px-2 py-0.5 rounded border border-[#e5e2da]">
                Pine Street
              </span>
              <span className="absolute top-[216px] left-16 text-[11px] font-bold text-[#787770] uppercase bg-[#fcf9f2]/80 px-2 py-0.5 rounded border border-[#e5e2da]">
                Oak Street Area
              </span>
              <span className="absolute top-[336px] left-16 text-[11px] font-bold text-[#787770] uppercase bg-[#fcf9f2]/80 px-2 py-0.5 rounded border border-[#e5e2da]">
                Market Street
              </span>

              {/* Map Cluster Pins */}
              <div className="absolute top-[215px] left-[295px] cursor-pointer" title="Report: Pavement fracture">
                <div className="w-5 h-5 rounded-full bg-[#06291b] flex items-center justify-center text-white shadow-sm border border-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </div>
              </div>
              <div className="absolute top-[230px] left-[355px] cursor-pointer" title="Report: Depressed curb">
                <div className="w-5 h-5 rounded-full bg-[#06291b] flex items-center justify-center text-white shadow-sm border border-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>
              <div className="absolute top-[220px] left-[415px] cursor-pointer" title="Report: Surface water ponding">
                <div className="w-5 h-5 rounded-full bg-[#06291b] flex items-center justify-center text-white shadow-sm border border-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Compact Hotspot Overlay Panel (Bottom Right) */}
              <div className="absolute bottom-6 right-6 max-w-sm w-[calc(100%-3rem)] bg-[#fcf9f2]/95 backdrop-blur border border-[#e5e2da] rounded-xl p-4 shadow-md space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-[#e5e2da]">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb] flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-[#2f685f]" />
                    <span>Possible Hotspot</span>
                  </span>
                  <span className="text-[11px] font-semibold text-[#787770]">Oak Street Area</span>
                </div>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Several related reports in this area may indicate a recurring issue.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-[#787770] font-mono">4 supporting reports</span>
                  <Link
                    to="/map"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] hover:underline"
                  >
                    <span>View reports</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. WHAT CAN YOU REPORT (CIVIC CATEGORIES)
         ================================================== */}
      <section className="w-full py-16 lg:py-20 border-b border-[#e5e2da] bg-[#f1eee7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline tracking-tight">
              What can you report?
            </h2>
            <p className="text-xs sm:text-sm text-[#484742] leading-relaxed">
              Report problems affecting roads, public spaces, utilities, and everyday life in your community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category 1 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#06291b] transition-all shadow-sm group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Potholes & Roads</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Damaged asphalt, sunken trenches, or surface hazards affecting transit.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#06291b] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 2 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#06291b] transition-all shadow-sm group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Garbage & Sanitation</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Illegal dumping along public easements, uncollected bins, or bulk waste.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#06291b] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 3 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#06291b] transition-all shadow-sm group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Streetlights & Power</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Dark streetlamps, exposed wiring, outages, or damaged utility poles.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#06291b] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category 4 */}
            <div className="bg-[#fcf9f2] rounded-2xl p-6 border border-[#e5e2da] flex flex-col justify-between space-y-4 hover:border-[#06291b] transition-all shadow-sm group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#e1f3ee] flex items-center justify-center text-[#06291b]">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1c1c18] font-headline">Water & Sewage</h3>
                <p className="text-xs text-[#484742] leading-relaxed">
                  Pipe leaks, water ponding on roads, drainage blockages, or open manholes.
                </p>
              </div>
              <Link
                to="/report"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-[#06291b] group-hover:underline pt-2"
              >
                <span>Report an issue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
