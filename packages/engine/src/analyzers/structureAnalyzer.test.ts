import { describe, it, expect } from "vitest";
import { StructureAnalyzer } from "./structureAnalyzer.js";
import { makeContext } from "./testHelper.js";

describe("StructureAnalyzer", () => {
  const analyzer = new StructureAnalyzer();

  it("has correct name and version", () => {
    expect(analyzer.name).toBe("structure");
    expect(analyzer.version).toBe("0.1.0");
  });

  it("reports no issues for a well-structured document", async () => {
    const output = await analyzer.analyze(makeContext("# Title\n\n## Section\n\n### Sub\n"));
    expect(output.issues).toHaveLength(0);
  });

  it("reports no-headings when document has no headings", async () => {
    const output = await analyzer.analyze(makeContext("just plain text"));
    expect(output.issues).toHaveLength(1);
    expect(output.issues[0]?.ruleId).toBe("structure.no-headings");
    expect(output.issues[0]?.severity).toBe("high");
  });

  it("reports missing-h1 when document starts with H2", async () => {
    const output = await analyzer.analyze(makeContext("## Section\n\n### Sub\n"));
    expect(output.issues.map((i) => i.ruleId)).toContain("structure.missing-h1");
  });

  it("reports multiple-h1 when two H1s exist", async () => {
    const output = await analyzer.analyze(makeContext("# First\n\n# Second\n\n## Section\n"));
    expect(output.issues.map((i) => i.ruleId)).toContain("structure.multiple-h1");
  });

  it("reports heading-jump when level skips from H1 to H3", async () => {
    const output = await analyzer.analyze(makeContext("# Title\n\n### Too Deep\n"));
    expect(output.issues.map((i) => i.ruleId)).toContain("structure.heading-jump");
  });

  it("does not report heading-jump for H1 → H2 → H3", async () => {
    const output = await analyzer.analyze(makeContext("# Title\n\n## Section\n\n### Sub\n"));
    expect(output.issues).toHaveLength(0);
  });
});
