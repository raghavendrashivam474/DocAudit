import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Parses a .docauditignore file and returns normalized glob patterns.
 *
 * Format: one pattern per line, # for comments, blank lines ignored.
 */
export function loadIgnorePatterns(searchPath: string): readonly string[] {
  const ignorePath = join(searchPath, ".docauditignore");
  if (!existsSync(ignorePath)) return [];

  const lines = readFileSync(ignorePath, "utf-8").split(/\r?\n/);
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

/**
 * Returns true if the given file path matches any ignore pattern.
 *
 * Supports:
 *   - Exact file names:   README.md
 *   - Directory prefix:   docs/internal/
 *   - Wildcard suffix:    *.draft.md
 *   - Path fragments:     CHANGELOG
 */
export function isIgnored(filePath: string, patterns: readonly string[]): boolean {
  const normalized = filePath.replace(/\\/g, "/");

  for (const pattern of patterns) {
    const normPattern = pattern.replace(/\\/g, "/");

    // Wildcard: *.ext
    if (normPattern.startsWith("*.")) {
      const ext = normPattern.slice(1);
      if (normalized.endsWith(ext)) return true;
      continue;
    }

    // Directory: ends with /
    if (normPattern.endsWith("/")) {
      if (normalized.includes("/" + normPattern) || normalized.startsWith(normPattern)) return true;
      continue;
    }

    // Fragment match: pattern appears anywhere in path
    if (normalized.includes(normPattern)) return true;
  }

  return false;
}