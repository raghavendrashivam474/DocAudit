import type {
  AnalysisIssue,
  AnalysisScore,
  CategoryScore,
  IssueCategory,
  Severity,
} from "@docaudit/shared";

// ─── Constants ────────────────────────────────────────────────────────────────

const SEVERITY_PENALTY: Record<Severity, number> = {
  critical: 20,
  high:     10,
  medium:    5,
  low:       2,
  info:      0,
};

/**
 * Weight of each category in the overall score (must sum to 1.0).
 */
const CATEGORY_WEIGHTS: Record<IssueCategory, number> = {
  structure:   0.25,
  completeness: 0.30,
  clarity:     0.20,
  accuracy:    0.10,
  consistency: 0.10,
  compliance:  0.05,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ─── Category Score ───────────────────────────────────────────────────────────

function computeCategoryScore(
  category: IssueCategory,
  issues: AnalysisIssue[]
): CategoryScore {
  const categoryIssues = issues.filter((i) => i.category === category);
  const weight = CATEGORY_WEIGHTS[category];

  let deductions = 0;
  for (const issue of categoryIssues) {
    deductions += SEVERITY_PENALTY[issue.severity];
  }

  const score = clamp(100 - deductions, 0, 100);

  return {
    category,
    score,
    weight,
    issueCount: categoryIssues.length,
  };
}

// ─── Overall Score ────────────────────────────────────────────────────────────

/**
 * Computes a weighted health score across all categories.
 *
 * Each category contributes proportionally to the overall score.
 * Categories with no issues score 100 in that category.
 */
export function computeHealthScore(issues: AnalysisIssue[]): AnalysisScore {
  const categories: IssueCategory[] = [
    "structure",
    "completeness",
    "clarity",
    "accuracy",
    "consistency",
    "compliance",
  ];

  const categoryScores = categories.map((cat) =>
    computeCategoryScore(cat, issues)
  );

  // Weighted average
  let weightedSum = 0;
  let totalWeight = 0;

  for (const cs of categoryScores) {
    weightedSum += cs.score * cs.weight;
    totalWeight += cs.weight;
  }

  const overall = totalWeight > 0
    ? clamp(Math.round((weightedSum / totalWeight) * 10) / 10, 0, 100)
    : 100;

  return {
    overall,
    categories: categoryScores,
    grade: computeGrade(overall),
  };
}