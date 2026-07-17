# DocAudit Architecture

## Data Flow

```
Input (file or directory)
  |
  v
File Discovery (discoverFiles + .docauditignore)
  |
  v
Markdown Parser (markdownParser.ts)
  |
  v
SemanticDocument
  |
  +---> StructureAnalyzer
  +---> CompletenessAnalyzer
  +---> ClarityAnalyzer
  +---> [future analyzers]
  |
  v
AnalysisIssue[]
  |
  +---> computeHealthScore  -> CategoryScore[] + overall
  +---> generateRecommendations -> Recommendation[]
  |
  v
AnalysisResult
  |
  +---> console (renderToConsoleV2)
  +---> JSON   (formatJson)
  +---> Markdown (formatMarkdown)
  +---> file   (--output flag)
```

## Package Responsibilities

| Package | Responsibility |
|---------|---------------|
| `@docaudit/shared` | All TypeScript types and interfaces |
| `@docaudit/config` | Config file loading and validation |
| `@docaudit/engine` | Parser, analyzers, scoring, pipeline |
| `@docaudit/reporter` | Output formatters and renderers |
| `@docaudit/cli` | CLI entry point and argument parsing |

## SemanticDocument

The central data model. Every analyzer receives a `SemanticDocument`
instead of raw Markdown. This means:

- Markdown is parsed exactly once per document
- Analyzers are pure functions over structured data
- Adding a new analyzer requires zero parsing code

```typescript
interface SemanticDocument {
  title:      string | undefined
  headings:   DocHeading[]
  sections:   DocSection[]
  codeBlocks: DocCodeBlock[]
  links:      DocLink[]
  images:     DocImage[]
  badges:     DocBadge[]
  lists:      DocList[]
  tables:     DocTable[]
  wordCount:  number
  lineCount:  number
}
```

## Scoring

Health score is a weighted average across 6 categories:

| Category | Weight |
|----------|--------|
| Completeness | 30% |
| Structure | 25% |
| Clarity | 20% |
| Accuracy | 10% |
| Consistency | 10% |
| Compliance | 5% |

Severity penalties per issue:

| Severity | Penalty |
|----------|---------|
| Critical | -20 pts |
| High | -10 pts |
| Medium | -5 pts |
| Low | -2 pts |
| Info | 0 pts |