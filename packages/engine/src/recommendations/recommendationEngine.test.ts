import { describe, it, expect } from "vitest";
import { generateRecommendations } from "./recommendationEngine.js";
import type { AnalysisIssue } from "@docaudit/shared";

function makeIssue(
  id: string,
  severity: AnalysisIssue["severity"],
  category: AnalysisIssue["category"],
  ruleId: string
): AnalysisIssue {
  return { id, severity, category, title: "Issue " + id, description: "Test", suggestion: "Fix it", ruleId };
}

describe("generateRecommendations", () => {
  it("returns empty array for no issues", () => {
    expect(generateRecommendations([])).toHaveLength(0);
  });

  it("creates one recommendation per unique ruleId", () => {
    const issues = [
      makeIssue("a", "high",   "structure", "structure.no-headings"),
      makeIssue("b", "medium", "clarity",   "clarity.placeholder-text"),
    ];
    expect(generateRecommendations(issues)).toHaveLength(2);
  });

  it("groups issues with same ruleId into one recommendation", () => {
    const issues = [
      makeIssue("a", "medium", "clarity", "clarity.placeholder-text"),
      makeIssue("b", "medium", "clarity", "clarity.placeholder-text"),
      makeIssue("c", "medium", "clarity", "clarity.placeholder-text"),
    ];
    expect(generateRecommendations(issues)).toHaveLength(1);
  });

  it("sorts by priority descending", () => {
    const issues = [
      makeIssue("a", "low",      "clarity",      "clarity.long-line"),
      makeIssue("b", "critical", "structure",    "structure.no-headings"),
      makeIssue("c", "medium",   "completeness", "completeness.missing-example"),
    ];
    const recs = generateRecommendations(issues);
    expect(recs[0]?.severity).toBe("critical");
    expect(recs[recs.length - 1]?.severity).toBe("low");
  });

  it("includes rich context for known rules", () => {
    const issues = [makeIssue("a", "high", "structure", "structure.no-headings")];
    const recs = generateRecommendations(issues);
    expect(recs[0]?.context.length).toBeGreaterThan(50);
  });

  it("includes template for rules that have one", () => {
    const issues = [makeIssue("a", "high", "structure", "structure.no-headings")];
    const recs = generateRecommendations(issues);
    expect(recs[0]?.template).toBeDefined();
  });

  it("assigns correct priority for critical severity", () => {
    const issues = [makeIssue("a", "critical", "structure", "structure.no-headings")];
    const recs = generateRecommendations(issues);
    expect(recs[0]?.priority).toBe(100);
  });
});