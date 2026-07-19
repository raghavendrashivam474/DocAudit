import { describe, it, expect } from "vitest";
import { buildJsonReport }      from "../json/jsonReporter.js";
import { serializeReport }      from "../json/serializer.js";
import { emptyResult, smallResult, largeResult } from "./fixtures.js";

describe("buildJsonReport", () => {

  it("sets schemaVersion to 1.0", () => {
    const report = buildJsonReport([emptyResult]);
    expect(report.schemaVersion).toBe("1.0");
  });

  it("includes generator name and version", () => {
    const report = buildJsonReport([emptyResult]);
    expect(report.generator.name).toBe("docaudit");
    expect(typeof report.generator.version).toBe("string");
  });

  it("generatedAt is ISO 8601", () => {
    const report = buildJsonReport([emptyResult]);
    expect(report.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("returns zero aggregate for empty array", () => {
    const report = buildJsonReport([]);
    expect(report.aggregate.documentCount).toBe(0);
    expect(report.aggregate.totalIssues).toBe(0);
    expect(report.aggregate.averageScore).toBe(100);
  });

  it("aggregates document count", () => {
    const report = buildJsonReport([emptyResult, smallResult, largeResult]);
    expect(report.aggregate.documentCount).toBe(3);
  });

  it("aggregates total issues", () => {
    const report = buildJsonReport([smallResult, largeResult]);
    expect(report.aggregate.totalIssues).toBe(52);
  });

  it("document preserves documentName", () => {
    const report = buildJsonReport([smallResult]);
    expect(report.documents[0]?.documentName).toBe("README.md");
  });

  it("document analyzedAt is ISO string", () => {
    const report = buildJsonReport([emptyResult]);
    expect(report.documents[0]?.analyzedAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("document issues are serialized", () => {
    const report = buildJsonReport([smallResult]);
    expect(report.documents[0]?.issues).toHaveLength(2);
    expect(report.documents[0]?.issues[0]?.id).toBe("iss-1");
  });

  it("document prioritized findings have rank 1 as highest", () => {
    const report = buildJsonReport([smallResult]);
    expect(report.documents[0]?.prioritized[0]?.rank).toBe(1);
  });

  it("large result produces 50 issues", () => {
    const report = buildJsonReport([largeResult]);
    expect(report.documents[0]?.issues).toHaveLength(50);
  });
});

describe("serializeReport", () => {

  it("produces valid JSON", () => {
    const report = buildJsonReport([emptyResult]);
    expect(() => JSON.parse(serializeReport(report))).not.toThrow();
  });

  it("pretty prints by default", () => {
    const report = buildJsonReport([emptyResult]);
    expect(serializeReport(report)).toContain("\n");
  });

  it("compact output has no newlines", () => {
    const report = buildJsonReport([emptyResult]);
    expect(serializeReport(report, { pretty: false })).not.toContain("\n");
  });

  it("respects custom indent", () => {
    const report = buildJsonReport([emptyResult]);
    const output = serializeReport(report, { pretty: true, indent: 4 });
    expect(output).toContain("    ");
  });

  it("round-trips through JSON.parse", () => {
    const report  = buildJsonReport([smallResult]);
    const parsed  = JSON.parse(serializeReport(report)) as { schemaVersion: string };
    expect(parsed.schemaVersion).toBe("1.0");
  });
});
