import type { AnalysisResult }      from "@docaudit/shared";
import { generateRecommendations }  from "@docaudit/engine";
import { prioritize }               from "@docaudit/engine";
import { formatDocumentReport }     from "./formatter.js";
import { serializeReport }          from "./serializer.js";
import type { JsonReport }          from "./formatter.js";

const REPORTER_VERSION = "0.1.0";

// --- Public API ---------------------------------------------------------------

/**
 * Transforms an array of AnalysisResult into a structured JsonReport.
 *
 * No side effects. No I/O. Pure transformation.
 */
export function buildJsonReport(results: AnalysisResult[]): JsonReport {
  const documents = results.map((result) => {
    const recommendations = generateRecommendations(result.issues);
    const prioritized      = prioritize(result.issues, recommendations);
    return formatDocumentReport(result, recommendations, prioritized);
  });

  const totalIssues = documents.reduce(
    (sum, doc) => sum + doc.summary.totalIssues,
    0,
  );

  const averageScore =
    documents.length === 0
      ? 100
      : documents.reduce((sum, doc) => sum + doc.score.overall, 0) /
        documents.length;

  return {
    schemaVersion: "1.0",
    generator: {
      name:    "docaudit",
      version: REPORTER_VERSION,
    },
    generatedAt: new Date().toISOString(),
    documents,
    aggregate: {
      documentCount: documents.length,
      totalIssues,
      averageScore:  Math.round(averageScore * 10) / 10,
    },
  };
}

/**
 * Convenience wrapper: build + serialize in one call.
 *
 * Equivalent to: serializeReport(buildJsonReport(results))
 */
export function renderJson(results: AnalysisResult[]): string {
  return serializeReport(buildJsonReport(results));
}
