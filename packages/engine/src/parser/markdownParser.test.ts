import { describe, it, expect } from "vitest";
import { parseMarkdown } from "./markdownParser.js";

describe("parseMarkdown", () => {
  it("extracts title from first H1", () => {
    const doc = parseMarkdown("# My Project\n\n## Overview\n");
    expect(doc.title).toBe("My Project");
  });

  it("sets title undefined when no headings", () => {
    const doc = parseMarkdown("just plain text");
    expect(doc.title).toBeUndefined();
  });

  it("extracts description as first paragraph after title", () => {
    const doc = parseMarkdown("# Title\n\nThis is the description.\n\n## Section\n");
    expect(doc.description).toBe("This is the description.");
  });

  it("counts lines correctly", () => {
    const doc = parseMarkdown("line 1\nline 2\nline 3");
    expect(doc.lineCount).toBe(3);
  });

  it("extracts headings with correct levels and lines", () => {
    const doc = parseMarkdown("# H1\n\n## H2\n\n### H3\n");
    expect(doc.headings).toHaveLength(3);
    expect(doc.headings[0]).toMatchObject({ level: 1, text: "H1", line: 1 });
    expect(doc.headings[1]).toMatchObject({ level: 2, text: "H2", line: 3 });
    expect(doc.headings[2]).toMatchObject({ level: 3, text: "H3", line: 5 });
  });

  it("extracts code blocks with language", () => {
    const doc = parseMarkdown("# Title\n\n```bash\ncurl example\n```\n");
    expect(doc.codeBlocks).toHaveLength(1);
    expect(doc.codeBlocks[0]?.language).toBe("bash");
    expect(doc.codeBlocks[0]?.content).toBe("curl example");
  });

  it("extracts code blocks without language", () => {
    const doc = parseMarkdown("```\ncode here\n```\n");
    expect(doc.codeBlocks[0]?.language).toBeUndefined();
  });

  it("extracts inline links", () => {
    const doc = parseMarkdown("See [docs](https://example.com) for more.\n");
    expect(doc.links).toHaveLength(1);
    expect(doc.links[0]).toMatchObject({
      text: "docs",
      url: "https://example.com",
      isExternal: true,
    });
  });

  it("extracts images and detects badges", () => {
    const doc = parseMarkdown(
      "![CI](https://img.shields.io/badge/CI-passing-green)\n"
    );
    expect(doc.images).toHaveLength(1);
    expect(doc.images[0]?.isBadge).toBe(true);
    expect(doc.badges).toHaveLength(1);
  });

  it("extracts unordered lists", () => {
    const doc = parseMarkdown("- item one\n- item two\n- item three\n");
    expect(doc.lists).toHaveLength(1);
    expect(doc.lists[0]?.kind).toBe("unordered");
    expect(doc.lists[0]?.items).toHaveLength(3);
  });

  it("extracts ordered lists", () => {
    const doc = parseMarkdown("1. first\n2. second\n");
    expect(doc.lists).toHaveLength(1);
    expect(doc.lists[0]?.kind).toBe("ordered");
    expect(doc.lists[0]?.items).toHaveLength(2);
  });

  it("extracts tables", () => {
    const doc = parseMarkdown(
      "| Name | Value |\n|------|-------|\n| foo  | bar   |\n"
    );
    expect(doc.tables).toHaveLength(1);
    expect(doc.tables[0]?.headers).toEqual(["Name", "Value"]);
    expect(doc.tables[0]?.rows).toHaveLength(1);
  });

  it("builds sections hierarchy", () => {
    const doc = parseMarkdown("# Title\n\n## Section A\n\n### Sub A\n\n## Section B\n");
    expect(doc.sections).toHaveLength(1);
    expect(doc.sections[0]?.heading.text).toBe("Title");
    expect(doc.sections[0]?.children).toHaveLength(2);
  });

  it("counts total words across paragraphs", () => {
    const doc = parseMarkdown("# Title\n\nHello world foo bar.\n");
    expect(doc.wordCount).toBeGreaterThan(0);
  });
});
