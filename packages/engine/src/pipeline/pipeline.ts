import { randomUUID } from "node:crypto";
import type {
  IAnalyzer,
  AnalyzerContext,
  AnalysisIssue,
  AnalysisResult,
  AnalysisSummary,
  Severity,
} from "@docaudit/shared";
import { parseMarkdown } from "../parser/markdownParser.js";
import { computeHealthScore } from "../scoring/healthScore.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countBySeverity(issues: AnalysisIssue[], severity: Severity): number {
  return issues.filter((i) => i.severity === severity).length;
}

function buildSummary(issues: AnalysisIssue[]): AnalysisSummary {
  const score = computeHealthScore(issues);
  return {
    totalIssues:   issues.length,
    criticalCount: countBySeverity(issues, "critical"),
    highCount:     countBySeverity(issues, "high"),
    mediumCount:   countBySeverity(issues, "medium"),
    lowCount:      countBySeverity(issues, "low"),
    infoCount:     countBySeverity(issues, "info"),
    score,
    topIssues: issues
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
 * Parses once, runs all analyzers, computes weighted category scores.
 */
export async function runPipeline(
  analyzers: IAnalyzer[],
  options: PipelineOptions
): Promise<AnalysisResult> {
  const documentId = options.documentId ?? randomUUID();
  const startTime = performance.now();

  const document = parseMarkdown(options.content);

  const context: AnalyzerContext = {
    documentId,
    documentName: options.documentName,
    content: options.content,
    document,
    ...(options.metadata !== undefined ? { metadata: options.metadata } : {}),
  };

  const allIssues: AnalysisIssue[] = [];
  for (const analyzer of analyzers) {
    const output = await analyzer.analyze(context);
    allIssues.push(...output.issues);
  }

  return {
    id: randomUUID(),
    documentId,
    documentName: options.documentName,
    analyzedAt: new Date(),
    duration: performance.now() - startTime,
    issues: allIssues,
    summary: buildSummary(allIssues),
  };
}