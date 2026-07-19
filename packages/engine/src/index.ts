// Pipeline
export { runPipeline } from "./pipeline/pipeline.js";
export type { PipelineOptions } from "./pipeline/pipeline.js";
export { aggregateResults } from "./pipeline/aggregate.js";

// Parser
export { parseMarkdown } from "./parser/markdownParser.js";

// Scoring
export { computeHealthScore } from "./scoring/healthScore.js";

// Recommendations
export { generateRecommendations } from "./recommendations/recommendationEngine.js";
export type { Recommendation } from "./recommendations/recommendationEngine.js";

// Priority
export {
  prioritize,
  calculatePriority,
  explainPriority,
  SEVERITY_PRIORITY,
  CATEGORY_WEIGHT,
  DEFAULT_WEIGHTS,
} from "./priority/index.js";
export type {
  PrioritizedFinding,
  PrioritizedResult,
  PrioritySummary,
  PriorityWeights,
} from "./priority/index.js";

// Discovery
export { discoverFiles } from "./discovery/discoverFiles.js";
export type { DiscoveryOptions } from "./discovery/discoverFiles.js";
export { loadIgnorePatterns, isIgnored } from "./discovery/ignorePatterns.js";

// Registry
export { AnalyzerRegistryImpl } from "./registry/analyzerRegistry.js";

// Built-in Analyzers
export { PlaceholderAnalyzer } from "./analyzers/placeholderAnalyzer.js";
export { StructureAnalyzer } from "./analyzers/structureAnalyzer.js";
export { CompletenessAnalyzer } from "./analyzers/completenessAnalyzer.js";
export { ClarityAnalyzer } from "./analyzers/clarityAnalyzer.js";