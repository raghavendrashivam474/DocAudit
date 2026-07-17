import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
} from "@docaudit/shared";

const PLACEHOLDER_PATTERN = /\b(TODO|TBD|FIXME|WIP)\b/i;
const MAX_LINE_LENGTH = 140;

export class ClarityAnalyzer implements IAnalyzer {
  readonly name = "clarity";
  readonly version = "0.1.0";

  async analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const issues: AnalysisIssue[] = [];
    const lines = context.document.rawContent.split(/\r?\n/);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (line === undefined) continue;

      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      // ── Placeholder text ───────────────────────────────────────────────
      if (PLACEHOLDER_PATTERN.test(trimmed)) {
        issues.push({
          id: `${this.name}:placeholder:${String(i + 1)}`,
          category: "clarity",
          severity: "medium",
          title: "Placeholder text found",
          description: `Line ${String(i + 1)} contains placeholder text (TODO/TBD/FIXME/WIP).`,
          suggestion: "Replace placeholder text with final documentation.",
          location: { line: i + 1 },
          affectedText: trimmed,
          ruleId: "clarity.placeholder-text",
        });
      }

      // ── Long lines ─────────────────────────────────────────────────────
      if (trimmed.length > MAX_LINE_LENGTH) {
        issues.push({
          id: `${this.name}:long-line:${String(i + 1)}`,
          category: "clarity",
          severity: "low",
          title: "Line is unusually long",
          description: `Line ${String(i + 1)} is ${String(trimmed.length)} characters, which can reduce readability.`,
          suggestion: "Split into shorter sentences or bullet points.",
          location: { line: i + 1 },
          affectedText: trimmed,
          ruleId: "clarity.long-line",
        });
      }
    }

    return { issues };
  }
}
