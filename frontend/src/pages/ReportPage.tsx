import React, { useState } from 'react';
import { PlusCircle, MapPin, Camera, AlertCircle } from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [category, setCategory] = useState('pothole');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Report submission is not implemented yet in this phase of Invisible City.');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <PlusCircle className="h-6 w-6 text-cyan-400" />
          <span>Report an Urban Infrastructure Problem</span>
        </h1>
        <p className="text-xs text-slate-400">
          Provide issue details and location to alert municipal authorities and trigger AI clustering.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="pothole">Road & Pothole Damage</option>
              <option value="garbage">Garbage & Waste Accumulation</option>
              <option value="streetlight">Broken / Non-functional Streetlight</option>
              <option value="water_leak">Water Main Leak / Sewage Backup</option>
              <option value="damaged_infrastructure">Damaged Bridge / Footpath / Public Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Geographic Location / Landmark
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. 5th Main Rd, Indiranagar, Bengaluru or GPS Coordinates"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Description & Context
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, safety impact, and any relevant details..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
              Photo Upload (Cloud Storage Abstraction)
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-700/60 rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-slate-950/40">
              <Camera className="h-8 w-8 text-slate-500 mx-auto" />
              <div className="text-xs text-slate-400 font-medium">Click to upload photo evidence</div>
              <p className="text-[11px] text-slate-600">PNG, JPG, or WEBP up to 10MB</p>
            </div>
          </div>

          <div className="rounded-xl border border-cyan-950 bg-cyan-950/30 p-3.5 flex items-start space-x-3 text-xs text-cyan-300">
            <AlertCircle className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              Your report will be automatically encoded into spatial PostGIS coordinates and vectorized for AI similarity detection.
            </p>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/80 transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Report</span>
          </button>
        </form>
      </div>
    </div>
  );
};
