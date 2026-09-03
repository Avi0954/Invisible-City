import React from 'react';
import { ShieldCheck, Cpu, Database, CheckCircle2 } from 'lucide-react';
import { HealthBadge } from '../components/common/HealthBadge';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span>Municipal Admin Triage</span>
          </h1>
          <p className="text-xs text-slate-400">System overview, AI cluster verification, and municipal task dispatch</p>
        </div>
        <HealthBadge />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Cpu className="h-5 w-5" />
            <h3 className="font-semibold text-white">AI Aggregation Engine Status</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            FastAPI abstraction layer initialized with support for pgvector similarity searches and automated cluster generation.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Abstraction Status:</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vector Dimension:</span>
              <span className="text-slate-200 font-mono">1536</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <div className="flex items-center space-x-3 text-cyan-400">
            <Database className="h-5 w-5" />
            <h3 className="font-semibold text-white">Database & Migrations</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            SQLAlchemy 2.0 ORM base metadata and Alembic migration framework ready for schema generation.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Database Driver:</span>
              <span className="text-slate-200 font-mono">psycopg2 / PostgreSQL</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alembic Config:</span>
              <span className="text-emerald-400 font-medium">Initialized</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h3 className="font-semibold text-white flex items-center space-x-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Hackathon MVP Core Requirements Verified</span>
        </h3>
        <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
          <li>Modular Monolith architecture cleanly separated into <code className="text-cyan-400">/frontend</code> and <code className="text-cyan-400">/backend</code></li>
          <li>FastAPI application configured with <code className="text-cyan-400">/api/v1</code> versioning and Request ID middleware</li>
          <li>Health endpoint <code className="text-cyan-400">GET /api/v1/health</code> probing live PostgreSQL DB status</li>
          <li>React SPA configured with React Router, TanStack Query, and Axios API client</li>
        </ul>
      </div>
    </div>
  );
};
