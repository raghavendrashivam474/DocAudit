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
import type { AnalysisResult, Severity } from "@docaudit/shared";

// ─── Severity ordering ────────────────────────────────────────────────────────

const SEVERITY_RANK: Record<Severity, number> = {
  critical: 4,
  high:     3,
  medium:   2,
  low:      1,
  info:     0,
};

function filterBySeverity(
  results: AnalysisResult[],
  minSeverity: Severity
): AnalysisResult[] {
  const minRank = SEVERITY_RANK[minSeverity];

  return results.map((result) => {
    const filteredIssues = result.issues.filter(
      (issue) => SEVERITY_RANK[issue.severity] >= minRank
    );

    if (filteredIssues.length === result.issues.length) {
      return result;
    }

    // Rebuild summary for filtered issues
    const summary = {
      ...result.summary,
      totalIssues:   filteredIssues.length,
      criticalCount: filteredIssues.filter((i) => i.severity === "critical").length,
      highCount:     filteredIssues.filter((i) => i.severity === "high").length,
      mediumCount:   filteredIssues.filter((i) => i.severity === "medium").length,
      lowCount:      filteredIssues.filter((i) => i.severity === "low").length,
      infoCount:     filteredIssues.filter((i) => i.severity === "info").length,
      topIssues:     filteredIssues
        .filter((i) => i.severity === "critical" || i.severity === "high")
        .slice(0, 5),
    };

    return { ...result, issues: filteredIssues, summary };
  });
}

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
  return runPipeline(registry.getAll(), {
    documentName: basename(filePath),
    content,
  });
}

// ─── Command ──────────────────────────────────────────────────────────────────

export interface AnalyzeOptions {
  readonly targetPath: string;
  readonly format?: "console" | "json" | "markdown" | undefined;
  readonly minSeverity?: Severity | undefined;
}

export async function analyzeCommand(options: AnalyzeOptions): Promise<void> {
  const targetPath = resolve(options.targetPath);

  if (!existsSync(targetPath)) {
    fail(`Path not found: ${targetPath}`);
  }

  const configResult = await loadConfig(process.cwd());
  if (!configResult.success) {
    fail(`Configuration errors:\n  ${configResult.errors.join("\n  ")}`);
  }

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

  // ── Analyze ─────────────────────────────────────────────────────────────
  let results: AnalysisResult[] = [];
  for (const filePath of filePaths) {
    results.push(await analyzeFile(filePath, registry));
  }

  // ── Apply severity filter ───────────────────────────────────────────────
  if (options.minSeverity !== undefined) {
    results = filterBySeverity(results, options.minSeverity);
    console.log(
      `\x1b[33mFiltering: showing ${options.minSeverity}+ severity only\x1b[0m\n`
    );
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
