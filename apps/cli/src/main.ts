#!/usr/bin/env node

import { analyzeCommand } from "./commands/analyze.js";

// ─── Minimal Arg Parsing ──────────────────────────────────────────────────────
// A full CLI framework (e.g. commander, yargs) will be added in a later sprint.
// For now we parse just enough to be useful.

function printUsage(): void {
  console.log(`
  Usage: docaudit <command> [options]

  Commands:
    analyze <file>   Analyse a document and report issues

  Options:
    --format <type>  Output format: console | json | markdown (default: console)
    --help           Show this help message
    --version        Show version
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
    console.error("error: analyze command requires a file path");
    printUsage();
    process.exit(1);
  }

  // Parse --format flag
  let format: "console" | "json" | "markdown" | undefined;
  const formatIndex = args.indexOf("--format");
  if (formatIndex !== -1 && args[formatIndex + 1]) {
    const value = args[formatIndex + 1];
    if (value === "console" || value === "json" || value === "markdown") {
      format = value;
    } else {
      console.error(`Unknown format: ${value}`);
      process.exit(1);
    }
  }

  await analyzeCommand({ targetPath, format });
}

main().catch((err: unknown) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
