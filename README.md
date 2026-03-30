# md-meta-view

[日本語](./docs/README.ja.md) | [Demo](https://shuntatoda.github.io/md-meta-view/)

A CLI tool to browse Markdown files with YAML frontmatter in a browser-based table UI with sorting, filtering, and detail view.

## Features

- **Table view** — Auto-detects frontmatter fields and displays them as columns
- **Sort & filter** — Per-column sorting, text filters, and global search
- **Markdown viewer** — Select a row to render the Markdown content in a side panel
- **Resizable panels** — Drag to adjust left/right panel widths
- **Dark mode** — Light / Dark / System preference
- **URL sharing** — Filter, sort, and file selection are reflected in URL query parameters
- **Live reload** — File changes are pushed via WebSocket in dev mode
- **Static build** — Export as static HTML for hosting on GitHub Pages, Vercel, etc.
- **Config file** — Customize ID field and exclude patterns via `md-meta-view-setting.json`

## Quick Start

```bash
# Browse Markdown files in the current directory
npx md-meta-view

# Specify a directory
npx md-meta-view ./docs

# Build as a static site
npx md-meta-view build --out ./dist
```

## Usage

### Dev mode

```bash
md-meta-view [dir] [--port <port>]
```

Scans Markdown files in the specified directory (default: current directory) and opens a browser UI. File changes are automatically reflected.

### Build mode

```bash
md-meta-view build [dir] [--out <dir>]
```

Outputs static HTML/JS/CSS + `meta.json` + `entries/*.json`. Serve with any HTTP server.

```bash
# Preview the build output
npx serve ./dist
```

## Settings

Place a `md-meta-view-setting.json` in the target directory to customize behavior.

```json
{
  "idField": "number",
  "exclude": ["**/README.md", "draft/**"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `idField` | `string` | Which frontmatter field to use as the file ID. Used in the `?file=` URL parameter. Defaults to the relative file path |
| `exclude` | `string[]` | Glob patterns to exclude files |

## URL Parameters

Table state is synced to URL query parameters for sharing.

| Parameter | Example | Description |
|-----------|---------|-------------|
| `file` | `?file=20260320-001` | Open a specific file in the detail panel |
| `sort` | `?sort=fm_date:desc` | Sort condition (`column:asc\|desc`, comma-separated for multiple) |
| `filter` | `?filter=fm_category:design` | Column filter (`column:value`, comma-separated for multiple) |
| `q` | `?q=Next` | Global search |

Parameters can be combined:

```
/?sort=fm_date:desc&filter=fm_category:design&file=20260320-001
```

## Markdown Format

Targets Markdown files with YAML frontmatter. Recursively scans subdirectories up to 5 levels deep.

```markdown
---
number: "20260320-001"
title: "Adopt Next.js as framework"
date: 2026-03-20
category: tech-selection
---

# Adopt Next.js as framework

Body content goes here...
```

Frontmatter fields are auto-detected as table columns. Arrays and objects are displayed as comma-separated or JSON strings.

## Project Structure

```
src/
  cli/       # CLI entry point (cac)
  server/    # Hono server (API + static file serving)
  core/      # Types, markdown parser, settings loader
  client/    # React frontend (built by Vite)
```

## Tech Stack

- **Server**: [Hono](https://hono.dev/), [chokidar](https://github.com/paulmillr/chokidar)
- **CLI**: [cac](https://github.com/cacjs/cac)
- **Markdown**: [gray-matter](https://github.com/jonschlinkert/gray-matter), [unified](https://unifiedjs.com/) (remark + rehype)
- **Frontend**: [React](https://react.dev/), [TanStack Table](https://tanstack.com/table), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Tooling**: [Vite](https://vite.dev/), [Biome](https://biomejs.dev/), [Vitest](https://vitest.dev/)

## Development

```bash
# Install dependencies
pnpm install

# Build and start dev server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint & Format
pnpm lint
pnpm format
```

## License

MIT
