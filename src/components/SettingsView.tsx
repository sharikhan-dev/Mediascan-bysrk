import React, { useState } from 'react';
import {
  User,
  Shield,
  Database,
  Trash2,
  Copy,
  Check,
  LogOut,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { UserProfile } from '../types';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearAllLocalData,
  setLocalUser,
} from '../lib/supabase';

interface SettingsViewProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onLogout: () => void;
  onClearAllReports: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onClearAllReports,
}) => {
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [profileSaved, setProfileSaved] = useState(false);

  const initialConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey);
  const [configSaved, setConfigSaved] = useState(false);

  const [copiedSql, setCopiedSql] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const sqlMigration = `-- MediScan AI Database Schema & RLS Policies (PostgreSQL / Supabase)
-- Execute in your Supabase Project SQL Editor

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  original_filename text not null,
  storage_path text,
  report_date date default current_date,
  laboratory_name text,
  patient_age integer,
  patient_gender text,
  processing_status text default 'pending',
  created_at timestamptz default now()
);

alter table public.reports enable row level security;
create policy "Users manage own reports" on public.reports for all using (auth.uid() = user_id);

create table if not exists public.laboratory_results (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade not null,
  test_name text not null,
  measured_value numeric not null,
  unit text not null,
  reference_range_low numeric,
  reference_range_high numeric,
  laboratory_reference_text text,
  comparison_status text default 'normal',
  extraction_review_status text default 'verified',
  created_at timestamptz default now()
);

alter table public.laboratory_results enable row level security;
create policy "Users manage own results" on public.laboratory_results for all
  using (exists (select 1 from public.reports where reports.id = laboratory_results.report_id and reports.user_id = auth.uid()));

create table if not exists public.report_analyses (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade not null,
  summary text not null,
  key_findings jsonb default '[]'::jsonb,
  explanations jsonb default '[]'::jsonb,
  doctor_questions jsonb default '[]'::jsonb,
  medical_glossary jsonb default '[]'::jsonb,
  model_version text default 'gemini-3.8-flash',
  created_at timestamptz default now()
);

alter table public.report_analyses enable row level security;
create policy "Users manage own analyses" on public.report_analyses for all
  using (exists (select 1 from public.reports where reports.id = report_analyses.report_id and reports.user_id = auth.uid()));
`;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated: UserProfile = { ...user, display_name: displayName };
    setLocalUser(updated);
    onUpdateUser(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig({ url: supabaseUrl.trim(), anonKey: supabaseAnonKey.trim() });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleResetAllData = () => {
    clearAllLocalData();
    onClearAllReports();
    setShowConfirmReset(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in text-[#0A0F1D]">
      <div className="pb-4 border-b border-slate-200">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
          Configuration & Policies
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0A0F1D] font-editorial mt-0.5">
          System Settings
        </h1>
      </div>

      {/* Profile */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <User className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
            User Profile Credentials
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md font-mono text-xs">
          <div>
            <label className="block text-slate-600 uppercase mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900 font-sans"
            />
          </div>

          <div>
            <label className="block text-slate-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || 'patient@example.com'}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors uppercase flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
            {profileSaved && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>SAVED</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Supabase Cloud Connection */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider">
            <Database className="w-4 h-4 text-blue-600" />
            <span>Supabase Cloud Protocol</span>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 uppercase">
            {supabaseUrl ? 'CONNECTED' : 'LOCAL TIER'}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          MediScan AI runs with persistent local storage by default. You can configure your own Supabase project below to synchronize records with a live PostgreSQL database.
        </p>

        <form onSubmit={handleSaveSupabase} className="space-y-4 max-w-lg font-mono text-xs">
          <div>
            <label className="block text-slate-600 uppercase mb-1">Project URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-slate-600 uppercase mb-1">Anon Public Key</label>
            <input
              type="password"
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-[#0A0F1D] hover:bg-blue-600 transition-colors uppercase flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Supabase Config</span>
            </button>
            {configSaved && (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>UPDATED</span>
              </span>
            )}
          </div>
        </form>

        {/* Database Migration SQL */}
        <div className="pt-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-widest">
              SQL Migration (PostgreSQL / RLS)
            </span>
            <button
              onClick={handleCopySql}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-mono font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 uppercase transition-colors"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'COPIED' : 'COPY MIGRATION SQL'}</span>
            </button>
          </div>
          <pre className="p-4 bg-[#0A0F1D] text-slate-300 text-[11px] font-mono overflow-x-auto max-h-48 border border-slate-800">
            {sqlMigration}
          </pre>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50/40 border-l-4 border-red-600 border-y border-r border-red-200 space-y-4 font-mono text-xs">
        <div className="flex items-center gap-2 text-red-900 font-bold uppercase">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Irreversible Actions</span>
        </div>

        <p className="text-red-800 font-sans leading-relaxed">
          Permanently purge all laboratory records and reset local databases. This action cannot be reversed.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-4 py-2 font-bold text-red-800 bg-white hover:bg-red-50 border border-red-300 uppercase transition-colors"
          >
            Purge All Records
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 uppercase transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0F1D]/50 backdrop-blur-xs">
          <div className="bg-white p-6 max-w-sm w-full border-2 border-slate-900 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-editorial">
              Confirm Record Purge
            </h3>
            <p className="text-xs text-slate-600 font-mono">
              Permanently erase all clinical data from this environment. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 font-mono text-xs">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllData}
                className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 uppercase"
              >
                Purge Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
