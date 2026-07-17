import { describe, it, expect } from "vitest";
import { CompletenessAnalyzer } from "./completenessAnalyzer.js";
import type { AnalyzerContext } from "@docaudit/shared";

function makeContext(content: string): AnalyzerContext {
  return {
    documentId: "test-id",
    documentName: "test.md",
    content,
  };
}

const FULL_API_DOC = `
# API Reference

## Overview

REST API for managing resources.

## Authentication

Bearer token required.

\`\`\`bash
curl -H "Authorization: Bearer tok" https://api.example.com
\`\`\`

## Endpoints

### GET /items

Returns all items.
`.trim();

describe("CompletenessAnalyzer", () => {
  const analyzer = new CompletenessAnalyzer();

  it("has correct name and version", () => {
    expect(analyzer.name).toBe("completeness");
    expect(analyzer.version).toBe("0.1.0");
  });

  it("reports no issues for a complete API document", async () => {
    const output = await analyzer.analyze(makeContext(FULL_API_DOC));
    expect(output.issues).toHaveLength(0);
  });

  it("skips non-API documents", async () => {
    const content = "# Meeting Notes\n\n## Agenda\n\nDiscuss roadmap.\n";
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues).toHaveLength(0);
  });

  it("reports missing-required-section for API doc missing authentication", async () => {
    const content = `
# API

## Overview

Some overview.

\`\`\`bash
GET /items
\`\`\`

## Endpoints

### GET /items
`.trim();
    const output = await analyzer.analyze(makeContext(content));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("completeness.missing-required-section");
    const titles = output.issues.map((i) => i.title);
    expect(titles.some((t) => t.includes("authentication"))).toBe(true);
  });

  it("reports missing-example when API doc has no code block", async () => {
    const content = `
# API

## Overview

Overview text.

## Authentication

Auth text.

## Endpoints

GET /users
`.trim();
    const output = await analyzer.analyze(makeContext(content));
    const ruleIds = output.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("completeness.missing-example");
  });
});
