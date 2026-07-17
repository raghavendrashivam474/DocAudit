import { describe, it, expect } from "vitest";
import { runPipeline } from "./pipeline.js";
import { PlaceholderAnalyzer } from "../analyzers/placeholderAnalyzer.js";
import { StructureAnalyzer } from "../analyzers/structureAnalyzer.js";
import { ClarityAnalyzer } from "../analyzers/clarityAnalyzer.js";

describe("runPipeline", () => {
  it("returns a valid AnalysisResult with no analyzers", async () => {
    const result = await runPipeline([], {
      documentName: "test.md",
      content: "# Hello",
    });

    expect(result.documentName).toBe("test.md");
    expect(result.issues).toHaveLength(0);
    expect(result.summary.totalIssues).toBe(0);
    expect(result.summary.score.overall).toBe(100);
    expect(result.summary.score.grade).toBe("A");
    expect(result.id).toBeTruthy();
    expect(result.documentId).toBeTruthy();
    expect(result.analyzedAt).toBeInstanceOf(Date);
    expect(typeof result.duration).toBe("number");
  });

  it("uses provided documentId when given", async () => {
    const result = await runPipeline([], {
      documentId: "my-custom-id",
      documentName: "test.md",
      content: "# Hello",
    });
    expect(result.documentId).toBe("my-custom-id");
  });

  it("aggregates issues from multiple analyzers", async () => {
    const result = await runPipeline(
      [new StructureAnalyzer(), new ClarityAnalyzer()],
      {
        documentName: "test.md",
        content: "TODO: fix this",
      }
    );

    expect(result.issues.length).toBeGreaterThan(0);
    const ruleIds = result.issues.map((i) => i.ruleId);
    expect(ruleIds).toContain("structure.no-headings");
    expect(ruleIds).toContain("clarity.placeholder-text");
  });

  it("produces correct summary counts", async () => {
    const result = await runPipeline([new StructureAnalyzer()], {
      documentName: "test.md",
      content: "just text",
    });

    expect(result.summary.totalIssues).toBe(result.issues.length);
    expect(result.summary.highCount).toBe(
      result.issues.filter((i) => i.severity === "high").length
    );
  });

  it("scores 100 when placeholder analyzer returns no issues", async () => {
    const result = await runPipeline([new PlaceholderAnalyzer()], {
      documentName: "test.md",
      content: "# Title\n\nGood content.",
    });
    expect(result.summary.score.overall).toBe(100);
    expect(result.summary.score.grade).toBe("A");
  });

  it("reduces score when issues are found", async () => {
    const result = await runPipeline([new StructureAnalyzer()], {
      documentName: "test.md",
      content: "no headings here",
    });
    expect(result.summary.score.overall).toBeLessThan(100);
  });
});
