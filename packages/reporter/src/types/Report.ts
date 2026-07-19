// Re-export shared report types for consumers of this package
export type {
  Report,
  ReportMetadata,
  ReportSection,
  ReportFormat,
  ReportGeneratorOptions,
  IReportGenerator,
} from "@docaudit/shared";

// JSON-specific serializable shape (defined in formatter.ts)
export type {
  JsonReport,
  JsonDocumentReport,
  JsonIssue,
  JsonRecommendation,
  JsonPrioritizedFinding,
} from "../json/formatter.js";
