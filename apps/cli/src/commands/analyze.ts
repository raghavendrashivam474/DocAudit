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
import { formatJson, formatMarkdown, renderToConsoleV2 } from "@docaudit/reporter";
import type { AnalysisResult, Severity } from "@docaudit/shared";

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4, high: 3, medium: 2, low: 1, info: 0,
};

function filterBySeverity(results: AnalysisResult[], minSeverity: Severity): AnalysisResult[] {
  const minRank = SEVERITY_RANK[minSeverity];
  return results.map((result) => {
    const filtered = result.issues.filter((i) => SEVERITY_RANK[i.severity] >= minRank);
    if (filtered.length === result.issues.length) return result;
    return {
      ...result,
      issues: filtered,
      summary: {
        ...result.summary,
        totalIssues: filtered.length,
        criticalCount: filtered.filter((i) => i.severity === "critical").length,
        highCount: filtered.filter((i) => i.severity === "high").length,
        mediumCount: filtered.filter((i) => i.severity === "medium").length,
        lowCount: filtered.filter((i) => i.severity === "low").length,
        infoCount: filtered.filter((i) => i.severity === "info").length,
        topIssues: filtered.filter((i) => i.severity === "critical" || i.severity === "high").slice(0, 5),
      },
    };
  });
}

function fail(message: string): never {
  console.error("\x1b[31merror:\x1b[0m " + message);
  process.exit(1);
}

function buildRegistry(): AnalyzerRegistryImpl {
  const registry = new AnalyzerRegistryImpl();
  registry.register(new StructureAnalyzer());
  registry.register(new CompletenessAnalyzer());
  registry.register(new ClarityAnalyzer());
  return registry;
}

async function analyzeFile(filePath: string, registry: AnalyzerRegistryImpl): Promise<AnalysisResult> {
  const content = readFileSync(filePath, "utf-8");
  return runPipeline(registry.getAll(), { documentName: basename(filePath), content });
}

export interface AnalyzeOptions {
  readonly targetPath: string;
  readonly format?: "console" | "json" | "markdown" | undefined;
  readonly minSeverity?: Severity | undefined;
}

export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
  const targetPath = resolve(options.targetPath);
  if (!existsSync(targetPath)) fail("Path not found: " + targetPath);

  const configResult = await loadConfig(process.cwd());
  if (!configResult.success) fail("Configuration errors:\n  " + configResult.errors.join("\n  "));

  const registry = buildRegistry();

  let filePaths: string[];
  const stats = statSync(targetPath);

  if (stats.isDirectory()) {
    filePaths = discoverFiles(targetPath);
    if (filePaths.length === 0) fail("No document files found in: " + targetPath);
    console.log("\x1b[36mFound " + String(filePaths.length) + " document(s) in " + targetPath + "\x1b[0m\n");
  } else {
    filePaths = [targetPath];
  }

  let results: AnalysisResult[] = [];
  for (const fp of filePaths) {
    results.push(await analyzeFile(fp, registry));
  }

  if (options.minSeverity !== undefined) {
    results = filterBySeverity(results, options.minSeverity);
    console.log("\x1b[33mFiltering: " + options.minSeverity + "+ severity only\x1b[0m\n");
  }

  const format = options.format ?? "console";
  switch (format) {
    case "json": console.log(formatJson(results)); break;
    case "markdown": console.log(formatMarkdown(results)); break;
    case "console": default: renderToConsoleV2(results); break;
  }
}