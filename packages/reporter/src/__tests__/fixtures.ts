import type { AnalysisResult } from "@docaudit/shared";

// --- Shared base builder ------------------------------------------------------

export function makeResult(overrides?: Partial<AnalysisResult>): AnalysisResult {
  const base: AnalysisResult = {
    id:           "result-1",
    documentId:   "doc-1",
    documentName: "test.md",
    analyzedAt:   new Date("2026-01-01T00:00:00.000Z"),
    duration:     12.34,
    issues:       [],
    summary: {
      totalIssues:   0,
      criticalCount: 0,
      highCount:     0,
      mediumCount:   0,
      lowCount:      0,
      infoCount:     0,
      score: {
        overall:    100,
        categories: [],
        grade:      "A",
      },
      topIssues: [],
    },
  };
  return { ...base, ...overrides };
}

// --- Named fixtures -----------------------------------------------------------

export const emptyResult: AnalysisResult = makeResult();

export const smallResult: AnalysisResult = makeResult({
  documentName: "README.md",
  duration:     5.5,
  issues: [
    {
      id:          "iss-1",
      ruleId:      "structure.missing-h1",
      severity:    "high",
      category:    "structure",
      title:       "Missing H1 heading",
      description: "Document does not start with an H1 heading.",
      suggestion:  "Add an H1 heading at the top of the document.",
      location:    { line: 1 },
    },
    {
      id:          "iss-2",
      ruleId:      "clarity.placeholder-text",
      severity:    "medium",
      category:    "clarity",
      title:       "Placeholder text detected",
      description: "Document contains TODO placeholder.",
      suggestion:  "Replace placeholder with real content.",
      location:    { line: 12 },
    },
  ],
  summary: {
    totalIssues:   2,
    criticalCount: 0,
    highCount:     1,
    mediumCount:   1,
    lowCount:      0,
    infoCount:     0,
    score: {
      overall:    78,
      categories: [],
      grade:      "C",
    },
    topIssues: [],
  },
});

export const largeResult: AnalysisResult = makeResult({
  documentName: "CONTRIBUTING.md",
  duration:     42.1,
  issues: Array.from({ length: 50 }, (_, i) => ({
    id:          `iss-${i}`,
    ruleId:      `rule.item-${i}`,
    severity:    (["critical", "high", "medium", "low", "info"] as const)[i % 5],
    category:    (["structure", "completeness", "clarity", "accuracy", "consistency", "compliance"] as const)[i % 6],
    title:       `Issue ${i}`,
    description: `Description for issue ${i}.`,
    suggestion:  `Fix issue ${i}.`,
  })),
  summary: {
    totalIssues:   50,
    criticalCount: 10,
    highCount:     10,
    mediumCount:   10,
    lowCount:      10,
    infoCount:     10,
    score: {
      overall:    45,
      categories: [],
      grade:      "F",
    },
    topIssues: [],
  },
});
