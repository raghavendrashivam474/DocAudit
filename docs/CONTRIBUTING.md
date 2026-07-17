# Contributing to DocAudit

Thank you for your interest in contributing!

## Prerequisites

- Node.js >= 20
- pnpm >= 9

## Setup

```bash
git clone https://github.com/your-org/docaudit
cd docaudit
pnpm install
```

## Development

```bash
# Build all packages
pnpm turbo run build

# Run tests
pnpm turbo run test

# Typecheck
pnpm turbo run typecheck

# Run the CLI locally
node apps/cli/dist/main.js analyze ./docs
```

## Project Structure

```
docaudit/
  apps/
    cli/              CLI entry point
  packages/
    shared/           Types and contracts
    config/           Config loading
    engine/           Analysis pipeline
      src/
        parser/       Markdown -> SemanticDocument
        analyzers/    Rule implementations
        scoring/      Health score computation
        recommendations/  Prioritized advice
        discovery/    File discovery + ignore
        pipeline/     Orchestration
        registry/     Analyzer registry
    reporter/         Output formatters
```

## Adding an Analyzer

1. Create `packages/engine/src/analyzers/myAnalyzer.ts`
2. Implement `IAnalyzer` — use `context.document` not raw Markdown
3. Register in `apps/cli/src/commands/analyze.ts`
4. Add tests in `myAnalyzer.test.ts`

```typescript
import type { IAnalyzer, AnalyzerContext, AnalyzerOutput } from "@docaudit/shared";

export class MyAnalyzer implements IAnalyzer {
  readonly name = "my-analyzer";
  readonly version = "0.1.0";

  async analyze(context: AnalyzerContext): Promise<AnalyzerOutput> {
    const { document } = context;
    // document.headings, document.links, document.badges, etc.
    return { issues: [] };
  }
}
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat:     New feature
fix:      Bug fix
docs:     Documentation only
test:     Tests only
refactor: No functional change
chore:    Build, tooling, dependencies
```

## Pull Request Checklist

- [ ] Tests pass: `pnpm turbo run test`
- [ ] Types pass: `pnpm turbo run typecheck`
- [ ] New functionality has tests
- [ ] Commit messages follow convention