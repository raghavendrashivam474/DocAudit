import type { AnalysisResult, AnalysisSummary, AnalysisScore } from "@docaudit/shared";

function computeGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/**
 * Aggregates multiple analysis results into a single summary.
 */
export function aggregateResults(results: AnalysisResult[]): AnalysisSummary {
  let totalIssues = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  let infoCount = 0;
  let scoreSum = 0;

  const allTopIssues = [];

  for (const result of results) {
    const s = result.summary;
    totalIssues += s.totalIssues;
    criticalCount += s.criticalCount;
    highCount += s.highCount;
    mediumCount += s.mediumCount;
    lowCount += s.lowCount;
    infoCount += s.infoCount;
    scoreSum += s.score.overall;
    allTopIssues.push(...s.topIssues);
  }

  const overall = results.length > 0 ? scoreSum / results.length : 100;

  const score: AnalysisScore = {
    overall: Math.round(overall * 10) / 10,
    categories: [],
    grade: computeGrade(overall),
  };

  return {
    totalIssues,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    infoCount,
    score,
    topIssues: allTopIssues
      .filter((i) => i.severity === "critical" || i.severity === "high")
      .slice(0, 10),
  };
}
