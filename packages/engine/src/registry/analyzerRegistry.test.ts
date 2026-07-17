import { describe, it, expect, beforeEach } from "vitest";
import { AnalyzerRegistryImpl } from "./analyzerRegistry.js";
import { PlaceholderAnalyzer } from "../analyzers/placeholderAnalyzer.js";
import { StructureAnalyzer } from "../analyzers/structureAnalyzer.js";

describe("AnalyzerRegistryImpl", () => {
  let registry: AnalyzerRegistryImpl;

  beforeEach(() => {
    registry = new AnalyzerRegistryImpl();
  });

  it("starts empty", () => {
    expect(registry.size).toBe(0);
    expect(registry.getAll()).toHaveLength(0);
  });

  it("registers an analyzer", () => {
    registry.register(new PlaceholderAnalyzer());
    expect(registry.size).toBe(1);
  });

  it("retrieves analyzer by name", () => {
    registry.register(new PlaceholderAnalyzer());
    const analyzer = registry.get("placeholder");
    expect(analyzer).toBeDefined();
    expect(analyzer?.name).toBe("placeholder");
  });

  it("returns undefined for unknown name", () => {
    expect(registry.get("unknown")).toBeUndefined();
  });

  it("returns all registered analyzers", () => {
    registry.register(new PlaceholderAnalyzer());
    registry.register(new StructureAnalyzer());
    expect(registry.getAll()).toHaveLength(2);
  });

  it("throws when registering duplicate name", () => {
    registry.register(new PlaceholderAnalyzer());
    expect(() => registry.register(new PlaceholderAnalyzer())).toThrow(
      'Analyzer "placeholder" is already registered.'
    );
  });

  it("clears all analyzers", () => {
    registry.register(new PlaceholderAnalyzer());
    registry.clear();
    expect(registry.size).toBe(0);
  });

  it("preserves insertion order", () => {
    registry.register(new PlaceholderAnalyzer());
    registry.register(new StructureAnalyzer());
    const names = registry.getAll().map((a) => a.name);
    expect(names).toEqual(["placeholder", "structure"]);
  });
});
