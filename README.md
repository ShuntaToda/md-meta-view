# md-meta-view

[日本語](./docs/README.ja.md) | [Demo](https://shuntatoda.github.io/md-meta-view/)

A CLI tool to browse Markdown files with YAML frontmatter in a browser-based table UI with sorting, filtering, and detail view.

<!-- TODO: Add screenshot -->
<!-- ![screenshot](./docs/screenshot.png) -->

## Use Cases

- **Architecture Decision Records (ADR)** — Browse and filter decisions by date, status, category
- **Meeting notes** — Search across meeting minutes with frontmatter metadata
- **Documentation management** — View and navigate any collection of Markdown files with structured metadata
- **Knowledge base** — Quick lookup and sharing of internal documents
- **Blog posts / content** — Preview and manage Markdown-based content with frontmatter

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

Scans Markdown files in the specified directory (default: current directory) and opens a browser UI. File changes are automatically reflected via WebSocket.

### Build mode

```bash
md-meta-view build [dir] [--out <dir>]
```

Outputs static HTML/JS/CSS + `meta.json` + `entries/*.json`. Serve with any HTTP server.

```bash
# Preview the build output
npx serve ./dist
```

## Feature Details

### Table View

- **Auto-detected columns** — All frontmatter fields across your Markdown files are automatically discovered and shown as table columns
- **Column visibility** — Toggle columns on/off via the "Columns" dropdown
- **Pagination** — 50 items per page with Previous/Next navigation
- **File path column** — Shows the relative path for files in subdirectories

### Sort & Filter

- **Column sorting** — Click any column header to sort. Click again to reverse. Supports multi-column sort
- **Column filter** — Click the ▼ icon on a column header to open a filter popover. Type to search, or click a value badge for one-click filtering
- **Global search** — Full-text search across all columns
- **Active filter display** — Active sort and filter conditions are shown as badges in the toolbar. Click ✕ to remove individual conditions
- **Clear all** — "Clear filters" button removes all active filters at once

### Detail Panel

- **Split view** — Selecting a row opens a resizable right panel with the rendered Markdown content
- **Frontmatter table** — Metadata is displayed as a key-value table at the top of the detail panel
- **Inline Markdown** — Frontmatter values are rendered as Markdown (links like `[text](url)` become clickable)
- **Click to copy** — Click any frontmatter value to copy it to the clipboard
- **Copy Link** — Generates a shareable URL with `?file=` parameter pointing to the selected file
- **Syntax highlighting** — Code blocks in Markdown are syntax-highlighted

### Share View

When filters or sort conditions are active, a "Share View" button appears. Clicking it copies the current URL with all filter/sort parameters, allowing you to share a specific view with your team.

Example shared URL:
```
https://example.com/?sort=fm_date:desc&filter=fm_category:tech-selection&q=React
```

### Dark Mode

Toggle between Light, Dark, and System mode by clicking the theme button in the header. The preference is saved to `localStorage` and persists across sessions.

### Live Reload

In dev mode (`md-meta-view [dir]`), the server watches for file changes using [chokidar](https://github.com/paulmillr/chokidar):

- **Add** — New `.md` files are automatically detected
- **Change** — Modified files are re-parsed and the table updates
- **Delete** — Removed files disappear from the table

Updates are pushed to the browser via WebSocket — no manual refresh needed.

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
id: "20260320-001"
title: "Adopt Next.js as framework"
date: 2026-03-20
category: tech-selection
deciders:
  - Alice
  - Bob
status: accepted
---

# Adopt Next.js as framework

Body content goes here...
```

- Frontmatter fields are auto-detected as table columns
- Arrays (e.g. `deciders`) are displayed as comma-separated values
- Objects are displayed as JSON strings
- Dates are sortable
- Files without frontmatter are included with an empty metadata row

## Deploy to GitHub Pages

You can host a static build on GitHub Pages. See [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) for a working example.

Key points:
- Set `VITE_BASE_PATH` to `/<your-repo-name>/` so assets load correctly on GitHub Pages
- Go to your repository's **Settings > Pages** and set Source to **GitHub Actions**

## Limitations

- **Max depth**: Scans subdirectories up to 5 levels deep
- **file:// protocol**: Static builds require an HTTP server; opening `index.html` directly via `file://` will not work (fetch API restriction)
- **Large datasets**: For thousands of files, initial load may be slow. Metadata and HTML content are split into separate files (`meta.json` + `entries/*.json`) to mitigate this

## Project Structure

```
src/
  cli/       # CLI entry point (cac)
  server/    # Hono server (API + static file serving + WebSocket)
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

## Contributing

Contributions are welcome! Please open an issue or pull request.

## License

MIT
