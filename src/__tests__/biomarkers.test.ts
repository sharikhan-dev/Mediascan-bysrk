import { describe, it, expect } from 'vitest';
import { ComparisonStatus, LaboratoryResult } from '../types';

/**
 * Utility function replicating the clinical reference range comparison logic
 * used across MediScan AI extraction and review modules.
 */
export function classifyBiomarkerValue(
  value: number,
  low: number | null,
  high: number | null
): ComparisonStatus {
  if (low === null && high === null) {
    return 'unclassified';
  }
  if (low !== null && value < low) {
    // Check if critically low (e.g. > 30% below lower limit)
    return value < low * 0.7 ? 'critical' : 'low';
  }
  if (high !== null && value > high) {
    // Check if critically high (e.g. > 40% above upper limit)
    return value > high * 1.4 ? 'critical' : 'high';
  }
  return 'normal';
}

describe('Biomarker Reference Range Classification', () => {
  it('correctly classifies in-range normal values', () => {
    // Fasting Glucose range: 70 - 99 mg/dL
    expect(classifyBiomarkerValue(85, 70, 99)).toBe('normal');
    expect(classifyBiomarkerValue(70, 70, 99)).toBe('normal');
    expect(classifyBiomarkerValue(99, 70, 99)).toBe('normal');
  });

  it('correctly classifies low biomarker values', () => {
    // Potassium range: 3.5 - 5.0 mmol/L
    expect(classifyBiomarkerValue(3.2, 3.5, 5.0)).toBe('low');
  });

  it('correctly classifies high biomarker values', () => {
    // Total Cholesterol range: 125 - 200 mg/dL
    expect(classifyBiomarkerValue(218, 125, 200)).toBe('high');
  });

  it('correctly classifies critical outliers', () => {
    // Severe hypoglycemia: < 70 * 0.7 = 49
    expect(classifyBiomarkerValue(45, 70, 99)).toBe('critical');

    // Severe hyperglycemia: > 99 * 1.4 = 138.6
    expect(classifyBiomarkerValue(240, 70, 99)).toBe('critical');
  });

  it('handles unclassified biomarkers when laboratory reference is unspecified', () => {
    expect(classifyBiomarkerValue(14.2, null, null)).toBe('unclassified');
  });

  it('handles upper-bound-only reference ranges (e.g., Triglycerides < 150 mg/dL)', () => {
    expect(classifyBiomarkerValue(120, null, 150)).toBe('normal');
    expect(classifyBiomarkerValue(180, null, 150)).toBe('high');
  });

  it('handles lower-bound-only reference ranges (e.g., HDL > 40 mg/dL)', () => {
    expect(classifyBiomarkerValue(55, 40, null)).toBe('normal');
    expect(classifyBiomarkerValue(32, 40, null)).toBe('low');
  });
});
