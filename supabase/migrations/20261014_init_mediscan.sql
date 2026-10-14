-- ==============================================================================
-- MediScan AI Database Schema & Row-Level Security Policies (Supabase/PostgreSQL)
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Reports Table
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  original_filename text not null,
  storage_path text,
  report_date date default current_date,
  laboratory_name text,
  patient_age integer,
  patient_gender text,
  processing_status text check (processing_status in ('pending', 'extracted', 'analyzed', 'failed')) default 'pending',
  created_at timestamptz default now()
);

create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_report_date on public.reports(report_date desc);

alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = user_id);

create policy "Users can create own reports"
  on public.reports for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reports"
  on public.reports for update
  using (auth.uid() = user_id);

create policy "Users can delete own reports"
  on public.reports for delete
  using (auth.uid() = user_id);

-- 3. Laboratory Results Table
create table if not exists public.laboratory_results (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.reports(id) on delete cascade not null,
  test_name text not null,
  measured_value numeric not null,
  unit text not null,
  reference_range_low numeric,
  reference_range_high numeric,
  laboratory_reference_text text,
  comparison_status text check (comparison_status in ('low', 'normal', 'high', 'critical', 'unclassified')) default 'normal',
  extraction_review_status text check (extraction_review_status in ('verified', 'flagged_for_review', 'manually_corrected')) default 'verified',
  notes text,
  created_at timestamptz default now()
);

create index if not exists idx_lab_results_report_id on public.laboratory_results(report_id);
create index if not exists idx_lab_results_test_name on public.laboratory_results(test_name);

alter table public.laboratory_results enable row level security;

create policy "Users can view lab results of own reports"
  on public.laboratory_results for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = laboratory_results.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can insert lab results to own reports"
  on public.laboratory_results for insert
  with check (
    exists (
      select 1 from public.reports
      where reports.id = laboratory_results.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can update lab results of own reports"
  on public.laboratory_results for update
  using (
    exists (
      select 1 from public.reports
      where reports.id = laboratory_results.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can delete lab results of own reports"
  on public.laboratory_results for delete
  using (
    exists (
      select 1 from public.reports
      where reports.id = laboratory_results.report_id
      and reports.user_id = auth.uid()
    )
  );

-- 4. Report Analyses Table
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

create index if not exists idx_report_analyses_report_id on public.report_analyses(report_id);

alter table public.report_analyses enable row level security;

create policy "Users can view analyses of own reports"
  on public.report_analyses for select
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_analyses.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can insert analyses to own reports"
  on public.report_analyses for insert
  with check (
    exists (
      select 1 from public.reports
      where reports.id = report_analyses.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can update analyses of own reports"
  on public.report_analyses for update
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_analyses.report_id
      and reports.user_id = auth.uid()
    )
  );

create policy "Users can delete analyses of own reports"
  on public.report_analyses for delete
  using (
    exists (
      select 1 from public.reports
      where reports.id = report_analyses.report_id
      and reports.user_id = auth.uid()
    )
  );

-- 5. Storage Bucket Configuration for Private Medical Reports
-- Ensure a private bucket 'medical-reports' exists
insert into storage.buckets (id, name, public)
values ('medical-reports', 'medical-reports', false)
on conflict (id) do nothing;

create policy "Users can upload their own medical files"
  on storage.objects for insert
  with check (
    bucket_id = 'medical-reports' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own medical files"
  on storage.objects for select
  using (
    bucket_id = 'medical-reports' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own medical files"
  on storage.objects for delete
  using (
    bucket_id = 'medical-reports' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
