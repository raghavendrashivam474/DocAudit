export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type IssueCategory =
  | "completeness"
  | "accuracy"
  | "clarity"
  | "consistency"
  | "compliance"
  | "structure";

export interface DocumentLocation {
  readonly section?: string | undefined;
  readonly paragraph?: number | undefined;
  readonly line?: number | undefined;
  readonly startOffset?: number | undefined;
  readonly endOffset?: number | undefined;
}

export interface AnalysisIssue {
  readonly id: string;
  readonly category: IssueCategory;
  readonly severity: Severity;
  readonly title: string;
  readonly description: string;
  readonly location?: DocumentLocation | undefined;
  readonly suggestion?: string | undefined;
  readonly affectedText?: string | undefined;
  readonly ruleId?: string | undefined;
  readonly metadata?: Record<string, unknown> | undefined;
}

export interface CategoryScore {
  readonly category: IssueCategory;
  readonly score: number;
  readonly weight: number;
  readonly issueCount: number;
}

export interface AnalysisScore {
  readonly overall: number;
  readonly categories: CategoryScore[];
  readonly grade: "A" | "B" | "C" | "D" | "F";
}

export interface AnalysisSummary {
  readonly totalIssues: number;
  readonly criticalCount: number;
  readonly highCount: number;
  readonly mediumCount: number;
  readonly lowCount: number;
  readonly infoCount: number;
  readonly score: AnalysisScore;
  readonly topIssues: AnalysisIssue[];
}

export interface AnalysisResult {
  readonly id: string;
  readonly documentId: string;
  readonly documentName: string;
  readonly analyzedAt: Date;
  readonly duration: number;
  readonly issues: AnalysisIssue[];
  readonly summary: AnalysisSummary;
  readonly metadata?: Record<string, unknown> | undefined;
}
