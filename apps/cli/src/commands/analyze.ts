import { readFileSync, existsSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, basename, dirname } from "node:path";
import { loadConfig } from "@docaudit/config";
import {
  runPipeline,
  AnalyzerRegistryImpl,
  StructureAnalyzer,
  CompletenessAnalyzer,
  ClarityAnalyzer,
  discoverFiles,
  loadIgnorePatterns,
} from "@docaudit/engine";
import { formatJson, formatMarkdown, renderToConsoleV2 } from "@docaudit/reporter";
import type { AnalysisResult, Severity } from "@docaudit/shared";

// Severity rank for comparison
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
        totalIssues:   filtered.length,
        criticalCount: filtered.filter((i) => i.severity === "critical").length,
        highCount:     filtered.filter((i) => i.severity === "high").length,
        mediumCount:   filtered.filter((i) => i.severity === "medium").length,
        lowCount:      filtered.filter((i) => i.severity === "low").length,
        infoCount:     filtered.filter((i) => i.severity === "info").length,
        topIssues:     filtered
          .filter((i) => i.severity === "critical" || i.severity === "high")
          .slice(0, 5),
      },
    };
  });
}

// Check if results contain issues at or above the fail threshold
function shouldFail(results: AnalysisResult[], failOn: Severity): boolean {
  const threshold = SEVERITY_RANK[failOn];
  return results.some((r) =>
    r.issues.some((i) => SEVERITY_RANK[i.severity] >= threshold)
  );
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

export interface AnalyzeOptions {
  readonly targetPath: string;
  readonly format?: "console" | "json" | "markdown" | undefined;
  readonly minSeverity?: Severity | undefined;
  readonly failOn?: Severity | undefined;
  readonly outputPath?: string | undefined;
}

/**
 * Returns exit code: 0 = success, 1 = issues found at failOn threshold.
 */
export async function analyzeCommand(options: AnalyzeOptions): Promise<number> {
  const targetPath = resolve(options.targetPath);
  if (!existsSync(targetPath)) fail("Path not found: " + targetPath);

  const configResult = await loadConfig(process.cwd());
  if (!configResult.success) {
    fail("Configuration errors:\n  " + configResult.errors.join("\n  "));
  }

  const registry = buildRegistry();

  // Load ignore patterns from .docauditignore
  const ignorePatterns = loadIgnorePatterns(process.cwd());
  if (ignorePatterns.length > 0) {
    console.log("\x1b[2mIgnoring " + String(ignorePatterns.length) + " pattern(s) from .docauditignore\x1b[0m");
  }

  // Discover files
  let filePaths: string[];
  const stats = statSync(targetPath);

  if (stats.isDirectory()) {
    filePaths = discoverFiles(targetPath, { ignorePatterns });
    if (filePaths.length === 0) fail("No document files found in: " + targetPath);
    console.log("\x1b[36mFound " + String(filePaths.length) + " document(s) in " + targetPath + "\x1b[0m\n");
  } else {
    filePaths = [targetPath];
  }

  // Analyze
  let results: AnalysisResult[] = [];
  for (const fp of filePaths) {
    results.push(await analyzeFile(fp, registry));
  }

  // Apply severity filter
  if (options.minSeverity !== undefined) {
    results = filterBySeverity(results, options.minSeverity);
    console.log("\x1b[33mFiltering: " + options.minSeverity + "+ severity only\x1b[0m\n");
  }

  // Render output
  const format = options.format ?? "console";
  let output = "";

  if (options.outputPath !== undefined) {
    // Write to file — always use json or markdown for file output
    const fileFormat = format === "console" ? "markdown" : format;
    output = fileFormat === "json" ? formatJson(results) : formatMarkdown(results);
    const outPath = resolve(options.outputPath);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, output, "utf-8");
    console.log("\x1b[32mReport written to: " + outPath + "\x1b[0m");
    // Also render to console
    renderToConsoleV2(results);
  } else {
    switch (format) {
      case "json":     console.log(formatJson(results)); break;
      case "markdown": console.log(formatMarkdown(results)); break;
      default:         renderToConsoleV2(results); break;
    }
  }

  // Exit code
  if (options.failOn !== undefined && shouldFail(results, options.failOn)) {
    console.error("\x1b[31mFailed: issues found at " + options.failOn + " severity or above.\x1b[0m");
    return 1;
  }

  return 0;
}