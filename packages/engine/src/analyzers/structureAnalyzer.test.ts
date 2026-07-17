import { describe, it, expect } from "vitest";
import { StructureAnalyzer } from "./structureAnalyzer.js";
import type { AnalyzerContext } from "@docaudit/shared";

function makeContext(content: string): AnalyzerContext {
  return {
    documentId: "test-id",
    documentName: "test.md",
    content,
  };
}

describe("StructureAnalyzer", () => {
  const analyzer = new StructureAnalyzer();

  it("has correct name and version", () => {
    expect(analyzer.name).toBe("structure");
    expect(analyzer.version).toBe("0.1.0");
  });

  it("reports no issues for a well-structured document", async () => {
    const content = "# Title\n\n## Section\n\n### Sub-section\n";
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues).toHaveLength(0);
  });

  it("reports no-headings when document has no headings", async () => {
    const output = await analyzer.analyze(makeContext("just plain text"));
    expect(output.issues).toHaveLength(1);
    expect(output.issues[0]?.ruleId).toBe("structure.no-headings");
    expect(output.issues[0]?.severity).toBe("high");
  });

  it("reports missing-h1 when document starts with H2", async () => {
    const output = await analyzer.analyze(
      makeContext("## Section\n\n### Sub\n")
    );
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("structure.missing-h1");
  });

  it("reports multiple-h1 when two H1s exist", async () => {
    const content = "# First\n\n# Second\n\n## Section\n";
    const output = await analyzer.analyze(makeContext(content));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("structure.multiple-h1");
  });

  it("reports heading-jump when level skips from H1 to H3", async () => {
    const content = "# Title\n\n### Too Deep\n";
    const output = await analyzer.analyze(makeContext(content));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("structure.heading-jump");
  });

  it("does not report heading-jump for H1 → H2 → H3", async () => {
    const content = "# Title\n\n## Section\n\n### Sub\n";
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues).toHaveLength(0);
  });
});
