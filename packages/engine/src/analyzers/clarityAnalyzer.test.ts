import { describe, it, expect } from "vitest";
import { ClarityAnalyzer } from "./clarityAnalyzer.js";
import { makeContext } from "./testHelper.js";

describe("ClarityAnalyzer", () => {
  const analyzer = new ClarityAnalyzer();

  it("has correct name and version", () => {
    expect(analyzer.name).toBe("clarity");
    expect(analyzer.version).toBe("0.1.0");
  });

  it("reports no issues for clean content", async () => {
    const output = await analyzer.analyze(makeContext("# Title\n\nClean content.\n"));
    expect(output.issues).toHaveLength(0);
  });

  it("detects TODO placeholder", async () => {
    const output = await analyzer.analyze(makeContext("TODO: finish this"));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.placeholder-text");
  });

  it("detects TBD placeholder", async () => {
    const output = await analyzer.analyze(makeContext("TBD"));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.placeholder-text");
  });

  it("detects FIXME placeholder", async () => {
    const output = await analyzer.analyze(makeContext("FIXME: broken"));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.placeholder-text");
  });

  it("detects WIP placeholder", async () => {
    const output = await analyzer.analyze(makeContext("WIP: not done"));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.placeholder-text");
  });

  it("is case-insensitive for placeholders", async () => {
    const output = await analyzer.analyze(makeContext("todo: write this"));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.placeholder-text");
  });

  it("detects long lines over 140 chars", async () => {
    const output = await analyzer.analyze(makeContext("A".repeat(141)));
    expect(output.issues.map((i) => i.ruleId)).toContain("clarity.long-line");
  });

  it("does not flag lines at exactly 140 chars", async () => {
    const output = await analyzer.analyze(makeContext("A".repeat(140)));
    expect(output.issues.map((i) => i.ruleId)).not.toContain("clarity.long-line");
  });

  it("reports correct line number for placeholder", async () => {
    const output = await analyzer.analyze(makeContext("# Title\n\nTODO: fix me\n"));
    const issue = output.issues.find((i) => i.ruleId === "clarity.placeholder-text");
    expect(issue?.location?.line).toBe(3);
  });

  it("includes affectedText for placeholder issues", async () => {
    const output = await analyzer.analyze(makeContext("TODO: write docs"));
    const issue = output.issues.find((i) => i.ruleId === "clarity.placeholder-text");
    expect(issue?.affectedText).toBe("TODO: write docs");
  });
});
