import { describe, it, expect } from "vitest";
import { prioritize } from "./priorityEngine.js";
import { calculatePriority } from "./priorityCalculator.js";
import type { AnalysisIssue } from "@docaudit/shared";
import type { Recommendation } from "../recommendations/recommendationEngine.js";

function makeIssue(
  id: string,
  severity: AnalysisIssue["severity"],
  category: AnalysisIssue["category"] = "structure"
): AnalysisIssue {
  return {
    id,
    severity,
    category,
    title: "Issue " + id,
    description: "Test issue",
    ruleId: "test." + id,
  };
}

function makeRec(
  id: string,
  issueId: string,
  template?: string
): Recommendation {
  return {
    id: "rec:" + id,
    priority: 50,
    severity: "medium",
    category: "structure",
    title: "Rec " + id,
    context: "test",
    action: "fix",
    ...(template !== undefined ? { template } : {}),
    relatedIssueIds: [issueId],
  };
}

describe("prioritize", () => {
  it("returns empty result for no issues", () => {
    const result = prioritize([]);
    expect(result.findings).toHaveLength(0);
    expect(result.summary.total).toBe(0);
    expect(result.summary.topPriority).toBe(0);
  });

  it("sorts findings by priority descending", () => {
    const issues = [
      makeIssue("a", "low"),
      makeIssue("b", "critical"),
      makeIssue("c", "medium"),
    ];
    const result = prioritize(issues);
    expect(result.findings[0]?.issue.id).toBe("b");
    expect(result.findings[1]?.issue.id).toBe("c");
    expect(result.findings[2]?.issue.id).toBe("a");
  });

  it("assigns 1-based ranks", () => {
    const issues = [makeIssue("a", "high"), makeIssue("b", "low")];
    const result = prioritize(issues);
    expect(result.findings[0]?.rank).toBe(1);
    expect(result.findings[1]?.rank).toBe(2);
  });

  it("uses deterministic tiebreaker for equal priorities", () => {
    const issues = [
      makeIssue("z", "medium"),
      makeIssue("a", "medium"),
      makeIssue("m", "medium"),
    ];
    const result = prioritize(issues);
    // Same priority: sorted by id ascending
    expect(result.findings[0]?.issue.id).toBe("a");
    expect(result.findings[1]?.issue.id).toBe("m");
    expect(result.findings[2]?.issue.id).toBe("z");
  });

  it("gives higher priority to critical than low", () => {
    const crit = calculatePriority(makeIssue("a", "critical"), undefined);
    const low  = calculatePriority(makeIssue("b", "low"), undefined);
    expect(crit).toBeGreaterThan(low);
  });

  it("boosts priority when a recommendation exists", () => {
    const issue = makeIssue("a", "medium");
    const withRec    = calculatePriority(issue, makeRec("r1", "a"));
    const withoutRec = calculatePriority(issue, undefined);
    expect(withRec).toBeGreaterThan(withoutRec);
  });

  it("boosts priority further when template is available", () => {
    const issue = makeIssue("a", "medium");
    const withTemplate = calculatePriority(
      issue,
      makeRec("r1", "a", "# Template")
    );
    const withoutTemplate = calculatePriority(issue, makeRec("r2", "a"));
    expect(withTemplate).toBeGreaterThan(withoutTemplate);
  });

  it("counts issues by severity in summary", () => {
    const issues = [
      makeIssue("a", "critical"),
      makeIssue("b", "critical"),
      makeIssue("c", "high"),
      makeIssue("d", "low"),
    ];
    const result = prioritize(issues);
    expect(result.summary.bySeverity.critical).toBe(2);
    expect(result.summary.bySeverity.high).toBe(1);
    expect(result.summary.bySeverity.low).toBe(1);
    expect(result.summary.bySeverity.medium).toBe(0);
  });

  it("counts issues by category in summary", () => {
    const issues = [
      makeIssue("a", "high", "structure"),
      makeIssue("b", "high", "clarity"),
      makeIssue("c", "medium", "structure"),
    ];
    const result = prioritize(issues);
    expect(result.summary.byCategory.structure).toBe(2);
    expect(result.summary.byCategory.clarity).toBe(1);
  });

  it("attaches matching recommendation to finding", () => {
    const issue = makeIssue("a", "high");
    const rec = makeRec("r1", "a");
    const result = prioritize([issue], [rec]);
    expect(result.findings[0]?.recommendation?.id).toBe("rec:r1");
  });

  it("leaves recommendation undefined when no match", () => {
    const issue = makeIssue("a", "high");
    const result = prioritize([issue], []);
    expect(result.findings[0]?.recommendation).toBeUndefined();
  });

  it("produces deterministic output on repeat calls", () => {
    const issues = [makeIssue("a", "high"), makeIssue("b", "medium")];
    const r1 = prioritize(issues);
    const r2 = prioritize(issues);
    expect(r1.findings.map((f) => f.issue.id)).toEqual(
      r2.findings.map((f) => f.issue.id)
    );
    expect(r1.summary.topPriority).toBe(r2.summary.topPriority);
  });

  it("includes reason string for each finding", () => {
    const result = prioritize([makeIssue("a", "high", "structure")]);
    expect(result.findings[0]?.reason).toContain("severity=high");
    expect(result.findings[0]?.reason).toContain("category=structure");
  });
});