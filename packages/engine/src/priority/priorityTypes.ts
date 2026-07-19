import type { AnalysisIssue, Severity, IssueCategory } from "@docaudit/shared";
import type { Recommendation } from "../recommendations/recommendationEngine.js";

/**
 * A finding enriched with a computed execution priority.
 * Higher priority means the issue should be addressed sooner.
 */
export interface PrioritizedFinding {
  readonly issue: AnalysisIssue;
  readonly recommendation: Recommendation | undefined;
  readonly priority: number;
  readonly rank: number;
  readonly reason: string;
}

/**
 * The complete prioritized output of the Priority Engine.
 */
export interface PrioritizedResult {
  readonly findings: readonly PrioritizedFinding[];
  readonly summary: PrioritySummary;
}

/**
 * Aggregated priority statistics.
 */
export interface PrioritySummary {
  readonly total: number;
  readonly bySeverity: Record<Severity, number>;
  readonly byCategory: Partial<Record<IssueCategory, number>>;
  readonly topPriority: number;
}

/**
 * Configuration for the priority calculator.
 * Weights are multiplied against normalized 0..100 scales.
 */
export interface PriorityWeights {
  readonly severity: number;
  readonly category: number;
  readonly hasRecommendation: number;
  readonly hasTemplate: number;
}