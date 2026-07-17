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

// Semantic Document Model
export type {
  TextSpan,
  DocHeading,
  DocSection,
  DocParagraph,
  DocCodeBlock,
  LinkType,
  DocLink,
  DocImage,
  ListKind,
  DocListItem,
  DocList,
  DocTable,
  DocBadge,
  SemanticDocument,
} from "./document.js";
