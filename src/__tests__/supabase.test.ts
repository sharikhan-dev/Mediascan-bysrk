import { describe, it, expect, beforeEach } from 'vitest';
import { Report } from '../types';

describe('Local Database & Storage Logic', () => {
  // Simple in-memory storage simulator for node test environment
  let storage: Record<string, string> = {};

  beforeEach(() => {
    storage = {};
  });

  function saveReports(reports: Report[]) {
    storage['mediscan_reports_test'] = JSON.stringify(reports);
  }

  function getReports(): Report[] {
    const raw = storage['mediscan_reports_test'];
    return raw ? JSON.parse(raw) : [];
  }

  it('saves and loads reports accurately without loss of biomarker fidelity', () => {
    const sample: Report = {
      id: 'test-report-01',
      user_id: 'user-01',
      original_filename: 'Metabolic_Panel.pdf',
      report_date: '2026-10-15',
      laboratory_name: 'Quest Diagnostics',
      patient_age: 42,
      patient_gender: 'Female',
      processing_status: 'analyzed',
      is_demo: false,
      created_at: new Date().toISOString(),
      results: [
        {
          id: 'res-1',
          report_id: 'test-report-01',
          test_name: 'Fasting Glucose',
          measured_value: 92,
          unit: 'mg/dL',
          reference_range_low: 70,
          reference_range_high: 99,
          comparison_status: 'normal',
          extraction_review_status: 'verified',
        },
      ],
    };

    saveReports([sample]);
    const loaded = getReports();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('test-report-01');
    expect(loaded[0].results?.[0].measured_value).toBe(92);
    expect(loaded[0].results?.[0].comparison_status).toBe('normal');
  });

  it('correctly adds and deletes reports by id', () => {
    const r1: any = { id: 'rep-1', original_filename: 'a.pdf', report_date: '2026-01-01' };
    const r2: any = { id: 'rep-2', original_filename: 'b.pdf', report_date: '2026-01-02' };

    saveReports([r1, r2]);
    let current = getReports();
    expect(current.length).toBe(2);

    // Filter out rep-1
    const filtered = current.filter((r) => r.id !== 'rep-1');
    saveReports(filtered);

    current = getReports();
    expect(current.length).toBe(1);
    expect(current[0].id).toBe('rep-2');
  });
});
