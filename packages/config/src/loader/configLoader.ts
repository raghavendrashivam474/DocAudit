import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type { DocAuditConfig } from "@docaudit/shared";
import { defaultConfig } from "../defaults/defaultConfig.js";
import { validateConfig } from "../validation/validateConfig.js";

export type ConfigLoadResult =
  | { readonly success: true; readonly config: DocAuditConfig }
  | { readonly success: false; readonly errors: readonly string[] };

/**
 * Locates and loads a project configuration file.
 *
 * Resolution order:
 *   1. docaudit.config.ts  (relative to searchPath)
 *
 * Falls back to defaultConfig when no file is found.
 */
export async function loadConfig(
  searchPath: string = process.cwd()
): Promise<ConfigLoadResult> {
  const configFilePath = join(searchPath, "docaudit.config.ts");

  if (!existsSync(configFilePath)) {
    return { success: true, config: defaultConfig };
  }

  try {
    const fileUrl = pathToFileURL(configFilePath).href;
    const mod = (await import(fileUrl)) as { default?: unknown };
    const raw = mod.default ?? {};
    const merged = { ...defaultConfig, ...(raw as object) };
    const result = validateConfig(merged);

    if (!result.valid) {
      return {
        success: false,
        errors: result.errors.map((e) => `[${e.field}] ${e.message}`),
      };
    }

    return { success: true, config: result.config };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return {
      success: false,
      errors: [`Failed to load docaudit.config.ts: ${message}`],
    };
  }
}
