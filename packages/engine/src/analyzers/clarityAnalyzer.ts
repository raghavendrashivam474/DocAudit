import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
} from "@docaudit/shared";
import { splitLines } from "./markdown.js";

const PLACEHOLDER_PATTERN = /\b(TODO|TBD|FIXME|WIP)\b/i;
const MAX_LINE_LENGTH = 140;

export class ClarityAnalyzer implements IAnalyzer {
  readonly name = "clarity";
  readonly version = "0.1.0";

  async analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const issues: AnalysisIssue[] = [];
    const lines = splitLines(context.content);

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i] ?? "";
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      if (PLACEHOLDER_PATTERN.test(trimmed)) {
        issues.push({
          id: `${this.name}:placeholder:${i + 1}`,
          category: "clarity",
          severity: "medium",
          title: "Placeholder text found",
          description:
            `Line ${i + 1} contains placeholder text such as TODO/TBD/FIXME/WIP.`,
          suggestion: "Replace placeholder text with final documentation.",
          location: { line: i + 1 },
          affectedText: trimmed,
          ruleId: "clarity.placeholder-text",
        });
      }

      if (trimmed.length > MAX_LINE_LENGTH) {
        issues.push({
          id: `${this.name}:long-line:${i + 1}`,
          category: "clarity",
          severity: "low",
          title: "Line is unusually long",
          description:
            `Line ${i + 1} is ${trimmed.length} characters long, which can reduce readability.`,
          suggestion: "Split the line into shorter sentences or bullet points.",
          location: { line: i + 1 },
          affectedText: trimmed,
          ruleId: "clarity.long-line",
        });
      }
    }

    return { issues };
  }
}
