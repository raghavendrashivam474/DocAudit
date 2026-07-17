// Analysis
export type {
  Severity,
  IssueCategory,
  DocumentLocation,
  AnalysisIssue,
  CategoryScore,
  AnalysisScore,
  AnalysisSummary,
  AnalysisResult,
} from "./analysis.js";

// Analyzer runtime
export type {
  AnalyzerRunConfig,
  AnalyzerContext,
  AnalyzerOutput,
  IAnalyzer,
  AnalyzerRegistry,
} from "./analyzer.js";

// Configuration
export type {
  RuleConfig,
  AnalyzerPluginConfig,
  OutputConfig,
  DocAuditConfig,
  DeepPartial,
  PartialConfig,
} from "./config.js";

// Reporting
export type {
  ReportFormat,
  ReportMetadata,
  ReportSection,
  Report,
  ReportGeneratorOptions,
  IReportGenerator,
} from "./report.js";
