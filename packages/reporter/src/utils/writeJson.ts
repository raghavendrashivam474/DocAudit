import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve }         from "node:path";

/**
 * Writes JSON content to disk.
 *
 * Creates intermediate directories if they do not exist.
 * Overwrites any existing file at the target path.
 * Returns the resolved absolute path that was written.
 */
export function writeJson(content: string, outputPath: string): string {
  const resolved  = resolve(outputPath);
  const directory = dirname(resolved);

  mkdirSync(directory, { recursive: true });
  writeFileSync(resolved, content, { encoding: "utf-8", flag: "w" });

  return resolved;
}
