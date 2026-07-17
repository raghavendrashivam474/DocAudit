import type { AnalysisResult } from "@docaudit/shared";

/**
 * Serialises one or more analysis results to a pretty-printed JSON string.
 */
export function formatJson(analyses: AnalysisResult[]): string {
  return JSON.stringify(analyses, null, 2);
}
