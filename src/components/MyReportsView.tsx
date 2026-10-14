import React, { useState } from 'react';
import {
  FileText,
  Search,
  UploadCloud,
  ChevronRight,
  Trash2,
  Calendar,
  Building2,
  Activity,
} from 'lucide-react';
import { Report } from '../types';

interface MyReportsViewProps {
  reports: Report[];
  onViewReport: (reportId: string) => void;
  onUploadClick: () => void;
  onDeleteReport: (reportId: string) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  reports,
  onViewReport,
  onUploadClick,
  onDeleteReport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'demo' | 'user'>('all');

  const filtered = reports.filter((r) => {
    const matchesSearch =
      r.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.laboratory_name && r.laboratory_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.report_date.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterType === 'demo') return r.is_demo;
    if (filterType === 'user') return !r.is_demo;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in text-[#0A0F1D]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
            Index Registry
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
            Laboratory Archive
          </h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Verified blood test panels stored in your private database.
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors shadow-xs uppercase tracking-tight self-start sm:self-auto"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Specimen</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER SPECIMEN BY NAME, LAB OR DATE..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 text-xs font-mono uppercase focus:bg-white focus:outline-none focus:border-slate-900"
          />
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 self-stretch sm:self-auto text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 font-bold transition-colors uppercase ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All ({reports.length})
          </button>
          <button
            onClick={() => setFilterType('user')}
            className={`px-3 py-1 font-bold transition-colors uppercase ${
              filterType === 'user'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            User ({reports.filter((r) => !r.is_demo).length})
          </button>
          <button
            onClick={() => setFilterType('demo')}
            className={`px-3 py-1 font-bold transition-colors uppercase ${
              filterType === 'demo'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Demo ({reports.filter((r) => r.is_demo).length})
          </button>
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 font-editorial">No records found</h3>
          <p className="text-xs text-slate-500 font-mono">
            {searchQuery ? 'Adjust your filter search query.' : 'Upload a medical document to populate the archive.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 divide-y divide-slate-100">
          {filtered.map((report) => (
            <div
              key={report.id}
              className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div
                onClick={() => onViewReport(report.id)}
                className="space-y-1.5 cursor-pointer flex-1 min-w-0"
              >
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0A0F1D] group-hover:text-blue-600 transition-colors font-sans truncate">
                    {report.original_filename.replace('.pdf', '').replace(/_/g, ' ')}
                  </h3>
                  {report.is_demo && (
                    <span className="text-[9px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 border border-amber-300">
                      DEMO
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{report.report_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{report.laboratory_name || 'Laboratory'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    <span className="tabular-nums">{report.results?.length || 0} biomarkers</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-mono text-xs">
                <button
                  onClick={() => onViewReport(report.id)}
                  className="px-3 py-1.5 font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1 uppercase"
                >
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onDeleteReport(report.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
