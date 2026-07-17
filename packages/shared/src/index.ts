// ─── Analysis Domain Models ───────────────────────────────────────────────────
export type {
  Severity,
  IssueCategory,
  DocumentLocation,
  AnalysisIssue,
  CategoryScore,
  AnalysisScore,
  AnalysisSummary,
  AnalysisResult,
} from "./types/analysis.js";

// ─── Analyzer Runtime Contract ────────────────────────────────────────────────
export type {
  AnalyzerRunConfig,
  AnalyzerContext,
  AnalyzerOutput,
  IAnalyzer,
  AnalyzerRegistry,
} from "./types/analyzer.js";

// ─── Configuration Contract ───────────────────────────────────────────────────
export type {
  RuleConfig,
  AnalyzerPluginConfig,
  OutputConfig,
  DocAuditConfig,
  DeepPartial,
  PartialConfig,
} from "./types/config.js";

// ─── Reporter Contract ────────────────────────────────────────────────────────
export type {
  ReportFormat,
  ReportMetadata,
  ReportSection,
  Report,
  ReportGeneratorOptions,
  IReportGenerator,
} from "./types/report.js";
