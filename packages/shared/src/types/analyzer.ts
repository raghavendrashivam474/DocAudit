import type { AnalysisIssue } from "./analysis.js";

// ─── Runtime Analyzer Options ─────────────────────────────────────────────────
// Named AnalyzerRunConfig to avoid collision with AnalyzerPluginConfig in config.ts

export interface AnalyzerRunConfig {
  readonly enabled: boolean;
  readonly severity?: string;
  readonly options?: Record<string, unknown>;
}

// ─── Analyzer Execution Context ───────────────────────────────────────────────

export interface AnalyzerContext {
  readonly documentId: string;
  readonly documentName: string;
  readonly content: string;
  readonly metadata?: Record<string, unknown>;
}

// ─── Analyzer Output ──────────────────────────────────────────────────────────

export interface AnalyzerOutput {
  readonly issues: AnalysisIssue[];
  readonly metadata?: Record<string, unknown>;
}

// ─── Analyzer Interface ───────────────────────────────────────────────────────

export interface IAnalyzer {
  readonly name: string;
  readonly version: string;
  analyze(context: AnalyzerContext): Promise<AnalyzerOutput>;
}

// ─── Analyzer Registry ────────────────────────────────────────────────────────

export interface AnalyzerRegistry {
  register(analyzer: IAnalyzer): void;
  get(name: string): IAnalyzer | undefined;
  getAll(): IAnalyzer[];
}
