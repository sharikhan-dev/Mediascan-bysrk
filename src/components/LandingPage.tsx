import React from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Check,
  Activity,
  FileText,
  TrendingUp,
  Download,
  AlertTriangle,
  Lock,
  EyeOff,
  Terminal,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreFeatures,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A0F1D]">
      {/* 1. ASYMMETRIC EDITORIAL HERO */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Editorial Kicker & Date Marker */}
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-10 text-[11px] font-mono tracking-wider text-slate-500 uppercase">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-xs" />
              <span>Diagnostic Communication Architecture</span>
              <span className="text-slate-300">/</span>
              <span>Gemini 3.8 Intelligence</span>
            </div>
            <div className="hidden sm:block">
              <span>ISO 15189 Aligned Extraction Standard</span>
            </div>
          </div>

          {/* Asymmetric Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Column (7 cols): Oversized Expressive Typography */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600 block">
                  Clinical Precision / Plain Language
                </span>
                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold tracking-[-0.04em] text-[#0A0F1D] leading-[0.98] font-editorial text-balance">
                  Understand your health reports.
                  <br />
                  <span className="font-light italic text-slate-500">Clearly.</span>
                </h1>
              </div>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                Turn complex laboratory blood test panels into understandable insights with verified reference range extraction, doctor-ready discussion points, and longitudinal health tracking.
              </p>

              {/* Editorial Action Group */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#0A0F1D] hover:bg-blue-600 rounded-none transition-colors shadow-sm tracking-tight group"
                >
                  <span>Analyze Your Report</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
                <button
                  onClick={onExploreFeatures}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-medium text-slate-700 hover:text-[#0A0F1D] border border-slate-300 hover:border-slate-400 bg-white rounded-none transition-colors"
                >
                  <span>Read Methodology</span>
                </button>
              </div>

              {/* Swiss Minimal Metrics Baseline */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6 text-xs">
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0A0F1D]">0.0%</div>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Hallucinated Ranges</span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-blue-600">100%</div>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Human-in-the-Loop Review</span>
                </div>
                <div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0A0F1D]">RLS</div>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">Isolated Storage Tier</span>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Authentic Laboratory Specimen Sheet (Breaks typical AI card template) */}
            <div className="lg:col-span-5 lg:-mt-4">
              <div className="bg-white border-2 border-[#0A0F1D] shadow-[8px_8px_0px_0px_#0A0F1D] p-6 sm:p-8 space-y-6">
                {/* Laboratory Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                  <div>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                      Specimen Document #2026-CMP
                    </div>
                    <div className="text-base font-bold text-slate-900 font-editorial tracking-tight mt-0.5">
                      Comprehensive Metabolic Panel
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Quest Diagnostics · Ref #91428
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                    Demo Data
                  </span>
                </div>

                {/* Tabular Specimen Rows */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Fasting Glucose</div>
                      <div className="text-[11px] text-slate-500">Ref: 70 – 99 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-amber-600">104 mg/dL</div>
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">▲ Elevated</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">Serum Creatinine</div>
                      <div className="text-[11px] text-slate-500">Ref: 0.60 – 1.30 mg/dL</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">0.95 mg/dL</div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Optimal</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">eGFR (Filtration)</div>
                      <div className="text-[11px] text-slate-500">Ref: &gt; 60 mL/min</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">94 mL/min</div>
                      <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Normal</div>
                    </div>
                  </div>
                </div>

                {/* Gemini Plain Language Translation Box */}
                <div className="p-4 bg-[#0A0F1D] text-slate-200 text-xs space-y-2 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>Clinical Plain-Language Translation</span>
                    <span className="text-blue-400">Gemini 3.8</span>
                  </div>
                  <p className="leading-relaxed font-sans text-slate-300">
                    “Renal function is healthy with high filtration capacity. Fasting glucose at 104 mg/dL is slightly above the 99 mg/dL reference limit. Recommended action: Request an HbA1c test from your physician.”
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Data strictly isolated</span>
                  <button
                    onClick={onGetStarted}
                    className="font-bold text-blue-600 hover:underline uppercase tracking-wider"
                  >
                    Test Live Specimen →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FULL-WIDTH TYPOGRAPHIC MANIFESTO STRIP */}
      <section className="py-16 bg-[#0A0F1D] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-3">
              <span className="text-xs font-mono uppercase tracking-widest text-blue-400 block mb-2">
                Core Principle
              </span>
              <h2 className="text-2xl font-bold tracking-tight font-editorial">
                The Non-Diagnostic Boundary.
              </h2>
            </div>
            <div className="lg:col-span-9 pl-0 lg:pl-8 border-l-0 lg:border-l border-slate-800">
              <p className="text-xl sm:text-2xl font-light text-slate-300 leading-relaxed text-balance font-editorial">
                “Medical AI should never masquerade as a doctor, invent diagnoses, or induce alarm. It exists to bridge the clinical literacy gap—giving patients verified data, clear explanations, and specific questions for their next consultation.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ASYMMETRIC ARCHITECTURAL FEATURES (NO REPETITIVE 3-CARD TEMPLATES) */}
      <section id="features" className="py-24 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600">
                01 / Capabilities
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-2">
                Engineered for transparency.
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-md">
              Each capability is built around clinical verification, human review, and mathematical reference accuracy.
            </p>
          </div>

          {/* Asymmetric Feature Layout 1: Split Full Width Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Big Feature: AI Explanations */}
            <div className="lg:col-span-7 bg-white border border-slate-200 p-8 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Feature 01 · Synthesis
                </span>
                <h3 className="text-3xl font-bold text-[#0A0F1D] font-editorial tracking-tight">
                  Plain-Language Explanations Without Medical Jargon.
                </h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Laboratory documents often leave patients anxious with cryptic abbreviations and asterisks. MediScan AI translates each biomarker into clear biological context—what it does in your body, how your number compares with the lab's printed range, and whether the finding warrants routine or prompt review.
                </p>
              </div>

              {/* Concrete Example Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>OUTPUT FORMAT: JSON-SCHEMA</span>
                  <span className="text-emerald-600 font-bold">VERIFIED</span>
                </div>
                <div className="text-slate-800">
                  <span className="text-blue-600 font-bold">Hemoglobin:</span> 15.1 g/dL · Normal reference 13.5–17.5 g/dL. Represents optimal oxygen carrying capacity with no indication of anemia.
                </div>
              </div>
            </div>

            {/* Right Feature: Human Verification Step */}
            <div className="lg:col-span-5 bg-white border border-slate-200 p-8 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                  Feature 02 · Control
                </span>
                <h3 className="text-2xl font-bold text-[#0A0F1D] font-editorial tracking-tight">
                  Mandatory Human-in-the-Loop Review.
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Before generating explanations, you are presented with an interactive Extracted Values Review sheet. You can edit any value, correct ambiguous units, or add missing rows. Unverified data is never treated as fact.
                </p>
              </div>

              <div className="space-y-2 text-xs font-mono pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Digital PDF Extraction</span>
                  <span className="font-bold text-slate-900">Direct Parser</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Scanned Document OCR</span>
                  <span className="font-bold text-slate-900">Gemini 3.8 Multimodal</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Unclear Range Handling</span>
                  <span className="font-bold text-amber-700">Flagged For Review</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asymmetric Feature Layout 2: 3 Distinct Structural Strips */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Strip 1: Longitudinal Tracking */}
            <div className="bg-white border border-slate-200 p-8 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Feature 03 · Trends
              </span>
              <h4 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Longitudinal Health Trajectories
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Plot test results over time across multiple laboratory visits. Automated unit checking detects when different labs use incompatible measurement systems or differing reference ranges.
              </p>
            </div>

            {/* Strip 2: Doctor Questions */}
            <div className="bg-white border border-slate-200 p-8 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Feature 04 · Consultation
              </span>
              <h4 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Printable Doctor Discussion Sheets
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate high-relevance consultation questions tailored to your exact findings. Bring a clean, print-formatted summary sheet directly to your next physical appointment.
              </p>
            </div>

            {/* Strip 3: Medical Glossary */}
            <div className="bg-white border border-slate-200 p-8 space-y-4">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                Feature 05 · Reference
              </span>
              <h4 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Instant Medical Glossary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access concise 1-sentence definitions for complex biological markers like eGFR, Bilirubin, Mean Corpuscular Volume (MCV), and Alanine Aminotransferase (ALT).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. METHODOLOGY (SWISS NUMBERED SECTION) */}
      <section id="how-it-works" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/80">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600">
                02 / Methodology
              </span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-2">
                How the extraction pipeline operates.
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">STAGE 1 → STAGE 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="text-5xl font-extrabold font-mono text-slate-200 tracking-tighter">
                01.
              </div>
              <h3 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Document Ingestion & Untrusted Content Sanitization
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload your digital laboratory PDF or photo. Documents are treated as untrusted clinical data payloads—never as model execution instructions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <div className="text-5xl font-extrabold font-mono text-blue-600 tracking-tighter">
                02.
              </div>
              <h3 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Reference Range Extraction & Human Validation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Biomarkers, units, and laboratory-printed boundary ranges are extracted and presented in an editable review table for your explicit confirmation.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <div className="text-5xl font-extrabold font-mono text-slate-200 tracking-tighter">
                03.
              </div>
              <h3 className="text-xl font-bold text-[#0A0F1D] font-editorial">
                Clinical Synthesis & Consultation Preparation
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gemini 3.8 Flash synthesizes key findings, urgency categories, and specific consultation questions with zero diagnosis or medication recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DATA GOVERNANCE & ISOLATION PROTOCOL (DARK EDITORIAL CONTRAST) */}
      <section id="privacy" className="py-24 bg-[#0A0F1D] text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-400 block">
                03 / Data Protocol
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight font-editorial leading-[1.05]">
                Isolated by design.
                <br />
                <span className="text-slate-400 font-light">Owned by you.</span>
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Medical information carries the highest privacy expectation. MediScan AI enforces strict cryptographic row-level access, private storage isolation, and single-click cascade deletion.
              </p>

              <div className="p-4 bg-slate-900 border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Database Engine</span>
                  <span className="text-white font-bold">PostgreSQL + RLS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bucket Access</span>
                  <span className="text-emerald-400 font-bold">Authenticated Only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Retention</span>
                  <span className="text-white font-bold">Zero Model Training</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-900/60 border border-slate-800 space-y-3">
                <Lock className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold font-editorial">Row-Level Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  PostgreSQL RLS policies restrict all record access strictly to the authenticated user ID. Unauthorized cross-tenant queries are rejected at the database engine level.
                </p>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 space-y-3">
                <EyeOff className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold font-editorial">Zero Model Training</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Uploaded blood test reports and extracted measurements are processed statelessly and never retained for training public AI models.
                </p>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 space-y-3">
                <Terminal className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold font-editorial">No Public URLs</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Storage buckets reject unauthenticated reads and direct URL object access. Files are only accessible via authenticated authorization tokens.
                </p>
              </div>

              <div className="p-6 bg-slate-900/60 border border-slate-800 space-y-3">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold font-editorial">User Cascade Deletion</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Delete individual laboratory records or wipe your entire historical profile in Settings with immediate cryptographic database cascade deletion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EDITORIAL FAQ SECTION */}
      <section id="faq" className="py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="border-b border-slate-200/80 pb-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-blue-600">
                04 / Clarifications
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-2">
                Frequently Asked Questions
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:block">4 ENTRIES</span>
          </div>

          <div className="divide-y divide-slate-200">
            <div className="py-6 space-y-2">
              <span className="text-xs font-mono text-slate-400">01. FORMATS</span>
              <h3 className="text-lg font-bold text-[#0A0F1D] font-editorial">
                What file types and formats are supported?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                MediScan AI accepts digital PDF documents (both native electronic laboratory printouts and scanned documents) as well as standard image formats (JPG, JPEG, PNG, WEBP) up to 20MB.
              </p>
            </div>

            <div className="py-6 space-y-2">
              <span className="text-xs font-mono text-slate-400">02. EXTRACTION ACCURACY</span>
              <h3 className="text-lg font-bold text-[#0A0F1D] font-editorial">
                How does MediScan AI prevent AI hallucination of lab values?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                MediScan AI decouples extraction from explanation. Before any AI synthesis occurs, you are presented with the Extracted Values Review table where you inspect each test name, measured value, unit, and printed laboratory bounds.
              </p>
            </div>

            <div className="py-6 space-y-2">
              <span className="text-xs font-mono text-slate-400">03. CLINICAL BOUNDARIES</span>
              <h3 className="text-lg font-bold text-[#0A0F1D] font-editorial">
                Does MediScan AI diagnose illnesses or provide prescriptions?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                No. MediScan AI is an educational communication tool designed to help you prepare for physician consultations. It does not provide medical diagnoses, treatment plans, or medication adjustments.
              </p>
            </div>

            <div className="py-6 space-y-2">
              <span className="text-xs font-mono text-slate-400">04. DATA OWNERSHIP</span>
              <h3 className="text-lg font-bold text-[#0A0F1D] font-editorial">
                Can I export or delete all of my medical records?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. You maintain sovereign control over your records. From the Settings workspace, you can print summaries, copy the Supabase PostgreSQL migration schema, or trigger an irreversible cascade deletion of all your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TYPOGRAPHIC FOOTER & MANDATORY DISCLAIMER */}
      <footer className="bg-[#0A0F1D] text-slate-400 pt-16 pb-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Prominent Medical Notice */}
          <div className="p-6 bg-slate-900 border border-slate-800 flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed text-slate-300">
              <strong className="text-white block font-editorial text-sm">
                MANDATORY CLINICAL NOTICE & DISCLAIMER
              </strong>
              <p className="text-xs text-slate-400">
                MediScan AI is an informational and educational software platform intended solely to assist users in reading laboratory reports and organizing clinical communication. MediScan AI does not practice medicine, diagnose medical conditions, provide clinical consultations, or formulate treatment courses. Always seek the advice of a qualified physician with any questions regarding laboratory results.
              </p>
            </div>
          </div>

          {/* Swiss Footer Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-slate-800 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white font-editorial text-base font-bold">
                <span className="w-2 h-2 bg-blue-500" />
                <span>MediScan.ai</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                A typography-first clinical communication system for laboratory report comprehension.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-3">
                Index
              </span>
              <ul className="space-y-2">
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Workspace</button></li>
                <li><a href="#features" className="hover:text-white transition-colors">Capabilities</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Methodology</a></li>
                <li><a href="#privacy" className="hover:text-white transition-colors">Data Protocol</a></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-3">
                Architecture
              </span>
              <ul className="space-y-2 text-slate-500">
                <li><span>Gemini 3.8 Flash Vision</span></li>
                <li><span>PostgreSQL Row-Level Security</span></li>
                <li><span>Client/Server Isolation</span></li>
                <li><span>Zero Model Retention</span></li>
              </ul>
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 block mb-3">
                Governance
              </span>
              <ul className="space-y-2 text-slate-500">
                <li><span>Clinical Non-Diagnostic Policy</span></li>
                <li><span>Patient Privacy Charter</span></li>
                <li><span>Terms of Clinical Use</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 font-mono gap-4">
            <p>© 2026 MediScan AI. All rights reserved.</p>
            <div>
              <span>TYPOGRAPHY-FIRST MEDICAL ARCHITECTURE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
