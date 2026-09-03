import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          <span className="font-semibold text-slate-400">Invisible City</span> &copy; {new Date().getFullYear()} — Build With Bharat 2.0 Hackathon MVP
        </div>
        <div className="flex space-x-4 text-slate-400">
          <span>FastAPI</span>
          <span>&bull;</span>
          <span>React</span>
          <span>&bull;</span>
          <span>PostgreSQL / PostGIS</span>
          <span>&bull;</span>
          <span>pgvector</span>
        </div>
      </div>
    </footer>
  );
};
