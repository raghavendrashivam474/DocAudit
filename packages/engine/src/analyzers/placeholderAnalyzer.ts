import type { IAnalyzer, AnalyzerContext, AnalyzerOutput } from "@docaudit/shared";

/**
 * A no-op analyzer used during development and testing.
 *
 * Returns zero issues — confirms the pipeline executes
 * without requiring any real analysis logic.
 */
export class PlaceholderAnalyzer implements IAnalyzer {
  readonly name = "placeholder";
  readonly version = "0.1.0";

  async analyze(_context: AnalyzerContext): Promise<AnalyzerOutput> {
    return { issues: [] };
  }
}
