import { describe, it, expect } from 'vitest';

/**
 * Sanitizes laboratory filenames and constructs clean, descriptive
 * PDF filenames for browser downloads.
 */
export function generatePDFExportFilename(
  reportDate: string,
  labName: string | null,
  originalFilename: string
): string {
  const safeDate = reportDate.replace(/[^0-9-]/g, '');
  const safeLab = (labName || 'Laboratory').replace(/[^a-zA-Z0-9]/g, '_');
  const safeName = originalFilename
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  return `MediScan_${safeDate}_${safeLab}_${safeName}.pdf`;
}

export function getExportPresetConfig(preset: 'full' | 'summary' | 'physician') {
  if (preset === 'full') {
    return {
      includeExplanations: true,
      includeDoctorQuestions: true,
      includeGlossary: true,
      includeSignatureBlock: true,
      includeKeyFindings: true,
    };
  }
  if (preset === 'summary') {
    return {
      includeExplanations: false,
      includeDoctorQuestions: false,
      includeGlossary: false,
      includeSignatureBlock: false,
      includeKeyFindings: true,
    };
  }
  return {
    includeExplanations: false,
    includeDoctorQuestions: true,
    includeGlossary: false,
    includeSignatureBlock: true,
    includeKeyFindings: true,
  };
}

describe('PDF Export & Print Engine Utilities', () => {
  it('generates pristine, standardized PDF export filenames', () => {
    const filename = generatePDFExportFilename(
      '2026-09-18',
      'Quest Diagnostics',
      'Comprehensive_Metabolic_Panel.pdf'
    );
    expect(filename).toBe('MediScan_2026-09-18_Quest_Diagnostics_Comprehensive_Metabolic_Panel.pdf');
  });

  it('handles spaces and special characters in laboratory names and filenames', () => {
    const filename = generatePDFExportFilename(
      '2026-10-14',
      'LabCorp & Bio-Ref!',
      'CBC (Blood Test) #2.pdf'
    );
    expect(filename).toContain('MediScan_2026-10-14');
    expect(filename).not.toContain('&');
    expect(filename).not.toContain('!');
    expect(filename).not.toContain('(');
    expect(filename).toMatch(/\.pdf$/);
  });

  it('correctly configures complete preset options for exhaustive report export', () => {
    const config = getExportPresetConfig('full');
    expect(config.includeExplanations).toBe(true);
    expect(config.includeDoctorQuestions).toBe(true);
    expect(config.includeGlossary).toBe(true);
    expect(config.includeSignatureBlock).toBe(true);
    expect(config.includeKeyFindings).toBe(true);
  });

  it('correctly configures concise summary preset to keep printed pages minimal', () => {
    const config = getExportPresetConfig('summary');
    expect(config.includeExplanations).toBe(false);
    expect(config.includeDoctorQuestions).toBe(false);
    expect(config.includeSignatureBlock).toBe(false);
    expect(config.includeKeyFindings).toBe(true);
  });

  it('correctly configures physician consultation sheet with discussion and signature', () => {
    const config = getExportPresetConfig('physician');
    expect(config.includeDoctorQuestions).toBe(true);
    expect(config.includeSignatureBlock).toBe(true);
    expect(config.includeGlossary).toBe(false);
  });
});
