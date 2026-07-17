import type { DocAuditConfig, Severity, AnalyzerPluginConfig } from "@docaudit/shared";

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

// ─── Type predicates ────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSeverity(value: unknown): value is Severity {
  return typeof value === "string" && VALID_SEVERITIES.has(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Best-effort validation of analyzer options.
 *
 * The inner shape of AnalyzerPluginConfig is not yet validated —
 * plugins are expected to validate their own options on load.
 */
function coerceAnalyzerOptions(
  value: Record<string, unknown>
): Record<string, AnalyzerPluginConfig> {
  const result: Record<string, AnalyzerPluginConfig> = {};
  for (const key of Object.keys(value)) {
    const inner = value[key];
    if (isRecord(inner)) {
      // Runtime-verified as an object; treat as plugin config
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      result[key] = inner as unknown as AnalyzerPluginConfig;
    }
  }
  return result;
}

// ─── Validator ─────────────────────────────────────────────────────────────

/**
 * Validates a raw configuration object.
 */
export function validateConfig(raw: unknown): ConfigValidationResult {
  const errors: ConfigValidationError[] = [];

  if (!isRecord(raw)) {
    return {
      valid: false,
      errors: [{ field: "root", message: "Configuration must be an object." }],
    };
  }

  const targetPath: unknown = raw["targetPath"];
  const minSeverity: unknown = raw["minSeverity"];
  const verbose: unknown = raw["verbose"];
  const analyzerOptions: unknown = raw["analyzerOptions"];

  if (!isString(targetPath)) {
    errors.push({ field: "targetPath", message: "targetPath must be a string." });
  }

  if (!isSeverity(minSeverity)) {
    errors.push({
      field: "minSeverity",
      message: `minSeverity must be one of: ${[...VALID_SEVERITIES].join(", ")}.`,
    });
  }

  if (!isBoolean(verbose)) {
    errors.push({ field: "verbose", message: "verbose must be a boolean." });
  }

  if (!isRecord(analyzerOptions)) {
    errors.push({
      field: "analyzerOptions",
      message: "analyzerOptions must be an object.",
    });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Re-narrow for TypeScript. errors.length === 0 means all passed.
  if (
    !isString(targetPath) ||
    !isSeverity(minSeverity) ||
    !isBoolean(verbose) ||
    !isRecord(analyzerOptions)
  ) {
    return {
      valid: false,
      errors: [{ field: "root", message: "Type narrowing failed." }],
    };
  }

  const config: DocAuditConfig = {
    targetPath,
    minSeverity,
    verbose,
    analyzerOptions: coerceAnalyzerOptions(analyzerOptions),
  };

  return { valid: true, config };
}