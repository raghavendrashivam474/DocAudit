import { describe, it, expect } from "vitest";
import { CompletenessAnalyzer } from "./completenessAnalyzer.js";
import { makeContext } from "./testHelper.js";

const FULL_API_DOC = `# API Reference

## Overview

REST API for managing resources.

## Authentication

Bearer token required.

\`\`\`bash
curl -H "Authorization: Bearer tok" https://api.example.com
\`\`\`

## Endpoints

### GET /items

Returns all items.`.trim();

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
    const output = await analyzer.analyze(
      makeContext("# Meeting Notes\n\n## Agenda\n\nDiscuss roadmap.\n")
    );
    expect(output.issues).toHaveLength(0);
  });

  it("reports missing-required-section for API doc missing authentication", async () => {
    const content = `# API\n\n## Overview\n\nSome overview.\n\nGET /items\n\n## Endpoints\n\n### GET /items`;
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues.map((i) => i.ruleId)).toContain(
      "completeness.missing-required-section"
    );
    expect(output.issues.some((i) => i.title.includes("authentication"))).toBe(true);
  });

  it("reports missing-example when API doc has no code block", async () => {
    const content = `# API\n\n## Overview\n\nText.\n\n## Authentication\n\nAuth.\n\n## Endpoints\n\nGET /users`;
    const output = await analyzer.analyze(makeContext(content));
    expect(output.issues.map((i) => i.ruleId)).toContain(
      "completeness.missing-example"
    );
  });
});
