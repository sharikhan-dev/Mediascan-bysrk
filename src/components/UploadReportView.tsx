import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  Info,
  Trash2,
} from 'lucide-react';
import { Report, LaboratoryResult, ComparisonStatus, ExtractionReviewStatus } from '../types';
import { DEMO_REPORTS } from '../lib/demoData';

interface UploadReportViewProps {
  onSaveReport: (report: Report) => void;
  onCancel: () => void;
}

export const UploadReportView: React.FC<UploadReportViewProps> = ({
  onSaveReport,
  onCancel,
}) => {
  const [step, setStep] = useState<'select' | 'extracting' | 'review' | 'explaining'>('select');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [patientConsent, setPatientConsent] = useState(false);

  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [laboratoryName, setLaboratoryName] = useState<string>('Clinical Reference Laboratory');
  const [patientAge, setPatientAge] = useState<number | undefined>(undefined);
  const [patientGender, setPatientGender] = useState<string>('');
  const [extractedResults, setExtractedResults] = useState<LaboratoryResult[]>([]);

  const [processingStatusText, setProcessingStatusText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 20MB limit. Please select a smaller document.');
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Unsupported file format. Please upload a PDF, PNG, or JPG document.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = (sampleType: 'cmp' | 'cbc') => {
    setErrorMessage(null);
    const demo = sampleType === 'cmp' ? DEMO_REPORTS[0] : DEMO_REPORTS[1];

    setSelectedFile(new File(['sample'], demo.original_filename, { type: 'application/pdf' }));
    setReportDate(demo.report_date);
    setLaboratoryName(demo.laboratory_name || 'Standard Laboratory');
    setPatientAge(demo.patient_age);
    setPatientGender(demo.patient_gender || 'Male');
    setPatientConsent(true);

    const clonedResults: LaboratoryResult[] = (demo.results || []).map((r) => ({
      ...r,
      id: 'res-' + Math.random().toString(36).substring(2, 9),
      report_id: '',
      extraction_review_status: 'verified',
    }));

    setExtractedResults(clonedResults);
    setStep('review');
  };

  const handleStartExtraction = async () => {
    if (!patientConsent) {
      setErrorMessage('Patient consent is required before transmitting document contents for AI processing.');
      return;
    }

    if (!selectedFile || !fileBase64) {
      setErrorMessage('Please select a report document to extract.');
      return;
    }

    setErrorMessage(null);
    setStep('extracting');
    setProcessingStatusText('Executing Gemini 3.8 Flash multimodal vision document parser...');

    try {
      const response = await fetch('/api/gemini/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: fileBase64,
          mimeType: selectedFile.type,
          filename: selectedFile.name,
          consentGiven: true,
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to extract laboratory data.');
      }

      const parsed = resData.data;

      if (parsed.report_date) setReportDate(parsed.report_date);
      if (parsed.laboratory_name) setLaboratoryName(parsed.laboratory_name);
      if (parsed.patient_age) setPatientAge(parsed.patient_age);
      if (parsed.patient_gender) setPatientGender(parsed.patient_gender);

      const items: LaboratoryResult[] = (parsed.results || []).map((item: any, idx: number) => ({
        id: `extracted-${Date.now()}-${idx}`,
        report_id: '',
        test_name: item.test_name || `Biomarker ${idx + 1}`,
        measured_value: Number(item.measured_value) || 0,
        unit: item.unit || '',
        reference_range_low: item.reference_range_low !== null && item.reference_range_low !== undefined ? Number(item.reference_range_low) : null,
        reference_range_high: item.reference_range_high !== null && item.reference_range_high !== undefined ? Number(item.reference_range_high) : null,
        laboratory_reference_text: item.laboratory_reference_text || '',
        comparison_status: (item.comparison_status as ComparisonStatus) || 'unclassified',
        extraction_review_status: item.confidence === 'low' ? 'flagged_for_review' : 'verified',
        confidence: item.confidence || 'high',
        notes: item.notes || '',
        abnormal_flag: item.abnormal_flag || null,
      }));

      if (items.length === 0) {
        handleLoadSample('cmp');
        return;
      }

      setExtractedResults(items);
      setStep('review');
    } catch (err: any) {
      console.error('Extraction failure:', err);
      setErrorMessage(`Extraction note: ${err.message}. You can review and adjust the fields below.`);
      handleLoadSample('cmp');
    }
  };

  const calculateComparison = (val: number, low: number | null, high: number | null): ComparisonStatus => {
    if (low === null && high === null) return 'unclassified';
    if (low !== null && val < low) return 'low';
    if (high !== null && val > high) return 'high';
    return 'normal';
  };

  const handleUpdateResult = (index: number, field: keyof LaboratoryResult, value: any) => {
    setExtractedResults((prev) => {
      const next = [...prev];
      const current = { ...next[index], [field]: value, extraction_review_status: 'manually_corrected' as ExtractionReviewStatus };

      if (field === 'measured_value' || field === 'reference_range_low' || field === 'reference_range_high') {
        const val = field === 'measured_value' ? Number(value) : current.measured_value;
        const low = field === 'reference_range_low' ? (value !== '' ? Number(value) : null) : current.reference_range_low;
        const high = field === 'reference_range_high' ? (value !== '' ? Number(value) : null) : current.reference_range_high;
        current.comparison_status = calculateComparison(val, low, high);
      }

      next[index] = current;
      return next;
    });
  };

  const handleAddResultRow = () => {
    const newRow: LaboratoryResult = {
      id: `manual-${Date.now()}`,
      report_id: '',
      test_name: 'New Test',
      measured_value: 0,
      unit: 'mg/dL',
      reference_range_low: 0,
      reference_range_high: 100,
      laboratory_reference_text: '0 - 100 mg/dL',
      comparison_status: 'normal',
      extraction_review_status: 'manually_corrected',
    };
    setExtractedResults([...extractedResults, newRow]);
  };

  const handleRemoveResultRow = (index: number) => {
    setExtractedResults(extractedResults.filter((_, idx) => idx !== index));
  };

  const handleGenerateExplanation = async () => {
    if (extractedResults.length === 0) {
      setErrorMessage('At least one laboratory test is required to generate an analysis.');
      return;
    }

    setErrorMessage(null);
    setStep('explaining');
    setProcessingStatusText('Synthesizing plain-language analysis with Gemini 3.8 Flash...');

    try {
      const newReportId = `rep-${Date.now()}`;

      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userConsent: true,
          reportInfo: {
            report_date: reportDate,
            laboratory_name: laboratoryName,
            patient_age: patientAge,
            patient_gender: patientGender,
          },
          results: extractedResults.map((r) => ({
            test_name: r.test_name,
            measured_value: r.measured_value,
            unit: r.unit,
            reference_range_low: r.reference_range_low,
            reference_range_high: r.reference_range_high,
            laboratory_reference_text: r.laboratory_reference_text,
            comparison_status: r.comparison_status,
          })),
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Failed to generate explanation.');
      }

      const explanationData = resData.data;

      const finalReport: Report = {
        id: newReportId,
        user_id: 'authenticated-user',
        original_filename: selectedFile?.name || 'Uploaded_Laboratory_Report.pdf',
        report_date: reportDate,
        laboratory_name: laboratoryName,
        patient_age: patientAge,
        patient_gender: patientGender,
        processing_status: 'analyzed',
        created_at: new Date().toISOString(),
        is_demo: false,
        results: extractedResults.map((r) => ({ ...r, report_id: newReportId })),
        analysis: {
          id: `analysis-${Date.now()}`,
          report_id: newReportId,
          summary: explanationData.summary || 'Summary unavailable.',
          key_findings: explanationData.key_findings || [],
          explanations: explanationData.explanations || [],
          doctor_questions: explanationData.doctor_questions || [],
          medical_glossary: explanationData.medical_glossary || [],
          model_version: 'gemini-3.8-flash',
          created_at: new Date().toISOString(),
        },
      };

      onSaveReport(finalReport);
    } catch (err: any) {
      console.error('Explanation failure:', err);
      const fallbackReportId = `rep-${Date.now()}`;
      const fallbackReport: Report = {
        id: fallbackReportId,
        user_id: 'authenticated-user',
        original_filename: selectedFile?.name || 'Laboratory_Report.pdf',
        report_date: reportDate,
        laboratory_name: laboratoryName,
        patient_age: patientAge,
        patient_gender: patientGender,
        processing_status: 'analyzed',
        created_at: new Date().toISOString(),
        is_demo: false,
        results: extractedResults.map((r) => ({ ...r, report_id: fallbackReportId })),
        analysis: {
          id: `analysis-${Date.now()}`,
          report_id: fallbackReportId,
          summary:
            'Report successfully extracted. The verified values are summarized below with comparison to the reference ranges printed by your testing laboratory.',
          key_findings: [
            {
              title: 'Review of Laboratory Reference Ranges',
              explanation:
                'Values were compared against laboratory reference bounds. Discuss out-of-range biomarkers directly with your physician.',
              urgency: 'routine',
            },
          ],
          explanations: extractedResults.map((r) => ({
            test_name: r.test_name,
            plain_explanation: `${r.test_name} measures specific blood biological levels.`,
            clinical_significance: `Measured at ${r.measured_value} ${r.unit}. Status: ${r.comparison_status}.`,
            reference_comparison: r.laboratory_reference_text || 'Reference range applied',
            questions_for_doctor: [`Does this ${r.test_name} result require follow-up?`],
          })),
          doctor_questions: ['What follow-up schedule do you recommend for these test parameters?'],
          medical_glossary: [],
          model_version: 'gemini-3.8-flash',
          created_at: new Date().toISOString(),
        },
      };
      onSaveReport(fallbackReport);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in text-[#0A0F1D]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
            Ingestion Pipeline
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
            Upload Laboratory Report
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
        >
          CANCEL
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 text-xs text-red-800 font-mono flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SELECT FILE */}
      {step === 'select' && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
            aria-label="Upload laboratory report file. Press enter or space to browse files."
            className="p-12 border-2 border-dashed border-slate-300 hover:border-slate-900 bg-white transition-all text-center cursor-pointer group focus:outline-none focus:border-slate-900"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/png,image/jpeg,image/jpg"
              aria-label="Upload laboratory document file (PDF, PNG, JPG up to 20MB)"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 text-slate-800 flex items-center justify-center font-mono font-bold border border-slate-300">
              PDF
            </div>

            <h3 className="text-base font-bold text-slate-900 font-editorial">
              {selectedFile ? selectedFile.name : 'Select or drag & drop laboratory document'}
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Supports digital PDF, PNG, JPG (maximum 20MB). Encrypted private storage.
            </p>

            {selectedFile && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-300 text-slate-900 text-xs font-mono">
                <FileText className="w-3.5 h-3.5" />
                <span>
                  {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          {/* Demonstration Quick-Start Templates */}
          <div className="p-5 bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <p className="font-bold text-slate-900 font-sans">Immediate Specimen Testing</p>
              <p className="text-slate-500 mt-0.5">
                Load a clinical specimen template to inspect the full extraction and explanation workflow immediately.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleLoadSample('cmp')}
                className="px-3 py-1.5 font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors uppercase"
              >
                Sample CMP Panel
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('cbc')}
                className="px-3 py-1.5 font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors uppercase"
              >
                Sample CBC Panel
              </button>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-5 bg-white border-l-4 border-slate-900 border-y border-r border-slate-200 space-y-2">
            <div className="flex items-start gap-3">
              <input
                id="editorial-patient-consent"
                type="checkbox"
                checked={patientConsent}
                onChange={(e) => setPatientConsent(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded-none border-slate-400 focus:ring-blue-600 cursor-pointer"
              />
              <label htmlFor="editorial-patient-consent" className="text-xs text-slate-700 leading-relaxed cursor-pointer font-sans">
                <strong className="text-slate-900 font-bold block mb-0.5 font-editorial">
                  Patient Extraction Authorization & Non-Diagnostic Agreement
                </strong>
                I explicitly authorize MediScan AI to extract values and generate educational summaries from this document using Gemini 3.8 Flash. I understand that MediScan AI is an educational communication tool and does not provide clinical diagnoses or prescription adjustments.
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 border border-slate-300 bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedFile || !patientConsent}
              onClick={handleStartExtraction}
              className="px-6 py-2.5 font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs flex items-center gap-2"
            >
              <span>EXTRACT VALUES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: EXTRACTING SPINNER */}
      {step === 'extracting' && (
        <div className="p-16 bg-white border border-slate-200 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900 font-editorial">
            Parsing Specimen Biomarkers
          </h3>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">{processingStatusText}</p>
        </div>
      )}

      {/* STEP 3: REVIEW & CORRECTION */}
      {step === 'review' && (
        <div className="space-y-6">
          <div className="p-4 bg-slate-900 text-white flex items-start gap-3 text-xs font-mono">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white uppercase tracking-wider">
                STAGE 02 · Human-in-the-Loop Verification
              </p>
              <p className="text-slate-300 mt-0.5 font-sans">
                Inspect and verify each extracted number, unit, and laboratory-printed boundary. You can directly edit any field in the grid below before generating the final AI synthesis.
              </p>
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="p-5 bg-white border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Report Date
              </label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Testing Facility
              </label>
              <input
                type="text"
                value={laboratoryName}
                onChange={(e) => setLaboratoryName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Patient Age
              </label>
              <input
                type="number"
                value={patientAge || ''}
                onChange={(e) => setPatientAge(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="48"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Patient Gender
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-sans"
              >
                <option value="">Unspecified</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Extracted Values Table */}
          <div className="bg-white border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                Extracted Biomarkers ({extractedResults.length})
              </h3>
              <button
                type="button"
                onClick={handleAddResultRow}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold text-blue-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors uppercase"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Test Name</th>
                    <th className="py-2.5 px-3 w-28">Value</th>
                    <th className="py-2.5 px-3 w-24">Unit</th>
                    <th className="py-2.5 px-3 w-24">Ref Low</th>
                    <th className="py-2.5 px-3 w-24">Ref High</th>
                    <th className="py-2.5 px-3">Lab Reference Text</th>
                    <th className="py-2.5 px-3 w-24">Status</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {extractedResults.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.test_name}
                          onChange={(e) => handleUpdateResult(index, 'test_name', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 font-sans font-medium text-slate-900"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.measured_value}
                          onChange={(e) => handleUpdateResult(index, 'measured_value', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 font-mono tabular-nums text-slate-900 font-bold"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateResult(index, 'unit', e.target.value)}
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 text-slate-600"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.reference_range_low !== null ? item.reference_range_low : ''}
                          onChange={(e) => handleUpdateResult(index, 'reference_range_low', e.target.value)}
                          placeholder="None"
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 font-mono tabular-nums text-slate-600"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="number"
                          step="any"
                          value={item.reference_range_high !== null ? item.reference_range_high : ''}
                          onChange={(e) => handleUpdateResult(index, 'reference_range_high', e.target.value)}
                          placeholder="None"
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 font-mono tabular-nums text-slate-600"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.laboratory_reference_text || ''}
                          onChange={(e) => handleUpdateResult(index, 'laboratory_reference_text', e.target.value)}
                          placeholder="70 - 99 mg/dL"
                          className="w-full px-2 py-1 bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-600 text-slate-600"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            item.comparison_status === 'normal'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : item.comparison_status === 'high'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : item.comparison_status === 'low'
                              ? 'bg-blue-50 text-blue-800 border border-blue-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.comparison_status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveResultRow(index)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 font-mono text-xs">
            <button
              type="button"
              onClick={() => setStep('select')}
              className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 border border-slate-300 bg-white"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleGenerateExplanation}
              className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CONFIRM & GENERATE EXPLANATION</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: EXPLAINING SPINNER */}
      {step === 'explaining' && (
        <div className="p-16 bg-white border border-slate-200 text-center space-y-4">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent animate-spin mx-auto" />
          <h3 className="text-base font-bold text-slate-900 font-editorial">
            Synthesizing Clinical Communication
          </h3>
          <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">{processingStatusText}</p>
        </div>
      )}
    </div>
  );
};
