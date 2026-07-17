import type { DocAuditConfig } from "@docaudit/shared";

// ─── Validation Types ─────────────────────────────────────────────────────────

export interface ConfigValidationError {
  readonly field: string;
  readonly message: string;
}

export type ConfigValidationResult =
  | { readonly valid: true; readonly config: DocAuditConfig }
  | { readonly valid: false; readonly errors: readonly ConfigValidationError[] };

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_SEVERITIES = new Set<string>([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validates a raw configuration object.
 *
 * After field-level checks pass we know the shape matches DocAuditConfig,
 * so the cast through `unknown` is safe and intentional.
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

  // ── Required field: targetPath ────────────────────────────────────────────
  if (typeof c["targetPath"] !== "string") {
    errors.push({
      field: "targetPath",
      message: "targetPath must be a string.",
    });
  }

  // ── Required field: minSeverity ───────────────────────────────────────────
  if (
    typeof c["minSeverity"] !== "string" ||
    !VALID_SEVERITIES.has(c["minSeverity"])
  ) {
    errors.push({
      field: "minSeverity",
      message: `minSeverity must be one of: ${[...VALID_SEVERITIES].join(", ")}.`,
    });
  }

  // ── Required field: verbose ───────────────────────────────────────────────
  if (typeof c["verbose"] !== "boolean") {
    errors.push({
      field: "verbose",
      message: "verbose must be a boolean.",
    });
  }

  // ── Required field: analyzerOptions ───────────────────────────────────────
  if (
    typeof c["analyzerOptions"] !== "object" ||
    c["analyzerOptions"] === null
  ) {
    errors.push({
      field: "analyzerOptions",
      message: "analyzerOptions must be an object.",
    });
  }

  // ── Return result ─────────────────────────────────────────────────────────
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Safe: every required field has been runtime-validated above.
  // The cast goes through `unknown` to satisfy the compiler.
  return { valid: true, config: c as unknown as DocAuditConfig };
}
