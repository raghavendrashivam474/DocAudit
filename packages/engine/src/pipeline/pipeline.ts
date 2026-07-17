import { randomUUID } from "node:crypto";
import type {
  IAnalyzer,
  AnalyzerContext,
  AnalysisIssue,
  AnalysisResult,
  AnalysisSummary,
  AnalysisScore,
  Severity,
} from "@docaudit/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countBySeverity(
  issues: AnalysisIssue[],
  severity: Severity
): number {
  return issues.filter((i) => i.severity === severity).length;
}

function computeGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 15,
  high:     10,
  medium:    5,
  low:       2,
  info:      0,
};

function computeScore(issues: AnalysisIssue[]): AnalysisScore {
  let deductions = 0;
  for (const issue of issues) {
    deductions += SEVERITY_PENALTY[issue.severity];
  }
  const overall = Math.max(0, Math.min(100, 100 - deductions));

  return {
    overall,
    categories: [],
    grade: computeGrade(overall),
  };
}

function buildSummary(issues: AnalysisIssue[]): AnalysisSummary {
  const score = computeScore(issues);
  return {
    totalIssues:   issues.length,
    criticalCount: countBySeverity(issues, "critical"),
    highCount:     countBySeverity(issues, "high"),
    mediumCount:   countBySeverity(issues, "medium"),
    lowCount:      countBySeverity(issues, "low"),
    infoCount:     countBySeverity(issues, "info"),
    score,
    topIssues:     issues
      .filter((i) => i.severity === "critical" || i.severity === "high")
      .slice(0, 5),
  };
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export interface PipelineOptions {
  readonly documentId?: string | undefined;
  readonly documentName: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown> | undefined;
}

/**
 * Executes every registered analyzer against a single document
 * and aggregates the results into one AnalysisResult.
 */
export async function runPipeline(
  analyzers: IAnalyzer[],
  options: PipelineOptions
): Promise<AnalysisResult> {
  const documentId = options.documentId ?? randomUUID();
  const startTime = performance.now();

  const context: AnalyzerContext = {
    documentId,
    documentName: options.documentName,
    content: options.content,
    ...(options.metadata !== undefined ? { metadata: options.metadata } : {}),
  };

  const allIssues: AnalysisIssue[] = [];

  for (const analyzer of analyzers) {
    const output = await analyzer.analyze(context);
    allIssues.push(...output.issues);
  }

  const duration = performance.now() - startTime;

  return {
    id: randomUUID(),
    documentId,
    documentName: options.documentName,
    analyzedAt: new Date(),
    duration,
    issues: allIssues,
    summary: buildSummary(allIssues),
  };
}
