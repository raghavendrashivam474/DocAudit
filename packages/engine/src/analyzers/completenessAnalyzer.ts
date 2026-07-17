import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
} from "@docaudit/shared";
import {
  extractHeadings,
  normalizeHeading,
  hasFencedCodeBlock,
} from "./markdown.js";

const HTTP_METHOD_PATTERN =
  /\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\s+\/[^\s`]*/m;

const REQUIRED_API_SECTIONS = [
  "overview",
  "authentication",
  "endpoints",
] as const;

function isApiLikeDocument(content: string, headingNames: readonly string[]): boolean {
  return (
    HTTP_METHOD_PATTERN.test(content) ||
    headingNames.some((heading) => heading.includes("api") || heading.includes("endpoint"))
  );
}

export class CompletenessAnalyzer implements IAnalyzer {
  readonly name = "completeness";
  readonly version = "0.1.0";

  async analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const issues: AnalysisIssue[] = [];
    const headings = extractHeadings(context.content);
    const headingNames = headings.map((heading) => normalizeHeading(heading.text));
    const headingSet = new Set(headingNames);

    const apiLike = isApiLikeDocument(context.content, headingNames);

    if (!apiLike) {
      return { issues };
    }

    for (const requiredSection of REQUIRED_API_SECTIONS) {
      if (!headingSet.has(requiredSection)) {
        issues.push({
          id: `${this.name}:missing-section:${requiredSection}`,
          category: "completeness",
          severity: "medium",
          title: `Missing required section: ${requiredSection}`,
          description:
            `This API-style document appears to be missing the "${requiredSection}" section.`,
          suggestion:
            `Add a "${requiredSection}" heading with relevant content.`,
          ruleId: "completeness.missing-required-section",
        });
      }
    }

    if (!hasFencedCodeBlock(context.content)) {
      issues.push({
        id: `${this.name}:missing-example`,
        category: "completeness",
        severity: "low",
        title: "Document has no example code block",
        description:
          "API-style documentation is easier to use when it includes at least one example request or response.",
        suggestion: "Add a fenced code block with a sample request or response.",
        ruleId: "completeness.missing-example",
      });
    }

    return { issues };
  }
}
