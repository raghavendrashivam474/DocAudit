import { describe, it, expect } from "vitest";
import { runPipeline } from "./pipeline.js";
import { PlaceholderAnalyzer } from "../analyzers/placeholderAnalyzer.js";
import { StructureAnalyzer } from "../analyzers/structureAnalyzer.js";
import { ClarityAnalyzer } from "../analyzers/clarityAnalyzer.js";
import type { IAnalyzer, AnalyzerContext, AnalyzerOutput } from "@docaudit/shared";

describe("runPipeline", () => {
  it("returns valid AnalysisResult with no analyzers", async () => {
    const result = await runPipeline([], { documentName: "test.md", content: "# Hello" });
    expect(result.documentName).toBe("test.md");
    expect(result.issues).toHaveLength(0);
    expect(result.summary.score.overall).toBe(100);
    expect(result.summary.score.grade).toBe("A");
    expect(result.id).toBeTruthy();
    expect(result.documentId).toBeTruthy();
    expect(result.analyzedAt).toBeInstanceOf(Date);
    expect(typeof result.duration).toBe("number");
  });

  it("uses provided documentId when given", async () => {
    const result = await runPipeline([], {
      documentId: "my-id",
      documentName: "test.md",
      content: "# Hello",
    });
    expect(result.documentId).toBe("my-id");
  });

  it("aggregates issues from multiple analyzers", async () => {
    const result = await runPipeline(
      [new StructureAnalyzer(), new ClarityAnalyzer()],
      { documentName: "test.md", content: "TODO: fix this" }
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

  it("scores 100 with placeholder analyzer", async () => {
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

  it("passes SemanticDocument to analyzer context", async () => {
    let capturedDoc: unknown = undefined;

    const spyAnalyzer: IAnalyzer = {
      name: "spy",
      version: "0.0.1",
      analyze: async (ctx: AnalyzerContext): Promise<AnalyzerOutput> => {
        capturedDoc = ctx.document;
        return { issues: [] };
      },
    };

    await runPipeline([spyAnalyzer], {
      documentName: "test.md",
      content: "# Title\n\n## Section\n",
    });

    expect(capturedDoc).toBeDefined();
    expect((capturedDoc as { title?: string }).title).toBe("Title");
  });
});