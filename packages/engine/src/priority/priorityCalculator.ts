import type { AnalysisIssue } from "@docaudit/shared";
import type { Recommendation } from "../recommendations/recommendationEngine.js";
import type { PriorityWeights } from "./priorityTypes.js";
import {
  SEVERITY_PRIORITY,
  CATEGORY_WEIGHT,
  DEFAULT_WEIGHTS,
} from "./priorityRules.js";

/**
 * Computes an execution priority score for a single issue.
 *
 * Returns a value in the range 0..100 where higher means
 * more urgent. The scoring is deterministic: identical inputs
 * always produce identical outputs.
 */
export function calculatePriority(
  issue: AnalysisIssue,
  recommendation: Recommendation | undefined,
  weights: PriorityWeights = DEFAULT_WEIGHTS
): number {
  const severityScore = SEVERITY_PRIORITY[issue.severity];
  const categoryScore = CATEGORY_WEIGHT[issue.category] * 100;
  const recScore      = recommendation !== undefined ? 100 : 0;
  const templateScore =
    recommendation?.template !== undefined ? 100 : 0;

  const raw =
    severityScore      * weights.severity +
    categoryScore      * weights.category +
    recScore           * weights.hasRecommendation +
    templateScore      * weights.hasTemplate;

  // Round to one decimal place for stable comparisons
  return Math.round(raw * 10) / 10;
}

/**
 * Explains why a given priority was assigned.
 * Used for human-readable reports and debugging.
 */
export function explainPriority(issue: AnalysisIssue): string {
  const sev = SEVERITY_PRIORITY[issue.severity];
  const cat = CATEGORY_WEIGHT[issue.category];
  return (
    "severity=" + issue.severity +
    " (" + String(sev) + "), category=" + issue.category +
    " (weight=" + String(cat) + ")"
  );
}