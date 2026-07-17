import type { AnalysisResult, AnalysisSummary } from "./analysis.js";

export type ReportFormat = "json" | "html" | "markdown" | "pdf";

export interface ReportMetadata {
  readonly generatedAt: Date;
  readonly generatedBy: string;
  readonly version: string;
  readonly documentCount: number;
}

export interface ReportSection {
  readonly title: string;
  readonly content: string;
  readonly order: number;
}

export interface Report {
  readonly id: string;
  readonly title: string;
  readonly format: ReportFormat;
  readonly metadata: ReportMetadata;
  readonly analyses: AnalysisResult[];
  readonly aggregateSummary?: AnalysisSummary;
  readonly sections?: ReportSection[];
  readonly rawContent?: string;
}

export interface ReportGeneratorOptions {
  readonly format: ReportFormat;
  readonly includeRawContent?: boolean;
  readonly customSections?: ReportSection[];
  readonly templatePath?: string;
}

export interface IReportGenerator {
  readonly format: ReportFormat;
  generate(
    analyses: AnalysisResult[],
    options?: ReportGeneratorOptions
  ): Promise<Report>;
}
