import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
} from "@docaudit/shared";

const REQUIRED_API_SECTIONS = ["overview", "authentication", "endpoints"] as const;

function isApiLikeDocument(context: AnalyzerContext): boolean {
  const { document } = context;
  const hasHttpMethod = /\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/[^\s`]*/m
    .test(document.rawContent);
  const headingNames = document.headings.map((h) => h.text.toLowerCase());
  const hasApiHeading = headingNames.some(
    (name) => name.includes("api") || name.includes("endpoint")
  );
  return hasHttpMethod || hasApiHeading;
}

export class CompletenessAnalyzer implements IAnalyzer {
  readonly name = "completeness";
  readonly version = "0.1.0";

  analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const issues: AnalysisIssue[] = [];
    const { document } = context;

    if (!isApiLikeDocument(context)) {
      return Promise.resolve({ issues });
    }

    // ── Required sections ──────────────────────────────────────────────────
    const headingNames = new Set(
      document.headings.map((h) => h.text.trim().toLowerCase())
    );

    for (const section of REQUIRED_API_SECTIONS) {
      if (!headingNames.has(section)) {
        issues.push({
          id: `${this.name}:missing-section:${section}`,
          category: "completeness",
          severity: "medium",
          title: `Missing required section: ${section}`,
          description: `This API document is missing the "${section}" section.`,
          suggestion: `Add a "${section}" heading with relevant content.`,
          ruleId: "completeness.missing-required-section",
        });
      }
    }

    // ── Example code block ────────────────────────────────────────────────
    if (document.codeBlocks.length === 0) {
      issues.push({
        id: `${this.name}:missing-example`,
        category: "completeness",
        severity: "low",
        title: "Document has no example code block",
        description:
          "API documentation is easier to use when it includes at least one example request or response.",
        suggestion: "Add a fenced code block with a sample request or response.",
        ruleId: "completeness.missing-example",
      });
    }

    return Promise.resolve({ issues });
  }
}
