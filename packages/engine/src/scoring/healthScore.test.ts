import { describe, it, expect } from "vitest";
import { computeHealthScore } from "./healthScore.js";
import type { AnalysisIssue } from "@docaudit/shared";

function makeIssue(
  id: string,
  severity: AnalysisIssue["severity"],
  category: AnalysisIssue["category"]
): AnalysisIssue {
  return {
    id,
    severity,
    category,
    title: "Test issue",
    description: "Test",
    ruleId: id,
  };
}

describe("computeHealthScore", () => {
  it("returns 100 overall with no issues", () => {
    const score = computeHealthScore([]);
    expect(score.overall).toBe(100);
    expect(score.grade).toBe("A");
  });

  it("returns grade A for score >= 90", () => {
    const score = computeHealthScore([makeIssue("a", "low", "clarity")]);
    expect(score.grade).toBe("A");
  });

  it("reduces score for high severity issues", () => {
    const issues = [makeIssue("a", "high", "structure")];
    const score = computeHealthScore(issues);
    expect(score.overall).toBeLessThan(100);
  });

  it("reduces score more for critical than low", () => {
    const critScore = computeHealthScore([makeIssue("a", "critical", "structure")]);
    const lowScore  = computeHealthScore([makeIssue("b", "low", "structure")]);
    expect(critScore.overall).toBeLessThan(lowScore.overall);
  });

  it("produces category breakdown with 6 categories", () => {
    const score = computeHealthScore([]);
    expect(score.categories).toHaveLength(6);
  });

  it("isolates issues to their category", () => {
    const issues = [makeIssue("a", "high", "structure")];
    const score = computeHealthScore(issues);
    const structureCat = score.categories.find((c) => c.category === "structure");
    const completenessCat = score.categories.find((c) => c.category === "completeness");
    expect(structureCat?.score).toBeLessThan(100);
    expect(completenessCat?.score).toBe(100);
  });

  it("clamps score to 0 minimum", () => {
    const issues = Array.from({ length: 10 }, (_, i) =>
      makeIssue("issue-" + String(i), "critical", "structure")
    );
    const score = computeHealthScore(issues);
    expect(score.overall).toBeGreaterThanOrEqual(0);
  });

  it("never exceeds 100", () => {
    const score = computeHealthScore([]);
    expect(score.overall).toBeLessThanOrEqual(100);
  });
});