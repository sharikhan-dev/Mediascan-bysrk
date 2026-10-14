import React, { useState } from 'react';
import {
  ArrowLeft,
  Trash2,
  Activity,
  MessageSquare,
  AlertTriangle,
  Printer,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Download,
} from 'lucide-react';
import { Report, LaboratoryResult } from '../types';

interface ReportDetailViewProps {
  report: Report;
  onBack: () => void;
  onDeleteReport: (reportId: string) => void;
  onAskAI: (report: Report) => void;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  report,
  onBack,
  onDeleteReport,
  onAskAI,
}) => {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleExpand = (testName: string) => {
    setExpandedTest(expandedTest === testName ? null : testName);
  };

  const handlePrint = () => {
    window.print();
  };

  // Precise Reference Range Gauge
  const renderRangeGauge = (res: LaboratoryResult) => {
    const val = res.measured_value;
    const low = res.reference_range_low;
    const high = res.reference_range_high;

    if (low === null || high === null) {
      return (
        <div className="text-[10px] text-slate-400 font-mono italic">
          {res.laboratory_reference_text || 'Variable Reference'}
        </div>
      );
    }

    const rangeSpan = high - low;
    const gaugeMin = Math.max(0, low - rangeSpan * 0.4);
    const gaugeMax = high + rangeSpan * 0.4;
    const totalSpan = gaugeMax - gaugeMin;

    const normalLeftPct = Math.max(0, Math.min(100, ((low - gaugeMin) / totalSpan) * 100));
    const normalWidthPct = Math.max(5, Math.min(100, (rangeSpan / totalSpan) * 100));

    let dotPct = ((val - gaugeMin) / totalSpan) * 100;
    dotPct = Math.max(3, Math.min(97, dotPct));

    const isHigh = val > high;
    const isLow = val < low;

    return (
      <div className="w-36 space-y-1">
        <div className="relative h-1.5 w-full bg-slate-200 overflow-hidden">
          <div
            className="absolute top-0 bottom-0 bg-emerald-300"
            style={{ left: `${normalLeftPct}%`, width: `${normalWidthPct}%` }}
          />
          <div
            className={`absolute top-0 bottom-0 w-2 -ml-1 ${
              isHigh ? 'bg-amber-600' : isLow ? 'bg-blue-600' : 'bg-slate-900'
            }`}
            style={{ left: `${dotPct}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-slate-500 font-mono tabular-nums">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in print-area text-[#0A0F1D]">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print pb-3 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-600 hover:text-[#0A0F1D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>RETURN TO INDEX</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAI(report)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Consult Assistant</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200"
            title="Delete report"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Sheet */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/50 backdrop-blur-xs no-print">
          <div className="bg-white p-6 max-w-sm w-full border-2 border-slate-900 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-[#0A0F1D] font-editorial">
              Permanently delete report?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-mono">
              This will remove this laboratory specimen record, extracted biomarkers, and generated explanations from your private database.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => onDeleteReport(report.id)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specimen Header Card */}
      <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
              CLINICAL SPECIMEN ARCHIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
              {report.original_filename.replace('.pdf', '').replace(/_/g, ' ')}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              File: {report.original_filename}
            </p>
          </div>

          <span className="self-start sm:self-auto text-xs font-mono font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 uppercase">
            STATUS: ANALYZED
          </span>
        </div>

        {/* Specimen Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
          <div className="space-y-0.5 border-l-2 border-slate-200 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block">Collection Date</span>
            <span className="font-bold text-slate-900 tabular-nums">{report.report_date}</span>
          </div>

          <div className="space-y-0.5 border-l-2 border-slate-200 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block">Testing Laboratory</span>
            <span className="font-bold text-slate-900 truncate block">
              {report.laboratory_name || 'Standard Laboratory'}
            </span>
          </div>

          <div className="space-y-0.5 border-l-2 border-slate-200 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block">Patient Demographics</span>
            <span className="font-bold text-slate-900 font-sans">
              {report.patient_age ? `${report.patient_age} yrs` : 'Age unspec'}, {report.patient_gender || 'Unspec'}
            </span>
          </div>

          <div className="space-y-0.5 border-l-2 border-slate-200 pl-3">
            <span className="text-slate-400 text-[10px] uppercase block">Biomarker Count</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {report.results?.length || 0} tests
            </span>
          </div>
        </div>
      </div>

      {/* AI Clinical Summary */}
      {report.analysis && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-600 uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>AI Plain-Language Clinical Synthesis</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{report.analysis.model_version}</span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-sans">
            {report.analysis.summary}
          </p>

          {/* Key Findings */}
          {report.analysis.key_findings && report.analysis.key_findings.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">
                Key Findings Requiring Attention
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.analysis.key_findings.map((kf, i) => (
                  <div
                    key={i}
                    className="p-4 bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0A0F1D] font-editorial">{kf.title}</span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase tracking-wider ${
                          kf.urgency === 'prompt_review'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : kf.urgency === 'discuss_with_doctor'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {kf.urgency === 'prompt_review'
                          ? 'Prompt Review'
                          : kf.urgency === 'discuss_with_doctor'
                          ? 'Discuss With Doctor'
                          : 'Routine'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">{kf.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Laboratory Measurements Table (Swiss Tabular Layout) */}
      <div className="bg-white border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0A0F1D] font-editorial uppercase tracking-wider">
              Laboratory Measurements & Reference Boundaries
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Compared strictly against laboratory-printed bounds.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {report.results?.length || 0} TESTS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Biomarker</th>
                <th className="py-3 px-4 font-semibold">Measured Value</th>
                <th className="py-3 px-4 font-semibold">Laboratory Reference</th>
                <th className="py-3 px-4 font-semibold">Range Gauge</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-center font-semibold">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.results?.map((res) => {
                const isExpanded = expandedTest === res.test_name;
                const explanation = report.analysis?.explanations?.find(
                  (e) => e.test_name.toLowerCase() === res.test_name.toLowerCase()
                );

                return (
                  <React.Fragment key={res.id}>
                    <tr
                      onClick={() => toggleExpand(res.test_name)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-slate-50/80' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#0A0F1D]">{res.test_name}</td>
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {res.measured_value}
                        </span>{' '}
                        <span className="text-slate-500 text-[11px]">{res.unit}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {res.laboratory_reference_text ||
                          (res.reference_range_low !== null && res.reference_range_high !== null
                            ? `${res.reference_range_low} – ${res.reference_range_high} ${res.unit}`
                            : 'N/A')}
                      </td>
                      <td className="py-3.5 px-4">{renderRangeGauge(res)}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                            res.comparison_status === 'normal'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : res.comparison_status === 'high'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : res.comparison_status === 'low'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {res.comparison_status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button className="text-slate-400 hover:text-slate-900 transition-colors">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 mx-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mx-auto" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explanation Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-slate-200">
                        <td colSpan={6} className="p-6">
                          <div className="max-w-3xl space-y-3 text-xs leading-relaxed">
                            {explanation ? (
                              <>
                                <div>
                                  <h4 className="font-bold text-[#0A0F1D] font-editorial mb-0.5">
                                    What this test measures:
                                  </h4>
                                  <p className="text-slate-600">{explanation.plain_explanation}</p>
                                </div>
                                <div>
                                  <h4 className="font-bold text-[#0A0F1D] font-editorial mb-0.5">
                                    Clinical Significance:
                                  </h4>
                                  <p className="text-slate-600">{explanation.clinical_significance}</p>
                                </div>
                                {explanation.questions_for_doctor?.length > 0 && (
                                  <div>
                                    <h4 className="font-bold text-blue-600 font-mono uppercase tracking-wider mb-1">
                                      Questions for your doctor:
                                    </h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1">
                                      {explanation.questions_for_doctor.map((q, idx) => (
                                        <li key={idx}>{q}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-slate-500 font-mono italic">
                                Detailed AI explanation can be queried in the AI Assistant tab.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Doctor Discussion Questions Checklist */}
      {report.analysis?.doctor_questions && report.analysis.doctor_questions.length > 0 && (
        <div className="p-6 sm:p-8 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-[#0A0F1D] font-editorial">
              Questions to Bring to Your Doctor
            </h3>
          </div>
          <div className="space-y-2">
            {report.analysis.doctor_questions.map((q, i) => (
              <label
                key={i}
                className="flex items-start gap-3 p-3.5 bg-slate-50 border border-slate-200 transition-colors cursor-pointer hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded-none text-blue-600 border-slate-300 focus:ring-blue-600 cursor-pointer"
                />
                <span className="text-xs text-slate-800 leading-relaxed font-sans">{q}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
