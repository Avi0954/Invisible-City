import React from 'react';
import { MapPin, Layers, Sparkles, Filter } from 'lucide-react';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-cyan-400" />
            <span>Spatial Problem Map</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive GIS view showing real-time reports and PostGIS location intelligence clusters
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter Categories</span>
          </button>
          <button className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
            <Layers className="h-3.5 w-3.5" />
            <span>Heatmap Layer</span>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 h-[500px] flex items-center justify-center">
        {/* Placeholder Map Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
        
        <div className="relative z-10 text-center space-y-4 max-w-md p-6 bg-slate-950/80 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">PostGIS Interactive Map Engine</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Geographic query engine configured with PostGIS spatial indexing (`GEOMETRY(Point, 4326)`). Map layer interface will render active clusters dynamically upon data ingestion.
          </p>
        </div>
      </div>
    </div>
  );
};
