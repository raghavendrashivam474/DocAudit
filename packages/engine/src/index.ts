// ─── Pipeline ─────────────────────────────────────────────────────────────────
export { runPipeline } from "./pipeline/pipeline.js";
export type { PipelineOptions } from "./pipeline/pipeline.js";

// ─── Registry ─────────────────────────────────────────────────────────────────
export { AnalyzerRegistryImpl } from "./registry/analyzerRegistry.js";

// ─── Built-in Analyzers ──────────────────────────────────────────────────────
export { PlaceholderAnalyzer } from "./analyzers/placeholderAnalyzer.js";
