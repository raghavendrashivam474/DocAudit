import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
} from "@docaudit/shared";
import { extractHeadings } from "./markdown.js";

export class StructureAnalyzer implements IAnalyzer {
  readonly name = "structure";
  readonly version = "0.1.0";

  async analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const headings = extractHeadings(context.content);
    const issues: AnalysisIssue[] = [];

    if (headings.length === 0) {
      issues.push({
        id: `${this.name}:no-headings`,
        category: "structure",
        severity: "high",
        title: "Document has no headings",
        description:
          "The document does not contain any Markdown headings. Structured headings improve readability and navigation.",
        suggestion: "Add a top-level title (# Heading) and section headings.",
        ruleId: "structure.no-headings",
      });

      return { issues };
    }

    const firstHeading = headings[0];
    if (firstHeading && firstHeading.level !== 1) {
      issues.push({
        id: `${this.name}:missing-h1:${firstHeading.line}`,
        category: "structure",
        severity: "high",
        title: "Document should begin with an H1 title",
        description:
          "The first heading is not a level-1 heading. A document should start with a single H1 title.",
        suggestion: "Change the first heading to `# Title`.",
        location: { line: firstHeading.line },
        ruleId: "structure.missing-h1",
      });
    }

    const h1s = headings.filter((heading) => heading.level === 1);
    if (h1s.length > 1) {
      issues.push({
        id: `${this.name}:multiple-h1`,
        category: "structure",
        severity: "medium",
        title: "Document contains multiple H1 headings",
        description:
          "Multiple top-level titles can make the document hierarchy ambiguous.",
        suggestion: "Keep one H1 for the document title and use H2/H3 for sections.",
        location: { line: h1s[1]?.line },
        ruleId: "structure.multiple-h1",
      });
    }

    for (let i = 1; i < headings.length; i += 1) {
      const previous = headings[i - 1];
      const current = headings[i];

      if (previous && current && current.level > previous.level + 1) {
        issues.push({
          id: `${this.name}:heading-jump:${current.line}`,
          category: "structure",
          severity: "medium",
          title: "Heading level jumps too abruptly",
          description:
            `Heading "${current.text}" jumps from H${previous.level} to H${current.level}, which skips an intermediate level.`,
          suggestion: `Use H${previous.level + 1} before H${current.level}.`,
          location: { line: current.line },
          ruleId: "structure.heading-jump",
        });
      }

      if (current && current.text.length === 0) {
        issues.push({
          id: `${this.name}:empty-heading:${current.line}`,
          category: "structure",
          severity: "low",
          title: "Heading text is empty",
          description:
            "A heading marker exists but the heading has no visible text.",
          suggestion: "Add descriptive text after the heading marker.",
          location: { line: current.line },
          ruleId: "structure.empty-heading",
        });
      }
    }

    return { issues };
  }
}
