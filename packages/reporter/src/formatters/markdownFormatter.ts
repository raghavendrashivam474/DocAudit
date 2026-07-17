import type { AnalysisResult, AnalysisIssue, Severity } from "@docaudit/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_EMOJI: Record<Severity, string> = {
  critical: "🔴",
  high:     "🟠",
  medium:   "🟡",
  low:      "🔵",
  info:     "⚪",
};

function severityBadge(severity: Severity): string {
  return `${SEVERITY_EMOJI[severity]} **${severity.toUpperCase()}**`;
}

function issueBlock(issue: AnalysisIssue, index: number): string {
  const lines: string[] = [
    `### ${index + 1}. ${issue.title}`,
    "",
    `- **Severity:** ${severityBadge(issue.severity)}`,
    `- **Category:** ${issue.category}`,
    `- **Rule:** \`${issue.ruleId ?? "n/a"}\``,
    "",
    issue.description,
  ];

  if (issue.affectedText) {
    lines.push("", "**Affected text:**", "```", issue.affectedText, "```");
  }

  if (issue.suggestion) {
    lines.push("", `**Suggestion:** ${issue.suggestion}`);
  }

  return lines.join("\n");
}

function resultSection(result: AnalysisResult): string {
  const { documentName, summary, issues, analyzedAt } = result;
  const score = summary.score.overall.toFixed(1);
  const grade = summary.score.grade;

  const header = [
    `## 📄 ${documentName}`,
    "",
    `| Metric | Value |`,
    `|--------|-------|`,
    `| Score  | ${score} / 100 (${grade}) |`,
    `| Issues | ${summary.totalIssues} |`,
    `| Critical | ${summary.criticalCount} |`,
    `| High   | ${summary.highCount} |`,
    `| Medium | ${summary.mediumCount} |`,
    `| Low    | ${summary.lowCount} |`,
    `| Info   | ${summary.infoCount} |`,
    `| Analysed | ${analyzedAt.toISOString()} |`,
    "",
  ].join("\n");

  const body =
    issues.length === 0
      ? "_No issues found._"
      : issues.map((issue, i) => issueBlock(issue, i)).join("\n\n---\n\n");

  return `${header}${body}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Renders one or more analysis results as a Markdown document.
 */
export function formatMarkdown(analyses: AnalysisResult[]): string {
  const sections = analyses.map(resultSection).join("\n\n---\n\n");

  return [
    "# DocAudit Report",
    "",
    `_Generated: ${new Date().toISOString()}_`,
    "",
    "---",
    "",
    sections,
    "",
  ].join("\n");
}
