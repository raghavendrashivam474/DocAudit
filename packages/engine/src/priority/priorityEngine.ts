import type { AnalysisIssue, Severity, IssueCategory } from "@docaudit/shared";
import type { Recommendation } from "../recommendations/recommendationEngine.js";
import type {
  PrioritizedFinding,
  PrioritizedResult,
  PrioritySummary,
  PriorityWeights,
} from "./priorityTypes.js";
import { calculatePriority, explainPriority } from "./priorityCalculator.js";
import { DEFAULT_WEIGHTS } from "./priorityRules.js";

const ALL_SEVERITIES: readonly Severity[] = [
  "critical", "high", "medium", "low", "info",
]  as const;

function emptySeverityCounts(): Record<Severity, number> {
  const counts: Record<Severity, number> = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  return counts;
}

/**
 * Finds the recommendation that groups a given issue, if any.
 */
function findRecommendationForIssue(
  issue: AnalysisIssue,
  recommendations: readonly Recommendation[]
): Recommendation | undefined {
  for (const rec of recommendations) {
    if (rec.relatedIssueIds.includes(issue.id)) {
      return rec;
    }
  }
  return undefined;
}

/**
 * Consumes raw findings and recommendations, produces prioritized output.
 *
 * This engine never mutates its inputs and produces deterministic output:
 * two calls with equivalent inputs always yield equivalent results.
 */
export function prioritize(
  issues: readonly AnalysisIssue[],
  recommendations: readonly Recommendation[] = [],
  weights: PriorityWeights = DEFAULT_WEIGHTS
): PrioritizedResult {
  // Compute priorities
  const scored: PrioritizedFinding[] = issues.map((issue) => {
    const rec = findRecommendationForIssue(issue, recommendations);
    return {
      issue,
      recommendation: rec,
      priority: calculatePriority(issue, rec, weights),
      rank: 0,
      reason: explainPriority(issue),
    };
  });

  // Sort by priority descending, then by issue id for stable ordering
  scored.sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return a.issue.id.localeCompare(b.issue.id);
  });

  // Assign 1-based ranks after sorting
  const findings: PrioritizedFinding[] = scored.map((f, i) => ({
    issue: f.issue,
    recommendation: f.recommendation,
    priority: f.priority,
    rank: i + 1,
    reason: f.reason,
  }));

  // Build summary
  const bySeverity: Record<Severity, number> = emptySeverityCounts();
  const byCategory: Partial<Record<IssueCategory, number>> = {};

  for (const f of findings) {
    bySeverity[f.issue.severity] += 1;
    const catCount = byCategory[f.issue.category] ?? 0;
    byCategory[f.issue.category] = catCount + 1;
  }

  const summary: PrioritySummary = {
    total: findings.length,
    bySeverity,
    byCategory,
    topPriority: findings[0]?.priority ?? 0,
  };

  // Suppress unused import warning if runtime severity list not referenced
  void ALL_SEVERITIES;

  return { findings, summary };
}