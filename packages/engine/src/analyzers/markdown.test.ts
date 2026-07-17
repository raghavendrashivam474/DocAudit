import { describe, it, expect } from "vitest";
import {
  splitLines,
  extractHeadings,
  normalizeHeading,
  hasFencedCodeBlock,
} from "./markdown.js";

describe("splitLines", () => {
  it("splits on LF", () => {
    expect(splitLines("a\nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("splits on CRLF", () => {
    expect(splitLines("a\r\nb\r\nc")).toEqual(["a", "b", "c"]);
  });

  it("returns single item for content with no newlines", () => {
    expect(splitLines("hello")).toEqual(["hello"]);
  });
});

describe("normalizeHeading", () => {
  it("lowercases and trims", () => {
    expect(normalizeHeading("  Overview  ")).toBe("overview");
    expect(normalizeHeading("API Reference")).toBe("api reference");
  });
});

describe("hasFencedCodeBlock", () => {
  it("returns true when fenced code block exists", () => {
    expect(hasFencedCodeBlock("before\n```js\ncode\n```\nafter")).toBe(true);
  });

  it("returns false when no fenced code block", () => {
    expect(hasFencedCodeBlock("just plain text")).toBe(false);
  });
});

describe("extractHeadings", () => {
  it("extracts H1 through H3", () => {
    const content = "# Title\n\n## Section\n\n### Sub\n";
    const headings = extractHeadings(content);
    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ level: 1, text: "Title", line: 1 });
    expect(headings[1]).toMatchObject({ level: 2, text: "Section", line: 3 });
    expect(headings[2]).toMatchObject({ level: 3, text: "Sub", line: 5 });
  });

  it("returns empty array when no headings", () => {
    expect(extractHeadings("just text")).toHaveLength(0);
  });

  it("ignores headings inside fenced code blocks", () => {
    const content = "# Real\n\n```\n# Fake\n```\n";
    const headings = extractHeadings(content);
    expect(headings).toHaveLength(1);
    expect(headings[0]).toMatchObject({ text: "Real" });
  });

  it("handles heading with trailing spaces", () => {
    const headings = extractHeadings("## Section  \n");
    expect(headings[0]).toMatchObject({ text: "Section" });
  });
});
