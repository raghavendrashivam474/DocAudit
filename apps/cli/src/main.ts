import { analyzeCommand } from "./commands/analyze.js";

type Severity = "critical" | "high" | "medium" | "low" | "info";
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

function isSeverity(value: string): value is Severity {
  return (SEVERITIES as string[]).includes(value);
}

function printUsage(): void {
  console.log(`
  Usage: docaudit <command> [options]

  Commands:
    analyze <file|dir>   Analyse a document or directory

  Options:
    --format <type>        Output format: console | json | markdown  (default: console)
    --min-severity <level> Minimum severity to report: critical | high | medium | low | info
    --help                 Show this help message
    --version              Show version
  `);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log("docaudit 0.1.0");
    process.exit(0);
  }

  const command = args[0];

  if (command !== "analyze") {
    console.error(`Unknown command: ${command}`);
    printUsage();
    process.exit(1);
  }

  const targetPath = args[1];
  if (!targetPath) {
    console.error("error: analyze command requires a file or directory path");
    printUsage();
    process.exit(1);
  }

  // Parse --format
  let format: "console" | "json" | "markdown" | undefined;
  const formatIndex = args.indexOf("--format");
  if (formatIndex !== -1) {
    const value = args[formatIndex + 1];
    if (value === "console" || value === "json" || value === "markdown") {
      format = value;
    } else {
      console.error(`Unknown format: ${value ?? "(none)"}`);
      process.exit(1);
    }
  }

  // Parse --min-severity
  let minSeverity: Severity | undefined;
  const sevIndex = args.indexOf("--min-severity");
  if (sevIndex !== -1) {
    const value = args[sevIndex + 1];
    if (value !== undefined && isSeverity(value)) {
      minSeverity = value;
    } else {
      console.error(
        `Unknown severity: ${value ?? "(none)"}. Must be one of: ${SEVERITIES.join(", ")}`
      );
      process.exit(1);
    }
  }

  await analyzeCommand({ targetPath, format, minSeverity });
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
