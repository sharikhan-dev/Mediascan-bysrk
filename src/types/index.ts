export type ComparisonStatus = 'low' | 'normal' | 'high' | 'critical' | 'unclassified';
export type ExtractionReviewStatus = 'verified' | 'flagged_for_review' | 'manually_corrected';
export type ProcessingStatus = 'pending' | 'extracted' | 'analyzed' | 'failed';

export interface LaboratoryResult {
  id: string;
  report_id: string;
  test_name: string;
  measured_value: number;
  unit: string;
  reference_range_low: number | null;
  reference_range_high: number | null;
  laboratory_reference_text?: string;
  comparison_status: ComparisonStatus;
  extraction_review_status: ExtractionReviewStatus;
  confidence?: 'high' | 'medium' | 'low';
  notes?: string;
  abnormal_flag?: string | null;
}

export interface KeyFinding {
  title: string;
  explanation: string;
  urgency: 'routine' | 'discuss_with_doctor' | 'prompt_review';
}

export interface TestExplanation {
  test_name: string;
  plain_explanation: string;
  clinical_significance: string;
  reference_comparison: string;
  questions_for_doctor: string[];
}

export interface MedicalGlossaryItem {
  term: string;
  definition: string;
}

export interface ReportAnalysis {
  id: string;
  report_id: string;
  summary: string;
  key_findings: KeyFinding[];
  explanations: TestExplanation[];
  doctor_questions: string[];
  medical_glossary: MedicalGlossaryItem[];
  model_version: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  original_filename: string;
  storage_path?: string;
  report_date: string;
  laboratory_name?: string;
  patient_age?: number;
  patient_gender?: string;
  processing_status: ProcessingStatus;
  created_at: string;
  is_demo?: boolean;
  results?: LaboratoryResult[];
  analysis?: ReportAnalysis;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
