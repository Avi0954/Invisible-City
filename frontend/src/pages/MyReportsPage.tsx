import React from 'react';
import { FileText, Clock, AlertCircle } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="h-6 w-6 text-cyan-400" />
            <span>My Submitted Reports</span>
          </h1>
          <p className="text-xs text-slate-400">Track status and AI cluster updates for your civic reports</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
          <Clock className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold text-white">No Reports Submitted Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          As you submit civic issue reports, they will appear here along with live municipal resolution tracking and AI problem grouping.
        </p>
        <div className="pt-2">
          <a
            href="/report"
            className="inline-flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md transition-all"
          >
            <AlertCircle className="h-4 w-4" />
            <span>Submit Your First Report</span>
          </a>
        </div>
      </div>
    </div>
  );
};
