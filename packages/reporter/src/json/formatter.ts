import type {
  AnalysisResult,
  AnalysisIssue,
  AnalysisScore,
  Severity,
  IssueCategory,
} from "@docaudit/shared";
import type {
  PrioritizedFinding,
  PrioritizedResult,
  PrioritySummary,
  Recommendation,
} from "@docaudit/engine";

// ─── JSON Shapes ────────────────────────────────────────────────────────────

export interface JsonIssue {
  readonly id: string;
  readonly ruleId: string | undefined;
  readonly severity: Severity;
  readonly category: IssueCategory;
  readonly title: string;
  readonly description: string;
  readonly suggestion: string | undefined;
  readonly affectedText: string | undefined;
  readonly location: {
    readonly line: number | undefined;
    readonly section: string | undefined;
  } | undefined;
}

export interface JsonRecommendation {
  readonly id: string;
  readonly title: string;
  readonly severity: Severity;
  readonly category: IssueCategory;
  readonly priority: number;
  readonly context: string;
  readonly action: string;
  readonly hasTemplate: boolean;
  readonly relatedIssueIds: readonly string[];
}

export interface JsonPrioritizedFinding {
  readonly rank: number;
  readonly priority: number;
  readonly reason: string;
  readonly issue: JsonIssue;
  readonly recommendationId: string | undefined;
}

export interface JsonDocumentReport {
  readonly documentId: string;
  readonly documentName: string;
  readonly analyzedAt: string;
  readonly durationMs: number;
  readonly score: AnalysisScore;
  readonly summary: {
    readonly totalIssues: number;
    readonly criticalCount: number;
    readonly highCount: number;
    readonly mediumCount: number;
    readonly lowCount: number;
    readonly infoCount: number;
  };
  readonly issues: readonly JsonIssue[];
  readonly recommendations: readonly JsonRecommendation[];
  readonly prioritized: readonly JsonPrioritizedFinding[];
  readonly prioritySummary: PrioritySummary;
}

export interface JsonReport {
  readonly schemaVersion: "1.0";
  readonly generator: {
    readonly name: "docaudit";
    readonly version: string;
  };
  readonly generatedAt: string;
  readonly documents: readonly JsonDocumentReport[];
  readonly aggregate: {
    readonly documentCount: number;
    readonly totalIssues: number;
    readonly averageScore: number;
  };
}

// ─── Formatting Functions ───────────────────────────────────────────────────

function formatIssue(issue: AnalysisIssue): JsonIssue {
  return {
    id: issue.id,
    ruleId: issue.ruleId,
    severity: issue.severity,
    category: issue.category,
    title: issue.title,
    description: issue.description,
    suggestion: issue.suggestion,
    affectedText: issue.affectedText,
    location:
      issue.location !== undefined
        ? {
            line: issue.location.line,
            section: issue.location.section,
          }
        : undefined,
  };
}

function formatRecommendation(rec: Recommendation): JsonRecommendation {
  return {
    id: rec.id,
    title: rec.title,
    severity: rec.severity,
    category: rec.category,
    priority: rec.priority,
    context: rec.context,
    action: rec.action,
    hasTemplate: rec.template !== undefined,
    relatedIssueIds: [...rec.relatedIssueIds],
  };
}

function formatPrioritized(f: PrioritizedFinding): JsonPrioritizedFinding {
  return {
    rank: f.rank,
    priority: f.priority,
    reason: f.reason,
    issue: formatIssue(f.issue),
    recommendationId: f.recommendation?.id,
  };
}

export function formatDocumentReport(
  result: AnalysisResult,
  recommendations: readonly Recommendation[],
  prioritized: PrioritizedResult
): JsonDocumentReport {
  return {
    documentId: result.documentId,
    documentName: result.documentName,
    analyzedAt: result.analyzedAt.toISOString(),
    durationMs: Math.round(result.duration * 100) / 100,
    score: result.summary.score,
    summary: {
      totalIssues:   result.summary.totalIssues,
      criticalCount: result.summary.criticalCount,
      highCount:     result.summary.highCount,
      mediumCount:   result.summary.mediumCount,
      lowCount:      result.summary.lowCount,
      infoCount:     result.summary.infoCount,
    },
    issues: result.issues.map(formatIssue),
    recommendations: recommendations.map(formatRecommendation),
    prioritized: prioritized.findings.map(formatPrioritized),
    prioritySummary: prioritized.summary,
  };
}