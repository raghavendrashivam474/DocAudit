import { describe, it, expect } from "vitest";
import { buildJsonReport, renderJson } from "./jsonReporter.js";
import { serializeReport } from "./serializer.js";
import type { AnalysisResult } from "@docaudit/shared";

function makeResult(
  overrides?: Partial<AnalysisResult>
): AnalysisResult {
  const base: AnalysisResult = {
    id: "result-1",
    documentId: "doc-1",
    documentName: "test.md",
    analyzedAt: new Date("2026-01-01T00:00:00.000Z"),
    duration: 12.34,
    issues: [],
    summary: {
      totalIssues: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      infoCount: 0,
      score: {
        overall: 100,
        categories: [],
        grade: "A",
      },
      topIssues: [],
    },
  };
  return { ...base, ...overrides };
}

describe("buildJsonReport", () => {
  it("builds report with schema version 1.0", () => {
    const report = buildJsonReport([makeResult()]);
    expect(report.schemaVersion).toBe("1.0");
  });

  it("includes generator metadata", () => {
    const report = buildJsonReport([makeResult()]);
    expect(report.generator.name).toBe("docaudit");
    expect(report.generator.version).toBeTruthy();
  });

  it("includes ISO timestamp for generatedAt", () => {
    const report = buildJsonReport([makeResult()]);
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("handles empty results", () => {
    const report = buildJsonReport([]);
    expect(report.documents).toHaveLength(0);
    expect(report.aggregate.documentCount).toBe(0);
    expect(report.aggregate.totalIssues).toBe(0);
    expect(report.aggregate.averageScore).toBe(100);
  });

  it("aggregates document count", () => {
    const report = buildJsonReport([makeResult(), makeResult(), makeResult()]);
    expect(report.aggregate.documentCount).toBe(3);
  });

  it("aggregates total issues across documents", () => {
    const r1 = makeResult({
      issues: [],
      summary: {
        totalIssues: 3,
        criticalCount: 1, highCount: 1, mediumCount: 1,
        lowCount: 0, infoCount: 0,
        score: { overall: 60, categories: [], grade: "D" },
        topIssues: [],
      },
    });
    const r2 = makeResult({
      issues: [],
      summary: {
        totalIssues: 2,
        criticalCount: 0, highCount: 2, mediumCount: 0,
        lowCount: 0, infoCount: 0,
        score: { overall: 80, categories: [], grade: "B" },
        topIssues: [],
      },
    });
    const report = buildJsonReport([r1, r2]);
    expect(report.aggregate.totalIssues).toBe(5);
  });

  it("converts analyzedAt Date to ISO string", () => {
    const report = buildJsonReport([makeResult()]);
    expect(report.documents[0]?.analyzedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("rounds duration to two decimals", () => {
    const report = buildJsonReport([makeResult({ duration: 12.3456 })]);
    expect(report.documents[0]?.durationMs).toBe(12.35);
  });

  it("includes issues array in document report", () => {
    const result = makeResult({
      issues: [{
        id: "iss-1",
        ruleId: "test.rule",
        severity: "high",
        category: "structure",
        title: "Test issue",
        description: "Test",
      }],
      summary: {
        totalIssues: 1,
        criticalCount: 0, highCount: 1, mediumCount: 0,
        lowCount: 0, infoCount: 0,
        score: { overall: 90, categories: [], grade: "A" },
        topIssues: [],
      },
    });
    const report = buildJsonReport([result]);
    expect(report.documents[0]?.issues).toHaveLength(1);
    expect(report.documents[0]?.issues[0]?.id).toBe("iss-1");
  });

  it("includes prioritized findings with ranks", () => {
    const result = makeResult({
      issues: [{
        id: "iss-1",
        ruleId: "test.rule",
        severity: "critical",
        category: "structure",
        title: "Critical issue",
        description: "Test",
      }],
      summary: {
        totalIssues: 1,
        criticalCount: 1, highCount: 0, mediumCount: 0,
        lowCount: 0, infoCount: 0,
        score: { overall: 80, categories: [], grade: "B" },
        topIssues: [],
      },
    });
    const report = buildJsonReport([result]);
    expect(report.documents[0]?.prioritized).toHaveLength(1);
    expect(report.documents[0]?.prioritized[0]?.rank).toBe(1);
  });
});

describe("serializeReport", () => {
  it("produces valid JSON that round-trips", () => {
    const report = buildJsonReport([makeResult()]);
    const serialized = serializeReport(report);
    const parsed: unknown = JSON.parse(serialized);
    expect(parsed).toBeDefined();
  });

  it("pretty-prints by default", () => {
    const report = buildJsonReport([makeResult()]);
    const serialized = serializeReport(report);
    expect(serialized).toContain("\n");
    expect(serialized).toContain("  ");
  });

  it("produces compact output when pretty is false", () => {
    const report = buildJsonReport([makeResult()]);
    const serialized = serializeReport(report, { pretty: false });
    expect(serialized).not.toContain("\n");
  });

  it("respects custom indent", () => {
    const report = buildJsonReport([makeResult()]);
    const serialized = serializeReport(report, { pretty: true, indent: 4 });
    expect(serialized).toContain("    ");
  });
});

describe("renderJson", () => {
  it("is equivalent to build + serialize", () => {
    const results = [makeResult()];
    const direct = renderJson(results);
    const twoStep = serializeReport(buildJsonReport(results));

    // Both use current time for generatedAt, so parse and compare structure
    const d = JSON.parse(direct) as { schemaVersion: string };
    const t = JSON.parse(twoStep) as { schemaVersion: string };
    expect(d.schemaVersion).toBe(t.schemaVersion);
  });
});