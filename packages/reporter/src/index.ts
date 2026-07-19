// --- Formatters ---------------------------------------------------------------
export { formatJson }     from "./formatters/jsonFormatter.js";
export { formatMarkdown } from "./formatters/markdownFormatter.js";

// --- Renderers ----------------------------------------------------------------
export { renderToConsole }   from "./renderers/consoleRenderer.js";
export { renderToConsoleV2 } from "./renderers/consoleRendererV2.js";

// --- JSON Reporter ------------------------------------------------------------
export { buildJsonReport, renderJson } from "./json/jsonReporter.js";
export { serializeReport }            from "./json/serializer.js";
export type {
  JsonReport,
  JsonDocumentReport,
  JsonIssue,
  JsonRecommendation,
  JsonPrioritizedFinding,
} from "./json/formatter.js";

// --- Utilities ----------------------------------------------------------------
export { writeJson }    from "./utils/writeJson.js";
export { prettyPrint }  from "./utils/prettyPrint.js";

// --- Reporter Types -----------------------------------------------------------
export type { ReporterResult } from "./types/ReporterResult.js";
