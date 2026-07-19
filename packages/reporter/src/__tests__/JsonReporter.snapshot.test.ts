import { describe, it, expect } from "vitest";
import { buildJsonReport }      from "../json/jsonReporter.js";
import { serializeReport }      from "../json/serializer.js";
import { emptyResult, smallResult, largeResult, makeResult } from "./fixtures.js";

function stableJson(results: Parameters<typeof buildJsonReport>[0]): string {
  const report = buildJsonReport(results);
  const raw    = serializeReport(report);
  return raw.replace(
    /"generatedAt":\s*"[^"]+"/,
    '"generatedAt": "2026-01-01T00:00:00.000Z"',
  );
}

describe("JSON Reporter Snapshots", () => {

  it("matches snapshot for empty project", () => {
    expect(stableJson([emptyResult])).toMatchSnapshot();
  });

  it("matches snapshot for small project", () => {
    expect(stableJson([smallResult])).toMatchSnapshot();
  });

  it("matches snapshot for large project", () => {
    expect(stableJson([largeResult])).toMatchSnapshot();
  });

  it("compact mode matches snapshot", () => {
    const report = buildJsonReport([smallResult]);
    const raw = serializeReport(report, { pretty: false }).replace(
      /"generatedAt":"[^"]+"/,
      '"generatedAt":"2026-01-01T00:00:00.000Z"',
    );
    expect(raw).toMatchSnapshot();
  });

  it("multi-document report matches snapshot", () => {
    expect(stableJson([emptyResult, smallResult])).toMatchSnapshot();
  });
});
