import type { AnalysisIssue, IssueCategory, Severity } from "@docaudit/shared";

export interface Recommendation {
  readonly id: string;
  readonly priority: number;
  readonly severity: Severity;
  readonly category: IssueCategory;
  readonly title: string;
  readonly context: string;
  readonly action: string;
  readonly template?: string | undefined;
  readonly relatedIssueIds: readonly string[];
}

const SEVERITY_PRIORITY: Record<Severity, number> = {
  critical: 100,
  high:      75,
  medium:    50,
  low:       25,
  info:       5,
};

const RULE_CONTEXT: Partial<Record<string, string>> = {
  "structure.no-headings":
    "Documents without headings are difficult to scan. Readers skim headings first to understand scope.",
  "structure.missing-h1":
    "A single H1 heading serves as the document title. Search engines and screen readers rely on a clear H1.",
  "structure.multiple-h1":
    "Multiple H1 headings create ambiguity. Most standards recommend exactly one H1 per document.",
  "structure.heading-jump":
    "Skipping heading levels breaks the document outline and confuses screen readers and navigation tools.",
  "completeness.missing-required-section":
    "Developers look for Overview, Authentication, and Endpoints in that order. Missing sections increase support burden.",
  "completeness.missing-example":
    "Code examples are the most valuable part of API docs. Developers go to examples before reading prose.",
  "clarity.placeholder-text":
    "Placeholder text (TODO/FIXME/TBD/WIP) in published docs signals incompleteness and erodes reader trust.",
  "clarity.long-line":
    "Lines over 140 characters reduce readability on mobile and in diff views. Shorter sentences improve comprehension.",
};

const RULE_TEMPLATE: Partial<Record<string, string>> = {
  "structure.no-headings": [
    "# Project Title",
    "",
    "## Overview",
    "",
    "Brief description of what this project does.",
    "",
    "## Installation",
    "",
    "```bash",
    "npm install your-package",
    "```",
    "",
    "## Usage",
    "",
    "Basic usage example here.",
  ].join("\n"),
  "completeness.missing-required-section": [
    "## Authentication",
    "",
    "All API requests require a valid API key in the Authorization header:",
    "",
    "```bash",
    "curl -H \"Authorization: Bearer YOUR_API_KEY\" https://api.example.com/resource",
    "```",
  ].join("\n"),
  "completeness.missing-example": [
    "```bash",
    "# Example request",
    "curl -X GET https://api.example.com/users \\",
    "  -H \"Authorization: Bearer YOUR_TOKEN\"",
    "",
    "# Example response",
    "{",
    "  \"users\": [],",
    "  \"total\": 0",
    "}",
    "```",
  ].join("\n"),
};

export function generateRecommendations(
  issues: AnalysisIssue[]
): Recommendation[] {
  const seen = new Set<string>();
  const recommendations: Recommendation[] = [];

  const sorted = [...issues].sort(
    (a, b) => SEVERITY_PRIORITY[b.severity] - SEVERITY_PRIORITY[a.severity]
  );

  for (const issue of sorted) {
    const ruleId = issue.ruleId ?? issue.id;

    if (seen.has(ruleId)) {
      const existing = recommendations.find((r) => r.id === "rec:" + ruleId);
      if (existing !== undefined) {
        (existing.relatedIssueIds as string[]).push(issue.id);
      }
      continue;
    }

    seen.add(ruleId);

    const context = RULE_CONTEXT[ruleId] ?? issue.description;
    const template = RULE_TEMPLATE[ruleId];

    recommendations.push({
      id: "rec:" + ruleId,
      priority: SEVERITY_PRIORITY[issue.severity],
      severity: issue.severity,
      category: issue.category,
      title: issue.title,
      context,
      action: issue.suggestion ?? "Review and address this issue.",
      ...(template !== undefined ? { template } : {}),
      relatedIssueIds: [issue.id],
    });
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}