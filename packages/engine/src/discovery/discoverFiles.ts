import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".md", ".mdx", ".txt", ".rst"]);

export interface DiscoveryOptions {
  readonly extensions?: readonly string[] | undefined;
  readonly recursive?: boolean | undefined;
  readonly maxDepth?: number | undefined;
}

/**
 * Discovers document files in a directory.
 *
 * Returns absolute paths to all matching files.
 */
export function discoverFiles(
  dirPath: string,
  options?: DiscoveryOptions
): string[] {
  const extensions = options?.extensions
    ? new Set(options.extensions)
    : SUPPORTED_EXTENSIONS;
  const recursive = options?.recursive ?? true;
  const maxDepth = options?.maxDepth ?? 10;

  const results: string[] = [];

  function walk(currentPath: string, depth: number): void {
    if (depth > maxDepth) {
      return;
    }

    let entries: string[];
    try {
      entries = readdirSync(currentPath);
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = join(currentPath, entry);

      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isFile() && extensions.has(extname(entry).toLowerCase())) {
        results.push(fullPath);
      } else if (stats.isDirectory() && recursive) {
        if (entry === "node_modules" || entry === ".git" || entry === "dist") {
          continue;
        }
        walk(fullPath, depth + 1);
      }
    }
  }

  walk(dirPath, 0);
  return results.sort();
}
