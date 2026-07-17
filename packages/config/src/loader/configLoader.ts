import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import type { DocAuditConfig } from "@docaudit/shared";
import { defaultConfig } from "../defaults/defaultConfig.js";
import { validateConfig } from "../validation/validateConfig.js";

export type ConfigLoadResult =
  | { readonly success: true; readonly config: DocAuditConfig }
  | { readonly success: false; readonly errors: readonly string[] };

// ─── Type guards ────────────────────────────────────────────────────────────

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ─── Loader ─────────────────────────────────────────────────────────────────

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

    if (!isRecord(imported)) {
      return {
        success: false,
        errors: ["docaudit.config.ts must export an object"],
      };
    }

    // "default" access is safe because imported is Record<string, unknown>
    const defaultExport: unknown = imported["default"];
    const rawExport: unknown = defaultExport ?? {};

    if (!isRecord(rawExport)) {
      return {
        success: false,
        errors: ["docaudit.config.ts default export must be an object"],
      };
    }

    // Both defaultConfig and rawExport are Record-shaped — safe spread
    const defaultAsRecord: Record<string, unknown> = { ...defaultConfig };
    const merged: Record<string, unknown> = {
      ...defaultAsRecord,
      ...rawExport,
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