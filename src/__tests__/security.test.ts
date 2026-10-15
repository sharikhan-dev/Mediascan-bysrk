import { describe, it, expect } from 'vitest';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMedicalUploadFile(
  filename: string,
  mimeType: string,
  sizeBytes: number,
  maxSizeBytes: number = 20 * 1024 * 1024 // 20 MB
): FileValidationResult {
  const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  const lowerName = filename.toLowerCase();
  const hasValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));

  if (!hasValidExt) {
    return {
      valid: false,
      error: 'Invalid file format. Only PDF, JPG, and PNG medical reports are supported.',
    };
  }

  if (mimeType && !allowedMimes.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported MIME type. File must be a valid document or image.',
    };
  }

  if (sizeBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds the allowable limit of ${maxSizeBytes / (1024 * 1024)}MB.`,
    };
  }

  if (sizeBytes <= 0) {
    return {
      valid: false,
      error: 'Empty file detected.',
    };
  }

  return { valid: true };
}

describe('Medical Document Security & Upload Validation', () => {
  it('accepts valid PDF documents within size limits', () => {
    const res = validateMedicalUploadFile('lab_results.pdf', 'application/pdf', 2 * 1024 * 1024);
    expect(res.valid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('accepts scanned medical images in JPG and PNG format', () => {
    const jpg = validateMedicalUploadFile('report_scan.jpg', 'image/jpeg', 1.5 * 1024 * 1024);
    expect(jpg.valid).toBe(true);

    const png = validateMedicalUploadFile('report_photo.png', 'image/png', 3 * 1024 * 1024);
    expect(png.valid).toBe(true);
  });

  it('rejects disallowed executable or dangerous file types', () => {
    const exe = validateMedicalUploadFile('exploit.exe', 'application/x-msdownload', 1024);
    expect(exe.valid).toBe(false);
    expect(exe.error).toContain('Invalid file format');

    const html = validateMedicalUploadFile('script.html', 'text/html', 1024);
    expect(html.valid).toBe(false);

    const zip = validateMedicalUploadFile('archive.zip', 'application/zip', 1024);
    expect(zip.valid).toBe(false);
  });

  it('enforces strict maximum file size constraint (20MB limit)', () => {
    const oversize = validateMedicalUploadFile('huge_scan.pdf', 'application/pdf', 25 * 1024 * 1024);
    expect(oversize.valid).toBe(false);
    expect(oversize.error).toContain('exceeds the allowable limit');
  });

  it('rejects 0-byte corrupt or empty files', () => {
    const zero = validateMedicalUploadFile('empty.pdf', 'application/pdf', 0);
    expect(zero.valid).toBe(false);
    expect(zero.error).toContain('Empty file');
  });
});
