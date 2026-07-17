export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type IssueCategory =
  | 'completeness'
  | 'accuracy'
  | 'clarity'
  | 'consistency'
  | 'compliance'
  | 'structure';

export interface DocumentLocation {
  section?: string;
  paragraph?: number;
  line?: number;
  startOffset?: number;
  endOffset?: number;
}

export interface AnalysisIssue {
  id: string;
  category: IssueCategory;
  severity: Severity;
  title: string;
  description: string;
  location?: DocumentLocation;
  suggestion?: string;
  affectedText?: string;
  ruleId?: string;
  metadata?: Record<string, unknown>;
}

export interface CategoryScore {
  category: IssueCategory;
  score: number;
  weight: number;
  issueCount: number;
}

export interface AnalysisScore {
  overall: number;
  categories: CategoryScore[];
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface AnalysisSummary {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  score: AnalysisScore;
  topIssues: AnalysisIssue[];
}

export interface AnalysisResult {
  id: string;
  documentId: string;
  documentName: string;
  analyzedAt: Date;
  duration: number;
  issues: AnalysisIssue[];
  summary: AnalysisSummary;
  metadata?: Record<string, unknown>;
}
