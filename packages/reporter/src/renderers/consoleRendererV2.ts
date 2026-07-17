import type { AnalysisResult, Severity, IssueCategory } from "@docaudit/shared";
import type { Recommendation } from "@docaudit/engine";
import { generateRecommendations } from "@docaudit/engine";

// ANSI codes
const R      = "\x1b[0m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN   = "\x1b[36m";
const RED    = "\x1b[31m";
const BLUE   = "\x1b[34m";
const MAG    = "\x1b[35m";

const SEV_COLOUR: Record<Severity, string> = {
  critical: RED,
  high:     YELLOW,
  medium:   BLUE,
  low:      CYAN,
  info:     "\x1b[37m",
};

function gradeColour(score: number): string {
  if (score >= 80) return GREEN;
  if (score >= 60) return YELLOW;
  return RED;
}

function stars(grade: string): string {
  if (grade === "A") return GREEN + "* * * * *" + R;
  if (grade === "B") return GREEN + "* * * *" + DIM + " *" + R;
  if (grade === "C") return YELLOW + "* * *" + DIM + " * *" + R;
  if (grade === "D") return YELLOW + "* *" + DIM + " * * *" + R;
  return RED + "*" + DIM + " * * * *" + R;
}

function bar(score: number, width: number = 20): string {
  const filled = Math.round((score / 100) * width);
  const empty  = width - filled;
  const colour = score >= 80 ? GREEN : score >= 60 ? YELLOW : RED;
  return colour + "#".repeat(filled) + DIM + "-".repeat(empty) + R;
}

const CAT_LABEL: Record<IssueCategory, string> = {
  structure:    "Structure   ",
  completeness: "Completeness",
  clarity:      "Clarity     ",
  accuracy:     "Accuracy    ",
  consistency:  "Consistency ",
  compliance:   "Compliance  ",
};

function sevBadge(severity: Severity): string {
  return SEV_COLOUR[severity] + BOLD + "[" + severity.toUpperCase() + "]" + R;
}

function renderResult(result: AnalysisResult): void {
  const { documentName, summary } = result;
  const { score } = summary;
  const gc = gradeColour(score.overall);

  console.log();
  console.log("  " + BOLD + CYAN + documentName + R);
  console.log("  " + "-".repeat(50));

  // Overall score line
  console.log(
    "  Health Score  " +
    gc + BOLD + String(score.overall) + "/100" + R +
    "  " + stars(score.grade) +
    "  " + gc + BOLD + score.grade + R
  );
  console.log();

  // Category breakdown
  if (score.categories.length > 0) {
    console.log("  " + BOLD + "Category Breakdown" + R);
    for (const cat of score.categories) {
      const label = CAT_LABEL[cat.category];
      const scoreStr = String(cat.score).padStart(3);
      if (cat.issueCount === 0) {
        console.log(
          "  " + DIM + label + R +
          "  " + bar(cat.score) +
          "  " + GREEN + scoreStr + R +
          "  " + DIM + "clean" + R
        );
      } else {
        console.log(
          "  " + label +
          "  " + bar(cat.score) +
          "  " + scoreStr +
          "  " + DIM + String(cat.issueCount) + " issue" + (cat.issueCount !== 1 ? "s" : "") + R
        );
      }
    }
    console.log();
  }

  // Severity counts
  interface SevEntry { label: string; count: number; sev: Severity }
  const counts: SevEntry[] = [
    { label: "Critical", count: summary.criticalCount, sev: "critical" as Severity },
    { label: "High",     count: summary.highCount,     sev: "high" as Severity },
    { label: "Medium",   count: summary.mediumCount,   sev: "medium" as Severity },
    { label: "Low",      count: summary.lowCount,      sev: "low" as Severity },
    { label: "Info",     count: summary.infoCount,     sev: "info" as Severity },
  ].filter((c) => c.count > 0);

  if (counts.length > 0) {
    const line = counts
      .map((c) => SEV_COLOUR[c.sev] + BOLD + String(c.count) + " " + c.label + R)
      .join("  |  ");
    console.log("  " + line);
    console.log();
  }

  if (summary.totalIssues === 0) {
    console.log("  " + GREEN + "No issues found - excellent documentation!" + R);
    return;
  }

  // Top recommendations
  const recs: Recommendation[] = generateRecommendations(result.issues);
  if (recs.length > 0) {
    console.log("  " + BOLD + MAG + "Top Recommendations" + R);
    const top = recs.slice(0, 5);
    for (let i = 0; i < top.length; i += 1) {
      const rec = top[i];
      if (rec === undefined) continue;
      console.log(
        "  " + DIM + String(i + 1) + "." + R +
        "  " + sevBadge(rec.severity) +
        "  " + BOLD + rec.title + R
      );
      const ctx = rec.context.length > 100 ? rec.context.slice(0, 100) + "..." : rec.context;
      console.log("     " + DIM + ctx + R);
      console.log("     " + CYAN + "-> " + rec.action + R);
      if (rec.template !== undefined) {
        console.log("     " + DIM + "(template available)" + R);
      }
      console.log();
    }
  }
}

export function renderToConsoleV2(results: AnalysisResult[]): void {
  console.log();
  console.log(BOLD + CYAN + "  +===========================================+" + R);
  console.log(BOLD + CYAN + "  |         DocAudit Health Report           |" + R);
  console.log(BOLD + CYAN + "  +===========================================+" + R);

  for (const result of results) {
    renderResult(result);
  }

  if (results.length > 1) {
    const totalIssues = results.reduce((s, r) => s + r.summary.totalIssues, 0);
    const avgScore = results.reduce((s, r) => s + r.summary.score.overall, 0) / results.length;
    const rounded = Math.round(avgScore * 10) / 10;
    const gc = gradeColour(rounded);
    console.log("  " + "=".repeat(50));
    console.log("  " + BOLD + "Aggregate - " + String(results.length) + " files" + R);
    console.log("  Total issues   " + String(totalIssues));
    console.log("  Average score  " + gc + BOLD + String(rounded) + "/100" + R);
    console.log();
  }
}