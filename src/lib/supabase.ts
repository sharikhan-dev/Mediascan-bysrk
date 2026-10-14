import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Report, UserProfile } from '../types';
import { DEMO_REPORTS } from './demoData';

const STORAGE_KEY_REPORTS = 'mediscan_reports_v1';
const STORAGE_KEY_USER = 'mediscan_user_v1';
const STORAGE_KEY_SUPABASE_CONFIG = 'mediscan_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// Get saved Supabase config from localStorage or env
export function getSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    // ignore
  }

  return {
    url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
    anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(STORAGE_KEY_SUPABASE_CONFIG, JSON.stringify(config));
}

// Initialize real Supabase client if configured
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();
  if (url && anonKey) {
    if (!supabaseInstance) {
      try {
        supabaseInstance = createClient(url, anonKey);
      } catch (err) {
        console.warn('Failed to initialize Supabase client:', err);
      }
    }
    return supabaseInstance;
  }
  return null;
}

// Local mock storage helpers for immediate testability and guest demo accounts
export function getLocalUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return null;
}

export function setLocalUser(user: UserProfile | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

export function getLocalReports(): Report[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  // Default to demo reports for high quality demonstration
  return DEMO_REPORTS;
}

export function saveLocalReports(reports: Report[]) {
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
}

export function addLocalReport(report: Report) {
  const current = getLocalReports();
  const updated = [report, ...current.filter((r) => r.id !== report.id)];
  saveLocalReports(updated);
  return updated;
}

export function removeLocalReport(reportId: string) {
  const current = getLocalReports();
  const updated = current.filter((r) => r.id !== reportId);
  saveLocalReports(updated);
  return updated;
}

export function clearAllLocalData() {
  localStorage.removeItem(STORAGE_KEY_REPORTS);
  localStorage.removeItem(STORAGE_KEY_USER);
}
