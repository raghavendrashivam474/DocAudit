# DocAudit

Documentation quality analysis platform.

## Overview

DocAudit audits project documentation such as README, CONTRIBUTING, CHANGELOG,
SECURITY, and API documentation — helping teams maintain high-quality docs.

## Workspace Structure

```text
apps/
  cli/              # Command-line interface
packages/
  engine/           # Analysis orchestration engine
  config/           # Configuration loading and validation
  reporter/         # Report generation
  shared/           # Shared domain models and types
docs/               # Project documentation
tests/              # Integration and end-to-end tests

Getting Started

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run the CLI
pnpm --filter @docaudit/cli exec docaudit --help

Development

# Lint all packages
pnpm lint

# Format all files
pnpm format

# Type check all packages
pnpm typecheck

License

MIT
