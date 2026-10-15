import { describe, it, expect } from 'vitest';
import { DEMO_REPORTS } from '../lib/demoData';

describe('Demo Laboratory Reports Validation', () => {
  it('provides at least 3 comprehensive medical demonstration reports', () => {
    expect(DEMO_REPORTS.length).toBeGreaterThanOrEqual(3);
  });

  it('contains valid Comprehensive Metabolic Panel (CMP)', () => {
    const cmp = DEMO_REPORTS.find((r) =>
      r.original_filename.toLowerCase().includes('metabolic')
    );
    expect(cmp).toBeDefined();
    expect(cmp?.results?.length).toBeGreaterThanOrEqual(10);

    // Should include Glucose, BUN, Creatinine, Sodium, Potassium
    const glucose = cmp?.results?.find((res) => res.test_name.toLowerCase().includes('glucose'));
    expect(glucose).toBeDefined();
    expect(glucose?.unit).toBe('mg/dL');
    expect(glucose?.reference_range_low).toBe(70);
    expect(glucose?.reference_range_high).toBe(99);
  });

  it('contains valid Complete Blood Count (CBC) with differential', () => {
    const cbc = DEMO_REPORTS.find((r) =>
      r.original_filename.toLowerCase().includes('blood_count')
    );
    expect(cbc).toBeDefined();
    expect(cbc?.results?.some((r) => r.test_name.toLowerCase().includes('hemoglobin'))).toBe(true);
    expect(cbc?.results?.some((r) => r.test_name.toLowerCase().includes('white blood cell'))).toBe(true);
  });

  it('contains valid Lipid Panel with cardiovascular risk metrics', () => {
    const lipid = DEMO_REPORTS.find((r) =>
      r.original_filename.toLowerCase().includes('lipid')
    );
    expect(lipid).toBeDefined();
    expect(lipid?.results?.some((r) => r.test_name.toLowerCase().includes('cholesterol'))).toBe(true);
    expect(lipid?.results?.some((r) => r.test_name.toLowerCase().includes('triglycerides'))).toBe(true);
  });

  it('ensures all reports have AI clinical analyses, key findings, and doctor questions', () => {
    DEMO_REPORTS.forEach((report) => {
      expect(report.analysis).toBeDefined();
      expect(report.analysis?.summary.length).toBeGreaterThan(20);
      expect(report.analysis?.doctor_questions?.length).toBeGreaterThan(0);
      expect(report.analysis?.medical_glossary?.length).toBeGreaterThan(0);
    });
  });
});
