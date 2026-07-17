import type { AnalysisResult, Severity } from "@docaudit/shared";

// ─── ANSI colour helpers ──────────────────────────────────────────────────────

const RESET  = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

const COLOUR: Record<Severity, string> = {
  critical: "\x1b[31m", // red
  high:     "\x1b[33m", // yellow
  medium:   "\x1b[34m", // blue
  low:      "\x1b[36m", // cyan
  info:     "\x1b[37m", // white
};

function coloured(severity: Severity, text: string): string {
  return `${COLOUR[severity]}${text}${RESET}`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Writes a human-readable analysis summary to stdout.
 *
 * Intended for CLI usage only — never called by library consumers.
 */
export function renderToConsole(analyses: AnalysisResult[]): void {
  for (const result of analyses) {
    const { documentName, summary, issues } = result;
    const score = summary.score.overall.toFixed(1);

    console.log(`\n${BOLD}${documentName}${RESET}`);
    console.log(`  Score : ${BOLD}${score}/100${RESET} (${summary.score.grade})`);
    console.log(`  Issues: ${summary.totalIssues}`);
    console.log(
      [
        `  ${coloured("critical", `${summary.criticalCount} critical`)}`,
        `${coloured("high",     `${summary.highCount} high`)}`,
        `${coloured("medium",   `${summary.mediumCount} medium`)}`,
        `${coloured("low",      `${summary.lowCount} low`)}`,
        `${coloured("info",     `${summary.infoCount} info`)}`,
      ].join("  ")
    );

    if (issues.length === 0) {
      console.log(`  ${DIM}No issues found.${RESET}`);
      continue;
    }

    console.log();
    for (const issue of issues) {
      const badge = coloured(issue.severity, `[${issue.severity.toUpperCase()}]`);
      console.log(`  ${badge} ${BOLD}${issue.title}${RESET}`);
      console.log(`  ${DIM}${issue.description}${RESET}`);
      if (issue.suggestion) {
        console.log(`  ${DIM}→ ${issue.suggestion}${RESET}`);
      }
      console.log();
    }
  }
}
