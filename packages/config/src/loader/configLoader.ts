import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type { DocAuditConfig } from "@docaudit/shared";
import { defaultConfig } from "../defaults/defaultConfig.js";
import { validateConfig } from "../validation/validateConfig.js";

export type ConfigLoadResult =
  | { readonly success: true; readonly config: DocAuditConfig }
  | { readonly success: false; readonly errors: readonly string[] };

// Shape of a config module: default export must be an object
interface ConfigModule {
  readonly default?: unknown;
}

/**
 * Type guard for the imported module shape.
 */
function isConfigModule(value: unknown): value is ConfigModule {
  return typeof value === "object" && value !== null;
}

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
    const imported: unknown = await import(fileUrl);

    if (!isConfigModule(imported)) {
      return {
        success: false,
        errors: ["docaudit.config.ts must export an object as default"],
      };
    }

    const rawExport: unknown = imported.default ?? {};
    if (typeof rawExport !== "object" || rawExport === null) {
      return {
        success: false,
        errors: ["docaudit.config.ts default export must be an object"],
      };
    }

    const merged: Record<string, unknown> = {
      ...defaultConfig,
      ...(rawExport as Record<string, unknown>),
    };

    const result = validateConfig(merged);

    if (!result.valid) {
      return {
        success: false,
        errors: result.errors.map((e) => `[${e.field}] ${e.message}`),
      };
    }

    return { success: true, config: result.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error.";
    return {
      success: false,
      errors: [`Failed to load docaudit.config.ts: ${message}`],
    };
  }
}