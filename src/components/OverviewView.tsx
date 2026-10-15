import React from 'react';
import {
  UploadCloud,
  FileText,
  Activity,
  Check,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { Report, UserProfile } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface OverviewViewProps {
  user: UserProfile | null;
  reports: Report[];
  onUploadClick: () => void;
  onViewReport: (reportId: string) => void;
  onViewTrends: () => void;
  onLoadDemoData: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  user,
  reports,
  onUploadClick,
  onViewReport,
  onViewTrends,
  onLoadDemoData,
}) => {
  const totalReports = reports.length;
  const recentReports = reports.slice(0, 5);

  const latestReport = reports[0];
  const latestResults = latestReport?.results || [];

  let normalCount = 0;
  let abnormalCount = 0;
  reports.forEach((r) => {
    r.results?.forEach((res) => {
      if (res.comparison_status === 'normal') normalCount++;
      else if (res.comparison_status === 'high' || res.comparison_status === 'low') abnormalCount++;
    });
  });

  const glucoseTrendData = reports
    .filter((r) => r.results?.some((res) => res.test_name.toLowerCase().includes('glucose')))
    .map((r) => {
      const match = r.results?.find((res) => res.test_name.toLowerCase().includes('glucose'));
      return {
        date: r.report_date,
        value: match?.measured_value || 0,
      };
    })
    .reverse();

  const isDemoActive = reports.some((r) => r.is_demo);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-[#0A0F1D]">
      {/* 1. Typographic Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
            <span>Workspace</span>
            <span className="text-slate-300">/</span>
            <span>Clinical Records</span>
            {isDemoActive && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.2 border border-amber-300">
                  Demo Active
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial">
            Welcome, {user?.display_name || 'Patient'}
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            {totalReports > 0
              ? `${totalReports} laboratory report${totalReports > 1 ? 's' : ''} organized in your sovereign clinical archive.`
              : 'Upload your laboratory report to extract biomarkers and view structured insights.'}
          </p>
        </div>

        <button
          onClick={onUploadClick}
          className="self-start sm:self-auto px-5 py-2.5 text-xs font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 rounded-none transition-colors shadow-xs flex items-center gap-2 font-mono tracking-tight"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload Report</span>
        </button>
      </div>

      {/* Empty State */}
      {totalReports === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 space-y-4">
          <div className="w-12 h-12 mx-auto bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold">
            00
          </div>
          <h3 className="text-lg font-bold text-[#0A0F1D] font-editorial">No laboratory reports yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Upload your blood test documents (PDF, PNG, JPG) to extract values, compare with printed reference ranges, and generate AI summaries.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onUploadClick}
              className="px-5 py-2 text-xs font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 rounded-none transition-colors font-mono"
            >
              Upload Document
            </button>
            <button
              onClick={onLoadDemoData}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-none transition-colors font-mono"
            >
              Load Sample Reports
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. Architectural Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                01 · Total Reports
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-[#0A0F1D]">
                {totalReports}
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1">
                Latest: {latestReport?.report_date || 'N/A'}
              </p>
            </div>

            <div className="p-5 bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                02 · Evaluated Biomarkers
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-[#0A0F1D]">
                {normalCount + abnormalCount}
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1">Across all panels</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                03 · In Reference Range
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-600">
                {normalCount}
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1">Optimal baseline</p>
            </div>

            <div className="p-5 bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                04 · Doctor Review Needed
              </span>
              <div className="text-3xl font-extrabold font-mono tabular-nums text-amber-600">
                {abnormalCount}
              </div>
              <p className="text-[11px] text-slate-500 font-mono pt-1">Flagged / Borderline</p>
            </div>
          </div>

          {/* 3. Main Split: Recent Reports Table & Biomarker Trajectory */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Recent Reports List */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-[#0A0F1D] font-editorial">Recent Reports</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Verified clinical documents</p>
                </div>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {recentReports.length} / {totalReports}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => onViewReport(report.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onViewReport(report.id);
                      }
                    }}
                    aria-label={`View clinical details for ${report.original_filename}`}
                    className="py-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group focus:outline-none focus:bg-slate-50"
                  >
                    <div className="space-y-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#0A0F1D] group-hover:text-blue-600 transition-colors truncate">
                          {report.original_filename.replace('.pdf', '').replace(/_/g, ' ')}
                        </span>
                        {report.is_demo && (
                          <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 border border-amber-300">
                            DEMO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>{report.laboratory_name || 'Laboratory'}</span>
                        <span className="text-slate-300">·</span>
                        <span>{report.report_date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ANALYZED
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A0F1D] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Latest Biomarkers & Fasting Glucose Trajectory */}
            <div className="lg:col-span-5 space-y-6">
              {/* Latest Biomarkers Status */}
              <div className="bg-white border border-slate-200 p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-[#0A0F1D] font-editorial uppercase tracking-wider">
                    Latest Biomarkers
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    {latestReport?.report_date || 'N/A'}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {latestResults.slice(0, 4).map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-[#0A0F1D] font-sans">{res.test_name}</p>
                        <p className="text-[10px] text-slate-500">
                          {res.laboratory_reference_text || `${res.reference_range_low} - ${res.reference_range_high} ${res.unit}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold tabular-nums text-slate-900">
                          {res.measured_value}
                        </span>{' '}
                        <span className="text-slate-500 text-[10px]">{res.unit}</span>
                        <div className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                          {res.comparison_status === 'normal' && (
                            <span className="text-emerald-700">Optimal</span>
                          )}
                          {res.comparison_status === 'high' && (
                            <span className="text-amber-700">▲ High</span>
                          )}
                          {res.comparison_status === 'low' && (
                            <span className="text-blue-700">▼ Low</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Glucose Sparkline */}
              {glucoseTrendData.length > 1 && (
                <div className="bg-white border border-slate-200 p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#0A0F1D] font-editorial uppercase tracking-wider">
                        Fasting Glucose Trajectory
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500">Target Range: 70–99 mg/dL</p>
                    </div>
                    <button
                      onClick={onViewTrends}
                      className="text-xs font-mono font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Full view</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-32 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={glucoseTrendData}>
                        <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0A0F1D',
                            border: 'none',
                            borderRadius: '0px',
                            color: '#FFFFFF',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#2563EB"
                          strokeWidth={2}
                          dot={{ fill: '#2563EB', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mandatory Clinical Notice */}
      <div className="p-4 bg-slate-100 border-l-4 border-slate-800 text-xs text-slate-600 leading-relaxed font-mono">
        <strong className="text-slate-900 block font-sans mb-0.5">Clinical Boundary Notice:</strong>
        MediScan AI provides educational summaries of laboratory reports. Always consult your licensed physician for clinical diagnosis, treatment evaluation, or medication management.
      </div>
    </div>
  );
};
