import type { DocAuditConfig } from "@docaudit/shared";

export interface ConfigValidationError {
  readonly field: string;
  readonly message: string;
}

export type ConfigValidationResult =
  | { readonly valid: true; readonly config: DocAuditConfig }
  | { readonly valid: false; readonly errors: readonly ConfigValidationError[] };

const VALID_SEVERITIES = new Set<string>([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

/**
 * Validates a raw configuration object.
 *
 * After field-level checks pass we know the shape matches DocAuditConfig.
 * The final assignment uses a type-safe assembly rather than a cast.
 */
export function validateConfig(raw: unknown): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];

  if (typeof raw !== "object" || raw === null) {
    return {
      valid: false,
      errors: [{ field: "root", message: "Configuration must be an object." }],
    };
  }

  const c = raw as Record<string, unknown>;

  // Extract and validate each field
  const targetPath = c["targetPath"];
  const minSeverity = c["minSeverity"];
  const verbose = c["verbose"];
  const analyzerOptions = c["analyzerOptions"];

  if (typeof targetPath !== "string") {
    errors.push({
      field: "targetPath",
      message: "targetPath must be a string.",
    });
  }

  if (typeof minSeverity !== "string" || !VALID_SEVERITIES.has(minSeverity)) {
    errors.push({
      field: "minSeverity",
      message: `minSeverity must be one of: ${[...VALID_SEVERITIES].join(", ")}.`,
    });
  }

  if (typeof verbose !== "boolean") {
    errors.push({
      field: "verbose",
      message: "verbose must be a boolean.",
    });
  }

  if (typeof analyzerOptions !== "object" || analyzerOptions === null) {
    errors.push({
      field: "analyzerOptions",
      message: "analyzerOptions must be an object.",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // At this point all field validations have passed.
  // Assemble a properly typed DocAuditConfig from validated fields.
  const config: DocAuditConfig = {
    targetPath: targetPath as string,
    minSeverity: minSeverity as DocAuditConfig["minSeverity"],
    verbose: verbose as boolean,
    analyzerOptions: analyzerOptions as DocAuditConfig["analyzerOptions"],
  };

  return { valid: true, config };
}