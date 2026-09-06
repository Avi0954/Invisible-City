import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useIntelligence';
import { Report } from '../types/report';
import { HotspotItem } from '../types/intelligence';

export const HomePage: React.FC = () => {
  const { data: reportsData } = useReports({ limit: 100 });
  const { data: hotspotsData } = useHotspots();
  const [activeFilter, setActiveFilter] = useState<'all' | 'roads' | 'water' | 'lighting'>('all');

  const totalReports = reportsData?.items.length || 6;
  const activeHotspotsCount = hotspotsData?.hotspots?.filter((h: HotspotItem) => h.status === 'ACTIVE').length || 1;
  const unverifiedCount = reportsData?.items.filter(
    (r: Report) => r.verification_status === 'UNVERIFIED' || r.verification_status === 'UNDER_REVIEW'
  ).length || 6;

  const totalReportsStr = totalReports < 10 ? `0${totalReports}` : `${totalReports}`;
  const activeHotspotsStr = activeHotspotsCount < 10 ? `0${activeHotspotsCount}` : `${activeHotspotsCount}`;
  const unverifiedStr = unverifiedCount < 10 ? `0${unverifiedCount}` : `${unverifiedCount}`;

  return (
    <div className="flex flex-col w-full bg-surface">
      {/* Top Dossier / Status Ribbon */}
      <section className="w-full bg-surface-container-low border-b border-surface-container-highest">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop py-space-xs flex flex-wrap items-center justify-between gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-space-2xs px-space-xs py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Cycle 2025.04 Active
            </span>
            <span className="hidden sm:inline text-outline-variant">|</span>
            <span className="hidden sm:inline font-label-sm text-label-sm uppercase tracking-wide">
              Public Civic Registry · Oak District · Ward 4
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-medium">
              Stewardship Ledger: Open for verification
            </span>
          </div>
        </div>
      </section>

      {/* 1. HERO SECTION */}
      <section className="w-full py-space-2xl lg:py-space-3xl">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl lg:gap-space-2xl items-center">
            {/* Left Editorial Copy */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-lg bg-surface-container-high border border-surface-container-highest mb-space-md">
                <span className="material-symbols-outlined text-[16px] text-secondary">lan</span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold text-on-surface-variant">
                  Civic Intelligence Platform
                </span>
              </div>
              <h1 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-on-surface font-semibold tracking-tight text-balance leading-tight">
                Small problems can reveal{' '}
                <span className="text-primary underline decoration-secondary-fixed-dim underline-offset-8">
                  bigger problems.
                </span>
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-space-md max-w-xl">
                Invisible City helps communities turn individual civic reports into a clearer picture of what is happening around them, addressing underlying root causes before they become systemic failures.
              </p>
              <div className="flex flex-wrap items-center gap-space-md mt-space-xl w-full sm:w-auto">
                <Link
                  to="/report"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-on-primary font-title-md text-title-md font-semibold hover:bg-primary transition-all shadow-sm"
                >
                  <span>Report an Issue</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <a
                  href="#explore-map"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-surface-container-lowest border border-surface-container-highest text-on-surface font-title-md text-title-md font-medium hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-secondary">explore</span>
                  <span>Explore Nearby Issues</span>
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-space-md mt-space-xl pt-space-md border-t border-surface-container-highest w-full text-on-surface-variant font-body-sm text-body-sm">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">verified_user</span>
                  <span>Precinct-verified signals</span>
                </div>
                <span className="text-outline-variant">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary">shield_with_heart</span>
                  <span>No resident tracking</span>
                </div>
              </div>
            </div>

            {/* Right Cartographic Schematic Visual */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-secondary-container/30 rounded-full blur-2xl pointer-events-none"></div>
              <div className="bg-surface-container-lowest rounded-xl border border-surface-container-highest p-space-lg shadow-sm relative overflow-hidden">
                {/* Architectural Title Block */}
                <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high">
                  <div>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Corridor Cartography
                    </span>
                    <p className="font-title-md text-title-md text-on-surface font-semibold">Oak Street & 4th Avenue Incline</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-error-container text-on-error-container font-semibold uppercase tracking-wider">
                    Priority Triage
                  </span>
                </div>

                {/* Stylized Schematic Map Canvas */}
                <div className="my-space-md relative h-64 bg-surface-container-low rounded-lg p-space-md overflow-hidden border border-surface-container-high">
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#727973 1px, transparent 1px)',
                      backgroundSize: '20px 20px'
                    }}
                  />
                  <svg className="absolute inset-0 w-full h-full text-outline-variant" fill="none" viewBox="0 0 460 240">
                    <path className="text-surface-container-highest" d="M 40 40 L 420 40" stroke="currentColor" strokeLinecap="round" strokeWidth="12" />
                    <path className="text-surface-container-highest" d="M 40 180 L 420 180" stroke="currentColor" strokeLinecap="round" strokeWidth="12" />
                    <path className="text-surface-container-highest" d="M 120 10 L 120 230" stroke="currentColor" strokeLinecap="round" strokeWidth="14" />
                    <path className="text-surface-container-highest" d="M 320 10 L 320 230" stroke="currentColor" strokeLinecap="round" strokeWidth="14" />

                    <path d="M 40 40 L 420 40" stroke="#FAF8F5" strokeDasharray="4 6" strokeWidth="1.5" />
                    <path d="M 40 180 L 420 180" stroke="#FAF8F5" strokeDasharray="4 6" strokeWidth="1.5" />
                    <path d="M 120 10 L 120 230" stroke="#FAF8F5" strokeDasharray="4 6" strokeWidth="1.5" />
                    <path d="M 320 10 L 320 230" stroke="#FAF8F5" strokeDasharray="4 6" strokeWidth="1.5" />

                    <polygon fill="#2f685f" fillOpacity="0.10" points="120,40 190,55 240,110 160,140" stroke="#2f685f" strokeDasharray="3 3" strokeWidth="1.5" />

                    <line stroke="#1E3F30" strokeWidth="1.5" x1="120" x2="190" y1="40" y2="55" />
                    <line stroke="#1E3F30" strokeWidth="1.5" x1="190" x2="240" y1="55" y2="110" />
                    <line stroke="#1E3F30" strokeWidth="1.5" x1="240" x2="160" y1="110" y2="140" />
                    <line stroke="#1E3F30" strokeWidth="1.5" x1="160" x2="120" y1="140" y2="40" />

                    <circle cx="120" cy="40" fill="#1E3F30" r="5" />
                    <circle cx="120" cy="40" r="9" stroke="#1E3F30" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />

                    <circle cx="190" cy="55" fill="#1E3F30" r="5" />
                    <circle cx="190" cy="55" r="9" stroke="#1E3F30" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />

                    <circle cx="240" cy="110" fill="#1E3F30" r="5" />
                    <circle cx="240" cy="110" r="9" stroke="#1E3F30" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />

                    <circle cx="160" cy="140" fill="#1E3F30" r="5" />
                    <circle cx="160" cy="140" r="9" stroke="#1E3F30" strokeOpacity="0.4" strokeWidth="1.5" fill="none" />
                  </svg>

                  <span className="absolute top-2 left-32 font-label-sm text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-xs">
                    4th Ave
                  </span>
                  <span className="absolute bottom-6 left-12 font-label-sm text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-xs">
                    Oak Street Corridor
                  </span>
                  <span className="absolute top-12 right-6 font-label-sm text-[10px] text-on-surface-variant font-semibold tracking-wider uppercase bg-surface-container-lowest px-1.5 py-0.5 rounded shadow-xs">
                    Pine St
                  </span>

                  <div className="absolute bottom-3 right-3 bg-surface-container-lowest/95 backdrop-blur-sm border border-surface-container-highest px-2.5 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                      Cluster #882 · 4 Connected Points
                    </span>
                  </div>
                </div>

                {/* Synthesized Notice Card */}
                <div className="bg-surface-container rounded-lg p-space-md border border-surface-container-high">
                  <div className="flex items-center gap-space-xs mb-1">
                    <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-primary">
                      Emerging Pattern Detected
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">Synthesis Verified</span>
                  </div>
                  <p className="font-title-md text-title-md text-on-surface font-medium leading-snug">
                    Sub-surface water line leak inducing multi-point pavement subsidence along Oak Street Corridor.
                  </p>
                  <div className="mt-space-sm pt-space-xs border-t border-surface-container-highest flex flex-wrap items-center justify-between gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
                    <span>4 individual citizen reports unified</span>
                    <span className="font-semibold text-primary">Municipal Escalation: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMMUNITY METRICS (REAL CIVIC DATA LAYOUT) */}
      <section className="w-full bg-surface-container-low border-y border-surface-container-highest py-space-xl">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            {/* Metric 1: Community Reports */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between">
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Citizen Submissions
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">
                  Logged Current Cycle
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-bold">{totalReportsStr}</span>
                <span className="font-title-md text-title-md text-on-surface-variant">reports logged</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Distinct citizen observations logged across neighborhood blocks within the last 7 calendar days.
              </p>
            </div>

            {/* Metric 2: Emerging Patterns */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-secondary-fixed/30 rounded-bl-full pointer-events-none"></div>
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-semibold">
                  Cross-Report Synthesis
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold uppercase tracking-wider">
                  Priority Triage
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-primary font-bold">{activeHotspotsStr}</span>
                <span className="font-title-md text-title-md text-on-surface">pattern active</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Corridor with recurring connected signals indicative of underlying structural erosion.
              </p>
            </div>

            {/* Metric 3: Under Review */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between">
              <div className="flex items-center justify-between pb-space-xs">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Department Dispatch
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container text-on-surface-variant font-medium">
                  Active Review
                </span>
              </div>
              <div className="my-space-sm flex items-baseline gap-space-xs">
                <span className="font-display-lg text-display-lg text-on-surface font-bold">{unverifiedStr}</span>
                <span className="font-title-md text-title-md text-on-surface-variant">dispatches queued</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                All submitted signals queued with municipal infrastructure authorities for on-site assessment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PRODUCT VALUE SECTION */}
      <section className="w-full py-space-3xl">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
              Architectural Comparison
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
              From individual reports to emerging patterns
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Instead of treating every complaint in isolation, Invisible City helps link related reports to address root causes before small cracks become major infrastructure failures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-xl">
            {/* Left: Traditional 311 Reporting */}
            <div className="bg-surface-container rounded-xl p-space-xl border border-surface-container-highest flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container-highest">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[20px] text-outline">dvr</span>
                    <h3 className="font-title-md text-title-md font-semibold text-on-surface">Traditional 311 Reporting</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Isolated Records
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md">
                  Each complaint exists inside its own bureaucratic ticket. Inspectors patch the surface repeatedly without noticing that multiple neighbors are reporting connected damage.
                </p>

                <div className="grid grid-cols-2 gap-space-sm mt-space-lg">
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-highest">
                    <div className="font-label-sm text-label-sm text-outline font-semibold">TICKET #101</div>
                    <div className="font-title-md text-body-md font-medium text-on-surface mt-0.5">Pothole on Oak</div>
                    <div className="font-body-sm text-[12px] text-error mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Closed · Patched
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-highest">
                    <div className="font-label-sm text-label-sm text-outline font-semibold">TICKET #108</div>
                    <div className="font-title-md text-body-md font-medium text-on-surface mt-0.5">Pavement Crack</div>
                    <div className="font-body-sm text-[12px] text-error mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Closed · Sealed
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-highest">
                    <div className="font-label-sm text-label-sm text-outline font-semibold">TICKET #115</div>
                    <div className="font-title-md text-body-md font-medium text-on-surface mt-0.5">Water Seep at Curb</div>
                    <div className="font-body-sm text-[12px] text-outline mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Pending Review
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest p-space-sm rounded-lg border border-surface-container-highest">
                    <div className="font-label-sm text-label-sm text-outline font-semibold">TICKET #122</div>
                    <div className="font-title-md text-body-md font-medium text-on-surface mt-0.5">Curb Sag & Dip</div>
                    <div className="font-body-sm text-[12px] text-outline mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span> Dispatched Alone
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-space-lg pt-space-md border-t border-surface-container-highest bg-surface-container-high/40 -mx-space-xl -mb-space-xl p-space-md rounded-b-xl">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-error shrink-0">cancel</span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <strong className="text-on-surface">System Blindness:</strong> Treated separately as temporary asphalt patches; underlying water erosion remains unaddressed until roadway collapse.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Invisible City Synthesis */}
            <div className="bg-surface-container-lowest rounded-xl p-space-xl border-2 border-primary/20 shadow-sm flex flex-col justify-between relative">
              <div className="absolute -top-3 right-space-lg px-space-sm py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider">
                Connected Intelligence
              </div>
              <div>
                <div className="flex items-center justify-between pb-space-md border-b border-surface-container-high">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-[20px] text-primary">hub</span>
                    <h3 className="font-title-md text-title-md font-semibold text-primary">Invisible City Synthesis</h3>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-wider">
                    Spatial Clustering
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md">
                  Nearby reports are cross-referenced across space, infrastructure maps, and community timelines to reveal the root phenomenon driving surface symptoms.
                </p>

                <div className="mt-space-lg bg-surface-container-low rounded-lg p-space-md border border-surface-container-highest">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold text-primary">
                      Unified Corridor Dossier
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">4 Citizen Observations Linked</span>
                  </div>
                  <div className="mt-space-sm flex items-center gap-space-sm flex-wrap">
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-sm text-[12px] border border-surface-container-highest">
                      #101 Pothole
                    </span>
                    <span className="text-secondary font-bold">+</span>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-sm text-[12px] border border-surface-container-highest">
                      #108 Crack
                    </span>
                    <span className="text-secondary font-bold">+</span>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-sm text-[12px] border border-surface-container-highest">
                      #115 Water Seep
                    </span>
                    <span className="text-secondary font-bold">+</span>
                    <span className="inline-flex items-center px-2 py-1 rounded bg-surface-container-lowest text-on-surface font-label-sm text-[12px] border border-surface-container-highest">
                      #122 Curb Sag
                    </span>
                  </div>
                  <div className="mt-space-md p-space-sm rounded bg-surface-container-lowest border-l-4 border-primary">
                    <div className="font-label-sm text-[11px] uppercase tracking-wider text-primary font-bold">
                      Diagnosed Root Factor
                    </div>
                    <div className="font-body-md text-body-md text-on-surface font-semibold mt-0.5">
                      Sub-surface main fissure washing away foundation underlayment
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-space-lg pt-space-md border-t border-surface-container-high bg-primary-fixed/30 -mx-space-xl -mb-space-xl p-space-md rounded-b-xl">
                <div className="flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-primary shrink-0">check_circle</span>
                  <p className="font-body-sm text-body-sm text-on-primary-fixed">
                    <strong className="font-semibold text-primary">Proactive Remediation:</strong> Dispatches combined water utility and road engineering team simultaneously. Avoids repetitive resurfacing costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (CIVIC PIPELINE) */}
      <section className="w-full bg-surface-container-low border-y border-surface-container-highest py-space-3xl">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-2xl gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                The Civic Pipeline
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
                How Invisible City connects signals
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
              A continuous loop from individual neighbor observation to municipal resolution and community verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-space-md relative">
            {/* Step 01 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between relative group hover:border-outline transition-colors">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-sm text-headline-sm font-bold text-outline-variant group-hover:text-primary transition-colors">01</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">edit_note</span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Report</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  A resident notes a damaged surface, pooling water, or broken lamp in under 60 seconds with simple location context.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Input: Citizen Note
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between relative group hover:border-outline transition-colors">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-sm text-headline-sm font-bold text-outline-variant group-hover:text-primary transition-colors">02</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">category</span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Understand</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  The report is structured by civic category, precinct boundary, and infrastructure domain for archival consistency.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Structured Docket
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between relative group hover:border-outline transition-colors">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-sm text-headline-sm font-bold text-outline-variant group-hover:text-primary transition-colors">03</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">hub</span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Connect</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Related reports within proximate geography and timeline are correlated to map the boundary of the condition.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Spatial Correlation
              </div>
            </div>

            {/* Step 04 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between relative group hover:border-outline transition-colors">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-sm text-headline-sm font-bold text-outline-variant group-hover:text-primary transition-colors">04</span>
                  <span className="material-symbols-outlined text-[20px] text-secondary">insights</span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface">Find Patterns</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Recurring issues become visible before major damage occurs, providing an evidence trail for local ward representatives.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant">
                Root Diagnostic
              </div>
            </div>

            {/* Step 05 */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg border-2 border-primary/40 flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary">05</span>
                  <span className="material-symbols-outlined text-[20px] text-primary">build</span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-primary">Take Action</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Prioritized municipal review and coordinated repair team dispatch to treat the foundational problem.
                </p>
              </div>
              <div className="mt-space-md pt-space-xs border-t border-surface-container-high font-label-sm text-[11px] uppercase tracking-wider text-primary font-semibold">
                Targeted Repair
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MAP / EXPLORE PREVIEW */}
      <section className="w-full py-space-3xl" id="explore-map">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-space-xl gap-space-md">
            <div>
              <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                Local Observability
              </span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
                See what's happening around you
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-xl">
                Explore reported issues and see where problems may be coming together in your community.
              </p>
            </div>

            {/* Interactive Filter Pills */}
            <div className="flex flex-wrap items-center gap-space-xs" id="map-filter-group">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors filter-btn ${
                  activeFilter === 'all'
                    ? 'bg-primary text-on-primary active'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                All Active ({totalReports})
              </button>
              <button
                onClick={() => setActiveFilter('roads')}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors filter-btn ${
                  activeFilter === 'roads'
                    ? 'bg-primary text-on-primary active'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Potholes & Roads
              </button>
              <button
                onClick={() => setActiveFilter('water')}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors filter-btn ${
                  activeFilter === 'water'
                    ? 'bg-primary text-on-primary active'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Water & Drainage
              </button>
              <button
                onClick={() => setActiveFilter('lighting')}
                className={`px-space-md py-1.5 rounded-full font-label-md text-label-md transition-colors filter-btn ${
                  activeFilter === 'lighting'
                    ? 'bg-primary text-on-primary active'
                    : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                Lighting
              </button>
            </div>
          </div>

          {/* Stylized Warm Civic Street Map Interface */}
          <div className="bg-surface-container rounded-xl border border-surface-container-highest p-space-sm relative overflow-hidden">
            <div className="relative w-full h-[460px] bg-[#ebe6dc] rounded-lg overflow-hidden border border-surface-container-high">
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#24241d 1px, transparent 1px)',
                  backgroundSize: '24px 24px'
                }}
              />
              <svg className="absolute inset-0 w-full h-full" fill="none" viewBox="0 0 1000 500">
                <line stroke="#f6f3ec" strokeLinecap="square" strokeWidth="26" x1="50" x2="950" y1="120" y2="120" />
                <line stroke="#f6f3ec" strokeLinecap="square" strokeWidth="26" x1="50" x2="950" y1="360" y2="360" />
                <line stroke="#f6f3ec" strokeLinecap="square" strokeWidth="32" x1="280" x2="280" y1="20" y2="480" />
                <line stroke="#f6f3ec" strokeLinecap="square" strokeWidth="32" x1="720" x2="720" y1="20" y2="480" />

                <line stroke="#fcf9f2" strokeWidth="16" x1="120" x2="120" y1="20" y2="480" />
                <line stroke="#fcf9f2" strokeWidth="20" x1="500" x2="500" y1="20" y2="480" />
                <line stroke="#fcf9f2" strokeWidth="16" x1="880" x2="880" y1="20" y2="480" />
                <line stroke="#fcf9f2" strokeWidth="18" x1="50" x2="950" y1="240" y2="240" />

                <line stroke="#dcdad3" strokeDasharray="6 8" strokeWidth="1.5" x1="50" x2="950" y1="120" y2="120" />
                <line stroke="#dcdad3" strokeDasharray="6 8" strokeWidth="1.5" x1="50" x2="950" y1="360" y2="360" />
                <line stroke="#dcdad3" strokeDasharray="6 8" strokeWidth="1.5" x1="280" x2="280" y1="20" y2="480" />
                <line stroke="#dcdad3" strokeDasharray="6 8" strokeWidth="1.5" x1="720" x2="720" y1="20" y2="480" />
                <line stroke="#dcdad3" strokeDasharray="6 8" strokeWidth="1.5" x1="500" x2="500" y1="20" y2="480" />

                <polygon fill="#2f685f" fillOpacity="0.12" points="260,200 480,210 520,270 290,265" stroke="#2f685f" strokeDasharray="4 4" strokeWidth="2" />

                <line stroke="#1E3F30" strokeWidth="1.5" x1="300" x2="360" y1="225" y2="240" />
                <line stroke="#1E3F30" strokeWidth="1.5" x1="360" x2="420" y1="240" y2="230" />
                <line stroke="#1E3F30" strokeWidth="1.5" x1="420" x2="470" y1="230" y2="250" />
              </svg>

              <span className="absolute top-[96px] left-16 font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                Pine Street
              </span>
              <span className="absolute top-[216px] left-16 font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                Oak Street
              </span>
              <span className="absolute top-[336px] left-16 font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                Market Street
              </span>
              <span className="absolute top-6 left-[255px] font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                3rd Ave
              </span>
              <span className="absolute top-6 left-[475px] font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                4th Ave
              </span>
              <span className="absolute top-6 left-[695px] font-label-sm text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider bg-surface-container-lowest/80 px-2 py-0.5 rounded">
                5th Ave
              </span>

              {/* Oak Street Cluster Pins */}
              <div className="absolute top-[215px] left-[295px] group cursor-pointer" title="Report #101: Pavement fracture">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm border border-surface-container-lowest">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                </div>
              </div>
              <div className="absolute top-[230px] left-[355px] group cursor-pointer" title="Report #108: Depressed curb">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm border border-surface-container-lowest">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>
              <div className="absolute top-[220px] left-[415px] group cursor-pointer" title="Report #115: Surface water ponding">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm border border-surface-container-lowest">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>
              <div className="absolute top-[240px] left-[465px] group cursor-pointer" title="Report #122: Asphalt cracking">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-sm border border-surface-container-lowest">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Isolated pins outside hotspot */}
              <div className="absolute top-[110px] left-[710px] group cursor-pointer" title="Single Report: Streetlight flickering">
                <div className="w-4 h-4 rounded-full bg-outline flex items-center justify-center text-on-primary shadow-xs border border-surface-container-lowest">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
              </div>
              <div className="absolute top-[350px] left-[780px] group cursor-pointer" title="Single Report: Storm basin leaf build up">
                <div className="w-4 h-4 rounded-full bg-outline flex items-center justify-center text-on-primary shadow-xs border border-surface-container-lowest">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
              </div>
              <div className="absolute top-[110px] left-[180px] group cursor-pointer" title="Single Report: Fallen branch">
                <div className="w-4 h-4 rounded-full bg-outline flex items-center justify-center text-on-primary shadow-xs border border-surface-container-lowest">
                  <span className="w-1 h-1 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Interactive Hotspot Overlay Card */}
              <div className="absolute bottom-6 right-6 sm:max-w-md w-[calc(100%-3rem)] bg-surface-container-lowest/95 backdrop-blur border border-surface-container-highest rounded-xl p-space-md shadow-md">
                <div className="flex items-center justify-between gap-space-xs pb-1 border-b border-surface-container-high">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                    <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">
                      Possible Hotspot
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    Oak Street Area · 4 Connected Reports
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-2">
                  Multiple reports of asphalt sinking and persistent pooling water along the south curb of Oak St between 3rd & 4th Ave.
                </p>
                <div className="mt-space-sm pt-space-xs flex items-center justify-between">
                  <span className="font-label-sm text-[11px] text-on-surface-variant">First reported 3 days ago</span>
                  <Link
                    to="/map"
                    className="inline-flex items-center gap-1 font-title-md text-body-sm text-primary font-semibold hover:underline"
                  >
                    <span>View Connected Reports</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* Map Legend Badge */}
              <div className="absolute top-4 left-4 bg-surface-container-lowest/90 px-space-sm py-1.5 rounded-lg border border-surface-container-highest shadow-xs flex items-center gap-space-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-label-sm text-[11px] text-on-surface">Emerging Hotspot</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-outline"></span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">Isolated Report</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT CAN YOU REPORT (CATEGORIES) */}
      <section className="w-full bg-surface-container-low border-t border-surface-container-highest py-space-3xl">
        <div className="max-w-max-width-content mx-auto px-margin-mobile lg:px-margin-desktop">
          <div className="max-w-2xl mb-space-2xl">
            <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
              Civic Scope
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight mt-1">
              What can you report?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Public spaces belong to all of us. Invisible City accepts observations across four foundational infrastructure domains.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
            {/* Category 1 */}
            <Link
              to="/report"
              className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between group hover:border-primary hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[22px]">signpost</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    12 active
                  </span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Potholes & Road Surface
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Damaged asphalt, sunken utility trenches, road collapses, or surface hazards affecting transit.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container-high flex items-center justify-between text-primary font-title-md text-body-sm font-semibold">
                <span>Log an observation</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Category 2 */}
            <Link
              to="/report"
              className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between group hover:border-primary hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[22px]">delete_sweep</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    04 active
                  </span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Garbage & Sanitation
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Illegal dumping along public easements, overflowing park receptacles, and uncollected bulk waste.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container-high flex items-center justify-between text-primary font-title-md text-body-sm font-semibold">
                <span>Log an observation</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Category 3 */}
            <Link
              to="/report"
              className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between group hover:border-primary hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[22px]">lightbulb</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    06 active
                  </span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Streetlights & Power
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Blacked-out lamps, exposed wiring, outages, or damaged utility poles across corridors.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container-high flex items-center justify-between text-primary font-title-md text-body-sm font-semibold">
                <span>Log an observation</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>

            {/* Category 4 */}
            <Link
              to="/report"
              className="bg-surface-container-lowest rounded-xl p-space-lg border border-surface-container-highest flex flex-col justify-between group hover:border-primary hover:shadow-sm transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-space-md">
                  <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[22px]">water_drop</span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                    05 active
                  </span>
                </div>
                <h3 className="font-title-md text-title-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                  Water & Sewage
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                  Sub-surface pipe leaks, curb water ponding, flooding, or open manholes requiring immediate triage.
                </p>
              </div>
              <div className="mt-space-lg pt-space-sm border-t border-surface-container-high flex items-center justify-between text-primary font-title-md text-body-sm font-semibold">
                <span>Log an observation</span>
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};



