import React, { useState, useEffect } from 'react';
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
  FileCheck,
  Shield,
  FileText,
  Sliders,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Stethoscope,
  Info,
} from 'lucide-react';
import { Report, LaboratoryResult } from '../types';

interface ReportDetailViewProps {
  report: Report;
  onBack: () => void;
  onDeleteReport: (reportId: string) => void;
  onAskAI: (report: Report) => void;
  autoOpenExport?: boolean;
}

type ExportPreset = 'full' | 'summary' | 'physician';

interface ExportConfig {
  preset: ExportPreset;
  includeExplanations: boolean;
  includeDoctorQuestions: boolean;
  includeGlossary: boolean;
  includeSignatureBlock: boolean;
  includeKeyFindings: boolean;
}

export const ReportDetailView: React.FC<ReportDetailViewProps> = ({
  report,
  onBack,
  onDeleteReport,
  onAskAI,
  autoOpenExport = false,
}) => {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(autoOpenExport);
  const [isExporting, setIsExporting] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    preset: 'full',
    includeExplanations: true,
    includeDoctorQuestions: true,
    includeGlossary: true,
    includeSignatureBlock: true,
    includeKeyFindings: true,
  });

  const [expandAllForExport, setExpandAllForExport] = useState(false);

  // Apply preset choices
  const handleSelectPreset = (preset: ExportPreset) => {
    if (preset === 'full') {
      setExportConfig({
        preset: 'full',
        includeExplanations: true,
        includeDoctorQuestions: true,
        includeGlossary: true,
        includeSignatureBlock: true,
        includeKeyFindings: true,
      });
    } else if (preset === 'summary') {
      setExportConfig({
        preset: 'summary',
        includeExplanations: false,
        includeDoctorQuestions: false,
        includeGlossary: false,
        includeSignatureBlock: false,
        includeKeyFindings: true,
      });
    } else if (preset === 'physician') {
      setExportConfig({
        preset: 'physician',
        includeExplanations: false,
        includeDoctorQuestions: true,
        includeGlossary: false,
        includeSignatureBlock: true,
        includeKeyFindings: true,
      });
    }
  };

  const toggleExpand = (testName: string) => {
    setExpandedTest(expandedTest === testName ? null : testName);
  };

  // Perform PDF Export via browser print engine with formatted document title and settings
  const triggerPDFExport = () => {
    setIsExporting(true);
    setShowExportModal(false);

    // Expand biomarker explanations if enabled in options
    setExpandAllForExport(exportConfig.includeExplanations);

    // Set descriptive document title so the browser default PDF filename is pristine
    const originalTitle = document.title;
    const cleanLab = (report.laboratory_name || 'Laboratory').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanSpecimen = report.original_filename
      .replace(/\.pdf$/i, '')
      .replace(/[^a-zA-Z0-9]/g, '_');
    const generatedFilename = `MediScan_${report.report_date}_${cleanLab}_${cleanSpecimen}`;
    document.title = generatedFilename;

    // Small delay for DOM layout reflow before triggering native print dialog
    setTimeout(() => {
      window.print();

      // Clean up after print window opens / resolves
      setTimeout(() => {
        document.title = originalTitle;
        setIsExporting(false);
        setExportToast('PDF export complete. Review your saved document in Downloads.');
        setTimeout(() => setExportToast(null), 4000);
      }, 500);
    }, 200);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  // Precise Reference Range Gauge (works in screen and print with sharp visual borders)
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
    const totalSpan = gaugeMax - gaugeMin || 1;

    const normalLeftPct = Math.max(0, Math.min(100, ((low - gaugeMin) / totalSpan) * 100));
    const normalWidthPct = Math.max(5, Math.min(100, (rangeSpan / totalSpan) * 100));

    let dotPct = ((val - gaugeMin) / totalSpan) * 100;
    dotPct = Math.max(3, Math.min(97, dotPct));

    const isHigh = val > high;
    const isLow = val < low;

    return (
      <div className="w-36 space-y-1">
        <div className="relative h-2 w-full bg-slate-100 overflow-hidden border border-slate-300">
          {/* Normal Target Range Band */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-200 border-x border-emerald-400"
            style={{ left: `${normalLeftPct}%`, width: `${normalWidthPct}%` }}
          />
          {/* Measured Value Position Dot / Bar */}
          <div
            className={`absolute top-0 bottom-0 w-2.5 -ml-1 border border-black/30 ${
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
      {/* Toast Notification (Hidden during print) */}
      {exportToast && (
        <div className="fixed top-5 right-5 z-50 p-4 bg-[#0A0F1D] text-white text-xs font-mono flex items-center gap-3 border border-slate-700 shadow-xl no-print animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportToast}</span>
          <button
            onClick={() => setExportToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Action Row (Hidden during print) */}
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
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            <span>Consult Assistant</span>
          </button>

          {/* Primary PDF Export Action - Opens Print Configuration Modal */}
          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors shadow-xs"
            title="Configure and download formatted medical report as PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT PDF</span>
          </button>

          {/* Quick Direct Print */}
          <button
            onClick={handleDirectPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors"
            title="Open native browser print dialog immediately"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
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

      {/* Official Print Header / Letterhead (Visible ONLY when printed / exported to PDF) */}
      <div className="hidden print-only mb-6 pb-4 border-b-2 border-slate-900 font-mono text-xs">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#0A0F1D] text-white flex items-center justify-center font-bold text-[10px]">
                M+
              </span>
              <span className="text-lg font-bold font-editorial tracking-tight text-slate-900">
                MediScan AI
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                Clinical Laboratory Evaluation Dossier
              </span>
            </div>
            <p className="text-[10px] text-slate-600">
              Biomarker Verification, Laboratory Reference Comparison & Patient Clinical Synthesis
            </p>
          </div>
          <div className="text-right text-[10px] text-slate-600 space-y-0.5">
            <div>Specimen Archive ID: <span className="font-bold text-slate-900">#{report.id.substring(0, 16)}</span></div>
            <div>Export Date & Time: <span className="font-bold text-slate-900">{new Date().toLocaleString()}</span></div>
            <div className="text-emerald-700 font-bold">VERIFIED SOVEREIGN RECORD · RLS PROTECTED</div>
          </div>
        </div>
      </div>

      {/* PDF Export Configuration Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/60 backdrop-blur-xs no-print">
          <div className="bg-white max-w-lg w-full border-2 border-slate-900 shadow-2xl p-6 sm:p-7 space-y-6">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Print Stylesheet Engine
                </span>
                <h3 className="text-xl font-extrabold text-[#0A0F1D] font-editorial mt-0.5">
                  Export Medical Report to PDF
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-900 p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Selection */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider block">
                Select Report Format Preset:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleSelectPreset('full')}
                  className={`p-3 text-left border transition-all ${
                    exportConfig.preset === 'full'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs uppercase">Complete</div>
                  <div className="text-[10px] opacity-80 mt-1 leading-tight font-sans">
                    All biomarkers, AI synthesis, doctor questions & glossary
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('summary')}
                  className={`p-3 text-left border transition-all ${
                    exportConfig.preset === 'summary'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs uppercase">Concise</div>
                  <div className="text-[10px] opacity-80 mt-1 leading-tight font-sans">
                    Biomarker table & executive clinical summary
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset('physician')}
                  className={`p-3 text-left border transition-all ${
                    exportConfig.preset === 'physician'
                      ? 'border-slate-900 bg-slate-900 text-white font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-bold text-xs uppercase">Doctor Sheet</div>
                  <div className="text-[10px] opacity-80 mt-1 leading-tight font-sans">
                    Biomarkers, discussion checklist & signature line
                  </div>
                </button>
              </div>
            </div>

            {/* Fine-Tuning Checkboxes */}
            <div className="p-4 bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
                Included Report Components:
              </span>

              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeKeyFindings}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeKeyFindings: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded-none text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Include Key Clinical Findings & Urgency Flags</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeExplanations}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeExplanations: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded-none text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Expand Plain-Language AI Explanations for all Biomarkers</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeDoctorQuestions}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeDoctorQuestions: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded-none text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Include "Questions for Your Doctor" Consultation Checklist</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeGlossary}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeGlossary: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded-none text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Include Medical Terminology Reference Glossary</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportConfig.includeSignatureBlock}
                  onChange={(e) =>
                    setExportConfig((prev) => ({
                      ...prev,
                      includeSignatureBlock: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded-none text-slate-900 border-slate-300 focus:ring-0"
                />
                <span>Include Clinician Review Notes & Physician Signature Block</span>
              </label>
            </div>

            {/* Print Instruction Advisory Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 font-sans leading-relaxed">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Browser Print Instructions:</strong> In the system print dialog that opens, select <strong>"Save as PDF"</strong> as the Destination. Ensure <strong>"Background graphics"</strong> is checked to preserve color range indicators.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-600 hover:bg-slate-100 transition-colors uppercase"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerPDFExport}
                className="px-6 py-2.5 text-xs font-mono font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2 uppercase tracking-wide"
              >
                <Download className="w-4 h-4" />
                <span>Generate & Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-white border-2 border-slate-900 p-6 sm:p-8 space-y-6 print-avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
              CLINICAL SPECIMEN ARCHIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
              {report.original_filename.replace('.pdf', '').replace(/_/g, ' ')}
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Source Document: {report.original_filename}
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
        <div className="bg-white border border-slate-200 p-6 sm:p-8 space-y-6 print-avoid-break">
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

          {/* Key Findings (Respects export configuration) */}
          {report.analysis.key_findings &&
            report.analysis.key_findings.length > 0 &&
            exportConfig.includeKeyFindings && (
              <div className="pt-4 border-t border-slate-200 space-y-4 print-avoid-break">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  Key Findings Requiring Attention
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.analysis.key_findings.map((kf, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50 border border-slate-200 space-y-2 print-avoid-break"
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
      <div className="bg-white border border-slate-200 overflow-hidden print-avoid-break">
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
                <th className="py-3 px-4 text-center font-semibold no-print">Explanation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.results?.map((res) => {
                const isExpanded = expandAllForExport || expandedTest === res.test_name;
                const explanation = report.analysis?.explanations?.find(
                  (e) => e.test_name.toLowerCase() === res.test_name.toLowerCase()
                );

                return (
                  <React.Fragment key={res.id}>
                    <tr
                      onClick={() => toggleExpand(res.test_name)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          toggleExpand(res.test_name);
                        }
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`${res.test_name}: ${res.measured_value} ${res.unit}. Status: ${res.comparison_status}. Click or press enter to toggle explanation.`}
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
                      <td className="py-3.5 px-4 text-center no-print">
                        <button
                          type="button"
                          aria-label={isExpanded ? `Collapse explanation for ${res.test_name}` : `Expand explanation for ${res.test_name}`}
                          className="text-slate-400 hover:text-slate-900 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 mx-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mx-auto" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable Explanation Details (expanded when active or in PDF export mode) */}
                    {(isExpanded || (expandAllForExport && exportConfig.includeExplanations)) && explanation && (
                      <tr className="bg-slate-50/90 border-b border-slate-200 print-expanded-row">
                        <td colSpan={6} className="p-5 font-sans">
                          <div className="max-w-3xl space-y-2 text-xs leading-relaxed">
                            <div>
                              <strong className="text-slate-900 font-editorial block">
                                Plain-Language Explanation:
                              </strong>
                              <p className="text-slate-600 mt-0.5">{explanation.plain_explanation}</p>
                            </div>
                            <div>
                              <strong className="text-slate-900 font-editorial block">
                                Clinical Significance:
                              </strong>
                              <p className="text-slate-600 mt-0.5">{explanation.clinical_significance}</p>
                            </div>
                            {explanation.questions_for_doctor?.length > 0 && (
                              <div>
                                <strong className="text-blue-600 font-mono uppercase text-[10px] tracking-wider block">
                                  Questions for your physician:
                                </strong>
                                <ul className="list-disc list-inside space-y-0.5 text-slate-700 pl-1 text-[11px]">
                                  {explanation.questions_for_doctor.map((q, idx) => (
                                    <li key={idx}>{q}</li>
                                  ))}
                                </ul>
                              </div>
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

      {/* Doctor Discussion Questions Checklist (Conditionally included in PDF export) */}
      {report.analysis?.doctor_questions &&
        report.analysis.doctor_questions.length > 0 &&
        exportConfig.includeDoctorQuestions && (
          <div className="p-6 sm:p-8 bg-white border border-slate-200 space-y-4 print-avoid-break">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-[#0A0F1D] font-editorial">
                Questions to Bring to Your Doctor
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-mono no-print">
              Use these formulated questions during your physical appointment or telehealth consultation:
            </p>
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

      {/* Medical Glossary (Conditionally included in PDF export) */}
      {report.analysis?.medical_glossary &&
        report.analysis.medical_glossary.length > 0 &&
        exportConfig.includeGlossary && (
          <div className="p-6 sm:p-8 bg-white border border-slate-200 space-y-4 print-avoid-break">
            <h3 className="text-base font-bold text-[#0A0F1D] font-editorial">
              Medical Terminology Glossary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.analysis.medical_glossary.map((term, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-900 font-editorial">{term.term}</span>
                  <p className="text-xs text-slate-600 leading-relaxed">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Print-Only Physician Review & Signature Block */}
      {exportConfig.includeSignatureBlock && (
        <div className="hidden print-only print-avoid-break mt-8 pt-6 border-t-2 border-slate-900 font-mono text-xs space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-6">
                Reviewing Physician / Clinician Notes
              </span>
              <div className="border-b border-slate-300 h-6 mb-3"></div>
              <div className="border-b border-slate-300 h-6 mb-3"></div>
              <div className="border-b border-slate-300 h-6"></div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-6">
                  Physician Signature
                </span>
                <div className="border-b border-slate-900 h-6"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>License / NPI: ________________</span>
                <span>Date: ________________</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 text-[9px] text-slate-500 leading-normal font-sans">
            <strong>LEGAL & CLINICAL ADVISORY:</strong> This document was prepared by MediScan AI as an informational summary based on verified laboratory extraction. It is not an independent medical diagnosis. Clinical judgment must be exercised by a licensed practitioner in the context of the patient's comprehensive medical history.
          </div>
        </div>
      )}

      {/* Print Running Footer */}
      <div className="hidden print-only mt-4 pt-3 border-t border-slate-200 font-mono text-[9px] text-slate-400 text-center">
        MediScan AI Sovereign Health Platform · Specimen #{report.id.substring(0, 12)} · Verified Clinical Export
      </div>
    </div>
  );
};
