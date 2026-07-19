import type { JsonReport } from "./formatter.js";

export interface SerializeOptions {
  readonly pretty?: boolean | undefined;
  readonly indent?: number | undefined;
}

/**
 * Serializes a JsonReport to a string.
 *
 * When `pretty` is true (default), output is indented and human-readable.
 * When false, output is compact single-line JSON suitable for pipelines.
 *
 * Property order is deterministic because the formatter always assembles
 * objects in the same order.
 */
export function serializeReport(
  report: JsonReport,
  options?: SerializeOptions
): string {
  const pretty = options?.pretty ?? true;
  const indent = options?.indent ?? 2;

  return pretty
    ? JSON.stringify(report, null, indent)
    : JSON.stringify(report);
}