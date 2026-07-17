import type { IAnalyzer, AnalyzerContext, AnalyzerOutput } from "@docaudit/shared";

export class PlaceholderAnalyzer implements IAnalyzer {
  readonly name = "placeholder";
  readonly version = "0.1.0";

  analyze(_context: AnalyzerContext): Promise<AnalyzerOutput> {
    return Promise.resolve({ issues: [] });
  }
}
