import type { IAnalyzer, AnalyzerContext, AnalyzerOutput } from "@docaudit/shared";

export class PlaceholderAnalyzer implements IAnalyzer {
  readonly name = "placeholder";
  readonly version = "0.1.0";

  async analyze(_context: AnalyzerContext): Promise<AnalyzerOutput> {
    return { issues: [] };
  }
}
