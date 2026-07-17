import { readFileSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";
import { loadConfig } from "@docaudit/config";
import {
  runPipeline,
  AnalyzerRegistryImpl,
  PlaceholderAnalyzer,
} from "@docaudit/engine";
import { formatJson, formatMarkdown, renderToConsole } from "@docaudit/reporter";
import type { AnalysisResult } from "@docaudit/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fail(message: string): never {
  console.error(`\x1b[31merror:\x1b[0m ${message}`);
  process.exit(1);
}

// ─── Command ──────────────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  readonly targetPath: string;
  readonly format?: "console" | "json" | "markdown" | undefined;
}

/**
 * Runs the full analysis pipeline on a single file and outputs the report.
 */
export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
  const filePath = resolve(options.targetPath);

  if (!existsSync(filePath)) {
    fail(`File not found: ${filePath}`);
  }

  // ── Load config ─────────────────────────────────────────────────────────
  const configResult = await loadConfig(process.cwd());
  if (!configResult.success) {
    fail(`Configuration errors:\n  ${configResult.errors.join("\n  ")}`);
  }

  // ── Build registry ──────────────────────────────────────────────────────
  const registry = new AnalyzerRegistryImpl();
  registry.register(new PlaceholderAnalyzer());

  // ── Read document ───────────────────────────────────────────────────────
  const content = readFileSync(filePath, "utf-8");
  const documentName = basename(filePath);

  // ── Run pipeline ────────────────────────────────────────────────────────
  const result: AnalysisResult = await runPipeline(registry.getAll(), {
    documentName,
    content,
  });

  // ── Output ──────────────────────────────────────────────────────────────
  const format = options.format ?? "console";

  switch (format) {
    case "json":
      console.log(formatJson([result]));
      break;
    case "markdown":
      console.log(formatMarkdown([result]));
      break;
    case "console":
    default:
      renderToConsole([result]);
      break;
  }
}
