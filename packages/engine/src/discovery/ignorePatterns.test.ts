import { describe, it, expect } from "vitest";
import { isIgnored } from "./ignorePatterns.js";

describe("isIgnored", () => {
  it("returns false for empty patterns", () => {
    expect(isIgnored("/docs/readme.md", [])).toBe(false);
  });

  it("matches wildcard extension pattern", () => {
    expect(isIgnored("/docs/file.draft.md", ["*.draft.md"])).toBe(true);
  });

  it("does not match wrong extension", () => {
    expect(isIgnored("/docs/file.md", ["*.draft.md"])).toBe(false);
  });

  it("matches directory prefix pattern", () => {
    expect(isIgnored("/project/internal/notes.md", ["internal/"])).toBe(true);
  });

  it("matches path fragment", () => {
    expect(isIgnored("/docs/CHANGELOG.md", ["CHANGELOG"])).toBe(true);
  });

  it("does not match unrelated path", () => {
    expect(isIgnored("/docs/readme.md", ["CHANGELOG"])).toBe(false);
  });

  it("matches first matching pattern and stops", () => {
    expect(isIgnored("/docs/draft.md", ["*.draft.md", "*.txt"])).toBe(false);
    expect(isIgnored("/docs/notes.draft.md", ["*.draft.md", "*.txt"])).toBe(true);
  });

  it("handles windows-style backslash paths", () => {
    expect(isIgnored("C:\\\\docs\\\\CHANGELOG.md", ["CHANGELOG"])).toBe(true);
  });
});