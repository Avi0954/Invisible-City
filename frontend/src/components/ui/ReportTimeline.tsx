import React from 'react';
import { ReportStatus } from '../../types/report';
import { CheckCircle2, Clock, ShieldCheck, Wrench, CheckCheck, XCircle, Sparkles } from 'lucide-react';

export interface ReportTimelineProps {
  status: ReportStatus;
  verificationStatus?: string;
  hasAnalysis?: boolean;
}

export const ReportTimeline: React.FC<ReportTimelineProps> = ({
  status,
  verificationStatus,
  hasAnalysis = true,
}) => {
  if (status === 'REJECTED' || verificationStatus === 'REJECTED') {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center space-x-3 text-xs text-red-900 font-sans">
        <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
        <div>
          <span className="font-bold block">Report Rejected</span>
          <span className="text-[11px] text-red-800">This report was reviewed by municipal reviewers and determined not to require field intervention.</span>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'REPORTED', label: 'Reported', icon: Clock },
    { key: 'AI_ANALYZED', label: 'AI Analyzed', icon: Sparkles },
    { key: 'UNDER_REVIEW', label: 'Under Review', icon: ShieldCheck },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench },
    { key: 'RESOLVED', label: 'Resolved', icon: CheckCheck },
  ];

  let currentStepIndex = 1; // Default to AI Analyzed
  if (status === 'RESOLVED') {
    currentStepIndex = 4;
  } else if (status === 'IN_PROGRESS') {
    currentStepIndex = 3;
  } else if (status === 'VERIFIED' || verificationStatus === 'ADMIN_VERIFIED' || verificationStatus === 'UNDER_REVIEW') {
    currentStepIndex = 2;
  } else if (hasAnalysis) {
    currentStepIndex = 1;
  } else {
    currentStepIndex = 0;
  }

  return (
    <div className="w-full py-4 space-y-3 font-sans">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#787770] font-headline">
        Report Lifecycle Progress
      </div>

      <div className="grid grid-cols-5 gap-2 relative items-start">
        {steps.map((step, idx) => {
          const isDone = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center text-center space-y-1.5 relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                  isCurrent
                    ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs scale-110'
                    : isDone
                    ? 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]'
                    : 'bg-[#f1eee7] text-[#a3a097] border-[#d0cdc5]'
                }`}
              >
                <StepIcon className="h-4 w-4" />
              </div>
              <span
                className={`text-[10px] font-semibold tracking-tight leading-tight ${
                  isCurrent
                    ? 'text-[#06291b] font-bold'
                    : isDone
                    ? 'text-[#1c1c18]'
                    : 'text-[#787770]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
