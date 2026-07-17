import { analyzeCommand } from "./commands/analyze.js";

type Severity = "critical" | "high" | "medium" | "low" | "info";
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low", "info"];

function isSeverity(value: string): value is Severity {
  return (SEVERITIES as string[]).includes(value);
}

function printUsage(): void {
  console.log("");
  console.log("  Usage: docaudit <command> [options]");
  console.log("");
  console.log("  Commands:");
  console.log("    analyze <file|dir>   Analyse a document or directory");
  console.log("");
  console.log("  Options:");
  console.log("    --format <type>        Output format: console | json | markdown  (default: console)");
  console.log("    --min-severity <level> Minimum severity to report: critical | high | medium | low | info");
  console.log("    --fail-on <level>      Exit with code 1 if issues at this level or above are found");
  console.log("    --output <path>        Write report to file instead of stdout");
  console.log("    --help                 Show this help message");
  console.log("    --version              Show version");
  console.log("");
}

function getArg(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
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
    console.error("Unknown command: " + String(command));
    printUsage();
    process.exit(1);
  }

  const targetPath = args[1];
  if (targetPath === undefined || targetPath.startsWith("--")) {
    console.error("error: analyze requires a file or directory path");
    printUsage();
    process.exit(1);
  }

  // --format
  let format: "console" | "json" | "markdown" | undefined;
  const formatVal = getArg(args, "--format");
  if (formatVal !== undefined) {
    if (formatVal === "console" || formatVal === "json" || formatVal === "markdown") {
      format = formatVal;
    } else {
      console.error("Unknown format: " + formatVal);
      process.exit(1);
    }
  }

  // --min-severity
  let minSeverity: Severity | undefined;
  const minSevVal = getArg(args, "--min-severity");
  if (minSevVal !== undefined) {
    if (isSeverity(minSevVal)) {
      minSeverity = minSevVal;
    } else {
      console.error("Unknown severity: " + minSevVal + ". Must be one of: " + SEVERITIES.join(", "));
      process.exit(1);
    }
  }

  // --fail-on
  let failOn: Severity | undefined;
  const failOnVal = getArg(args, "--fail-on");
  if (failOnVal !== undefined) {
    if (isSeverity(failOnVal)) {
      failOn = failOnVal;
    } else {
      console.error("Unknown severity for --fail-on: " + failOnVal);
      process.exit(1);
    }
  }

  // --output
  const outputPath = getArg(args, "--output");

  const exitCode = await analyzeCommand({
    targetPath,
    format,
    minSeverity,
    failOn,
    outputPath,
  });

  process.exit(exitCode);
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});