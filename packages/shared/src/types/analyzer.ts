import type { AnalysisIssue } from "./analysis.js";
import type { SemanticDocument } from "./document.js";

// ─── Analyzer Execution Context ───────────────────────────────────────────────

export interface AnalyzerContext {
  readonly documentId: string;
  readonly documentName: string;
  readonly content: string;
  readonly document: SemanticDocument;
  readonly metadata?: Record<string, unknown> | undefined;
}

// ─── Analyzer Output ──────────────────────────────────────────────────────────

export interface AnalyzerOutput {
  readonly issues: AnalysisIssue[];
  readonly metadata?: Record<string, unknown> | undefined;
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
