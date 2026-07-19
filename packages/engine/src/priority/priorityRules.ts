import type { Severity, IssueCategory } from "@docaudit/shared";
import type { PriorityWeights } from "./priorityTypes.js";

/**
 * Base priority contribution per severity (0..100 scale).
 */
export const SEVERITY_PRIORITY: Record<Severity, number> = {
  critical: 100,
  high:      75,
  medium:    50,
  low:       25,
  info:       5,
};

/**
 * Category importance multiplier (0..1 scale).
 * Structure and completeness issues typically have higher user impact
 * than clarity issues, which are usually cosmetic.
 */
export const CATEGORY_WEIGHT: Record<IssueCategory, number> = {
  completeness: 1.0,
  structure:    0.9,
  accuracy:     0.9,
  compliance:   0.8,
  consistency:  0.7,
  clarity:      0.6,
};

/**
 * Default weights used by the calculator.
 * Callers may override these to tune ranking behaviour.
 */
export const DEFAULT_WEIGHTS: PriorityWeights = {
  severity:          0.60,
  category:          0.25,
  hasRecommendation: 0.10,
  hasTemplate:       0.05,
};