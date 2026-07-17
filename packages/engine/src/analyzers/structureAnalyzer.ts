import type {
  IAnalyzer,
  AnalyzerContext,
  AnalyzerOutput,
  AnalysisIssue,
  DocHeading,
} from "@docaudit/shared";

export class StructureAnalyzer implements IAnalyzer {
  readonly name = "structure";
  readonly version = "0.1.0";

  analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const { headings } = context.document;
    const issues: AnalysisIssue[] = [];

    // ── No headings ────────────────────────────────────────────────────────
    if (headings.length === 0) {
      issues.push({
        id: `${this.name}:no-headings`,
        category: "structure",
        severity: "high",
        title: "Document has no headings",
        description:
          "The document contains no Markdown headings. Structured headings improve readability and navigation.",
        suggestion: "Add a top-level title (# Heading) and section headings.",
        ruleId: "structure.no-headings",
      });
      return Promise.resolve({ issues });
    }

    // ── First heading should be H1 ─────────────────────────────────────────
    const first = headings[0];
    if (first !== undefined && first.level !== 1) {
      issues.push({
        id: `${this.name}:missing-h1:${String(first.line)}`,
        category: "structure",
        severity: "high",
        title: "Document should begin with an H1 title",
        description:
          "The first heading is not a level-1 heading. A document should start with a single H1 title.",
        suggestion: "Change the first heading to `# Title`.",
        location: { line: first.line },
        ruleId: "structure.missing-h1",
      });
    }

    // ── Multiple H1s ───────────────────────────────────────────────────────
    const h1s = headings.filter((h) => h.level === 1);
    if (h1s.length > 1) {
      const second = h1s[1];
      issues.push({
        id: `${this.name}:multiple-h1`,
        category: "structure",
        severity: "medium",
        title: "Document contains multiple H1 headings",
        description:
          "Multiple top-level titles make the document hierarchy ambiguous.",
        suggestion:
          "Keep one H1 for the document title and use H2/H3 for sections.",
        ...(second !== undefined ? { location: { line: second.line } } : {}),
        ruleId: "structure.multiple-h1",
      });
    }

    // ── Heading jumps + empty headings ─────────────────────────────────────
    for (let i = 1; i < headings.length; i += 1) {
      const prev = headings[i - 1] as DocHeading;
      const curr = headings[i] as DocHeading;

      if (curr.level > prev.level + 1) {
        issues.push({
          id: `${this.name}:heading-jump:${String(curr.line)}`,
          category: "structure",
          severity: "medium",
          title: "Heading level jumps too abruptly",
          description: `Heading "${curr.text}" jumps from H${String(prev.level)} to H${String(curr.level)}, skipping an intermediate level.`,
          suggestion: `Use H${String(prev.level + 1)} before H${String(curr.level)}.`,
          location: { line: curr.line },
          ruleId: "structure.heading-jump",
        });
      }

      if (curr.text.trim().length === 0) {
        issues.push({
          id: `${this.name}:empty-heading:${String(curr.line)}`,
          category: "structure",
          severity: "low",
          title: "Heading text is empty",
          description: "A heading marker exists but has no visible text.",
          suggestion: "Add descriptive text after the heading marker.",
          location: { line: curr.line },
          ruleId: "structure.empty-heading",
        });
      }
    }

    return Promise.resolve({ issues });
  }
}
