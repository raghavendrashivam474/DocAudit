import type { IAnalyzer } from "@docaudit/shared";

/**
 * In-memory registry of analyzer plugins.
 *
 * Analyzers register themselves by name; the pipeline iterates
 * the registry to execute each analyzer against a document.
 */
export class AnalyzerRegistryImpl {
  private readonly analyzers = new Map<string, IAnalyzer>();

  /** Register an analyzer. Throws if the name is already taken. */
  register(analyzer: IAnalyzer): void {
    if (this.analyzers.has(analyzer.name)) {
      throw new Error(
        `Analyzer "${analyzer.name}" is already registered.`
      );
    }
    this.analyzers.set(analyzer.name, analyzer);
  }

  /** Retrieve a single analyzer by name. */
  get(name: string): IAnalyzer | undefined {
    return this.analyzers.get(name);
  }

  /** Return all registered analyzers in insertion order. */
  getAll(): IAnalyzer[] {
    return [...this.analyzers.values()];
  }

  /** Number of registered analyzers. */
  get size(): number {
    return this.analyzers.size;
  }

  /** Remove all registered analyzers (useful for testing). */
  clear(): void {
    this.analyzers.clear();
  }
}
