// ─── Pipeline ─────────────────────────────────────────────────────────────────
export { runPipeline } from "./pipeline/pipeline.js";
export type { PipelineOptions } from "./pipeline/pipeline.js";
export { aggregateResults } from "./pipeline/aggregate.js";

// ─── Discovery ────────────────────────────────────────────────────────────────
export { discoverFiles } from "./discovery/discoverFiles.js";
export type { DiscoveryOptions } from "./discovery/discoverFiles.js";

// ─── Registry ─────────────────────────────────────────────────────────────────
export { AnalyzerRegistryImpl } from "./registry/analyzerRegistry.js";

// ─── Built-in Analyzers ──────────────────────────────────────────────────────
export { PlaceholderAnalyzer } from "./analyzers/placeholderAnalyzer.js";
export { StructureAnalyzer } from "./analyzers/structureAnalyzer.js";
export { CompletenessAnalyzer } from "./analyzers/completenessAnalyzer.js";
export { ClarityAnalyzer } from "./analyzers/clarityAnalyzer.js";
