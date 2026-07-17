import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, basename } from "node:path";
import { loadConfig } from "@docaudit/config";
import {
  runPipeline,
  AnalyzerRegistryImpl,
  StructureAnalyzer,
  CompletenessAnalyzer,
  ClarityAnalyzer,
  discoverFiles,
  aggregateResults,
} from "@docaudit/engine";
import { formatJson, formatMarkdown, renderToConsole } from "@docaudit/reporter";
import type { AnalysisResult } from "@docaudit/shared";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fail(message: string): never {
  console.error(`\x1b[31merror:\x1b[0m ${message}`);
  process.exit(1);
}

function buildRegistry(): AnalyzerRegistryImpl {
  const registry = new AnalyzerRegistryImpl();
  registry.register(new StructureAnalyzer());
  registry.register(new CompletenessAnalyzer());
  registry.register(new ClarityAnalyzer());
  return registry;
}

async function analyzeFile(
  filePath: string,
  registry: AnalyzerRegistryImpl
): Promise<AnalysisResult> {
  const content = readFileSync(filePath, "utf-8");
  const documentName = basename(filePath);

  return runPipeline(registry.getAll(), {
    documentName,
    content,
  });
}

// ─── Command ──────────────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  readonly targetPath: string;
  readonly format?: "console" | "json" | "markdown" | undefined;
}

export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
  const targetPath = resolve(options.targetPath);

  if (!existsSync(targetPath)) {
    fail(`Path not found: ${targetPath}`);
  }

  // ── Load config ─────────────────────────────────────────────────────────
  const configResult = await loadConfig(process.cwd());
  if (!configResult.success) {
    fail(`Configuration errors:\n  ${configResult.errors.join("\n  ")}`);
  }

  // ── Build registry ──────────────────────────────────────────────────────
  const registry = buildRegistry();

  // ── Discover files ──────────────────────────────────────────────────────
  let filePaths: string[];
  const stats = statSync(targetPath);

  if (stats.isDirectory()) {
    filePaths = discoverFiles(targetPath);

    if (filePaths.length === 0) {
      fail(`No document files found in: ${targetPath}`);
    }

    console.log(
      `\x1b[36mFound ${String(filePaths.length)} document(s) in ${targetPath}\x1b[0m\n`
    );
  } else {
    filePaths = [targetPath];
  }

  // ── Analyze each file ──────────────────────────────────────────────────
  const results: AnalysisResult[] = [];

  for (const filePath of filePaths) {
    const result = await analyzeFile(filePath, registry);
    results.push(result);
  }

  // ── Output ──────────────────────────────────────────────────────────────
  const format = options.format ?? "console";

  switch (format) {
    case "json":
      console.log(formatJson(results));
      break;
    case "markdown":
      console.log(formatMarkdown(results));
      break;
    case "console":
    default:
      renderToConsole(results);

      // Show aggregate summary for multi-file runs
      if (results.length > 1) {
        const agg = aggregateResults(results);
        console.log("\n\x1b[1m── Aggregate Summary ──\x1b[0m");
        console.log(`  Files analysed: ${String(results.length)}`);
        console.log(`  Total issues:   ${String(agg.totalIssues)}`);
        console.log(
          `  Average score:  ${String(agg.score.overall)}/100 (${agg.score.grade})`
        );
      }
      break;
  }
}
