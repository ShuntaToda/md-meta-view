# md-meta-view

YAML frontmatter 付きの Markdown ファイルを、ブラウザ上でテーブル表示・フィルター・ソート・閲覧できる CLI ツール。

## 特徴

- **テーブル一覧** — frontmatter のフィールドを自動検出してカラムとして表示
- **ソート・フィルター** — カラムごとのソート、テキストフィルター、グローバル検索
- **Markdown 閲覧** — 行を選択すると右パネルに Markdown をレンダリング表示
- **リサイズ可能** — 左右パネルの幅をドラッグで調整
- **ダークモード** — ライト / ダーク / システム設定に対応
- **URL 共有** — フィルター・ソート条件やファイル指定を URL のクエリパラメータとして共有
- **ライブリロード** — dev モードではファイル変更を WebSocket で自動反映
- **静的ビルド** — 静的 HTML として出力し、GitHub Pages 等にホスティング可能
- **設定ファイル** — `md-meta-view-setting.json` で ID フィールドや除外パターンを指定

## クイックスタート

```bash
# カレントディレクトリの Markdown を表示
npx md-meta-view

# ディレクトリを指定
npx md-meta-view ./docs

# 静的サイトとしてビルド
npx md-meta-view build --out ./dist
```

## 使い方

### dev モード

```bash
md-meta-view [dir] [--port <port>]
```

指定ディレクトリ（デフォルト: カレントディレクトリ）の Markdown ファイルをスキャンし、ブラウザで表示します。ファイルの変更は自動で反映されます。

### build モード

```bash
md-meta-view build [dir] [--out <dir>]
```

静的 HTML/JS/CSS + `meta.json` + `entries/*.json` を出力します。HTTP サーバーで配信すればそのまま動作します。

```bash
# ビルド後のプレビュー
npx serve ./dist
```

## 設定ファイル

対象ディレクトリに `md-meta-view-setting.json` を置くことで動作をカスタマイズできます。

```json
{
  "idField": "number",
  "exclude": ["**/README.md", "draft/**"]
}
```

| フィールド | 型 | 説明 |
|-----------|------|------|
| `idField` | `string` | frontmatter のどのフィールドをファイルの ID として使うか。URL の `?file=` に使用される。未指定時はファイルの相対パス |
| `exclude` | `string[]` | glob パターンで除外するファイル |

## URL パラメータ

テーブルの状態は URL のクエリパラメータに反映され、共有できます。

| パラメータ | 例 | 説明 |
|-----------|------|------|
| `file` | `?file=20260320-001` | 指定したファイルを詳細パネルに表示 |
| `sort` | `?sort=fm_date:desc` | ソート条件（`カラム:asc\|desc`、カンマ区切りで複数） |
| `filter` | `?filter=fm_category:技術選定` | カラムフィルター（`カラム:値`、カンマ区切りで複数） |
| `q` | `?q=Next` | グローバル検索 |

これらは組み合わせて使えます:

```
/?sort=fm_date:desc&filter=fm_category:技術選定&file=20260320-001
```

## Markdown の形式

YAML frontmatter 付きの Markdown ファイルを対象にします。5 階層までのサブディレクトリを再帰的にスキャンします。

```markdown
---
number: "20260320-001"
title: "フレームワークに Next.js を採用"
date: 2026-03-20
category: 技術選定
---

# フレームワークに Next.js を採用

本文がここに続きます...
```

frontmatter のフィールドはテーブルのカラムとして自動検出されます。配列やオブジェクトもカンマ区切りや JSON として表示されます。

## プロジェクト構成

```
src/
  cli/       # CLI エントリポイント（cac）
  server/    # Hono サーバー（API + 静的ファイル配信）
  core/      # 型定義、MD パーサー、設定ローダー
  client/    # React フロントエンド（Vite でビルド）
```

## 技術スタック

- **サーバー**: [Hono](https://hono.dev/), [chokidar](https://github.com/paulmillr/chokidar)
- **CLI**: [cac](https://github.com/cacjs/cac)
- **Markdown**: [gray-matter](https://github.com/jonschlinkert/gray-matter), [unified](https://unifiedjs.com/) (remark + rehype)
- **フロントエンド**: [React](https://react.dev/), [TanStack Table](https://tanstack.com/table), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **ツール**: [Vite](https://vite.dev/), [Biome](https://biomejs.dev/), [Vitest](https://vitest.dev/)

## 開発

```bash
# 依存関係のインストール
pnpm install

# ビルド + dev サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# テスト
pnpm test

# Lint & Format
pnpm lint
pnpm format
```

## ライセンス

MIT
