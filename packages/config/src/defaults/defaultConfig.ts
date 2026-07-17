import type { DocAuditConfig } from "@docaudit/shared";

/**
 * Defaults applied when no project configuration file is found.
 */
export const defaultConfig: DocAuditConfig = {
  targetPath: process.cwd(),
  minSeverity: "info",
  verbose: false,
  analyzerOptions: {},
} as const;
