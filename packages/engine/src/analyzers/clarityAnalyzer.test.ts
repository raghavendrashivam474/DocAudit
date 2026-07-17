import { describe, it, expect } from "vitest";
import { ClarityAnalyzer } from "./clarityAnalyzer.js";
import type { AnalyzerContext } from "@docaudit/shared";

function makeContext(content: string): AnalyzerContext {
  return {
    documentId: "test-id",
    documentName: "test.md",
    content,
  };
}

describe("ClarityAnalyzer", () => {
  const analyzer = new ClarityAnalyzer();

  it("has correct name and version", () => {
    expect(analyzer.name).toBe("clarity");
    expect(analyzer.version).toBe("0.1.0");
  });

  it("reports no issues for clean content", async () => {
    const content = "# Title\n\nClean content with no issues.\n";
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues).toHaveLength(0);
  });

  it("detects TODO placeholder", async () => {
    const output = await analyzer.analyze(makeContext("TODO: finish this"));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("detects TBD placeholder", async () => {
    const output = await analyzer.analyze(makeContext("TBD"));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("detects FIXME placeholder", async () => {
    const output = await analyzer.analyze(makeContext("FIXME: broken"));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("detects WIP placeholder", async () => {
    const output = await analyzer.analyze(makeContext("WIP: not done"));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("is case-insensitive for placeholders", async () => {
    const output = await analyzer.analyze(makeContext("todo: write this"));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("detects long lines over 140 chars", async () => {
    const longLine = "A".repeat(141);
    const output = await analyzer.analyze(makeContext(longLine));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("clarity.long-line");
  });

  it("does not flag lines at exactly 140 chars", async () => {
    const okLine = "A".repeat(140);
    const output = await analyzer.analyze(makeContext(okLine));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).not.toContain("clarity.long-line");
  });

  it("reports correct line number for placeholder", async () => {
    const content = "# Title\n\nTODO: fix me\n";
    const output = await analyzer.analyze(makeContext(content));
    const placeholder = output.issues.find(
      (i) => i.ruleId === "clarity.placeholder-text"
    );
    expect(placeholder?.location?.line).toBe(3);
  });

  it("includes affectedText for placeholder issues", async () => {
    const output = await analyzer.analyze(makeContext("TODO: write docs"));
    const issue = output.issues.find(
      (i) => i.ruleId === "clarity.placeholder-text"
    );
    expect(issue?.affectedText).toBe("TODO: write docs");
  });
});
