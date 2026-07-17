import { parseMarkdown } from "../parser/markdownParser.js";
import type { AnalyzerContext } from "@docaudit/shared";

export function makeContext(content: string): AnalyzerContext {
  return {
    documentId: "test-id",
    documentName: "test.md",
    content,
    document: parseMarkdown(content),
  };
}
