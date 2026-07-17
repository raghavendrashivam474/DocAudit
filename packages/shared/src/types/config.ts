import type { Severity, IssueCategory } from "./analysis.js";

// ─── Rule Configuration ───────────────────────────────────────────────────────

export interface RuleConfig {
  readonly enabled: boolean;
  readonly severity: Severity;
  readonly options?: Record<string, unknown>;
}

// ─── Per-Analyzer Configuration (used inside DocAuditConfig) ─────────────────
// Named AnalyzerPluginConfig to avoid collision with IAnalyzer runtime config.

export interface AnalyzerPluginConfig {
  readonly enabled: boolean;
  readonly rules?: Record<string, RuleConfig>;
}

// ─── Output Configuration ─────────────────────────────────────────────────────

export interface OutputConfig {
  readonly format: "json" | "html" | "markdown" | "pdf";
  readonly path?: string;
  readonly includeRawContent?: boolean;
}

// ─── Root Configuration ───────────────────────────────────────────────────────

/**
 * The complete DocAudit configuration contract.
 *
 * targetPath  – root directory to analyse (defaults to cwd)
 * minSeverity – lowest severity level to report
 * verbose     – emit debug-level log output
 */
export interface DocAuditConfig {
  readonly targetPath: string;
  readonly minSeverity: Severity;
  readonly verbose: boolean;
  readonly analyzerOptions: Record<string, AnalyzerPluginConfig>;
  readonly output?: OutputConfig[];
  readonly ignoreCategories?: IssueCategory[];
  readonly customRules?: Record<string, RuleConfig>;
  readonly metadata?: Record<string, unknown>;
}

// ─── Utility Types ────────────────────────────────────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type PartialConfig = DeepPartial<DocAuditConfig>;
