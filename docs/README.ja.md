# md-meta-view

[English](../README.md) | [Demo](https://shuntatoda.github.io/md-meta-view/)

YAML frontmatter 付きの Markdown ファイルを、ブラウザ上でテーブル表示・フィルター・ソート・閲覧できる CLI ツール。

<!-- TODO: スクリーンショットを追加 -->
<!-- ![screenshot](./screenshot.png) -->

## ユースケース

- **ADR（Architecture Decision Records）** — 日付・ステータス・カテゴリーで意思決定を検索・フィルター
- **議事録管理** — frontmatter のメタデータで議事録を横断検索
- **ドキュメント管理** — 構造化されたメタデータ付き Markdown ファイル群の閲覧・ナビゲーション
- **ナレッジベース** — 社内ドキュメントの素早い検索と共有
- **ブログ記事 / コンテンツ** — frontmatter 付き Markdown コンテンツのプレビューと管理

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

指定ディレクトリ（デフォルト: カレントディレクトリ）の Markdown ファイルをスキャンし、ブラウザで表示します。ファイルの変更は WebSocket で自動反映されます。

### build モード

```bash
md-meta-view build [dir] [--out <dir>]
```

静的 HTML/JS/CSS + `meta.json` + `entries/*.json` を出力します。HTTP サーバーで配信すればそのまま動作します。

```bash
# ビルド後のプレビュー
npx serve ./dist
```

## 機能詳細

### テーブル表示

- **カラム自動検出** — すべての Markdown ファイルの frontmatter フィールドを自動検出してカラムとして表示
- **カラム表示/非表示** — 「Columns」ドロップダウンでカラムの表示を切り替え
- **ページネーション** — 1ページ50件、Previous/Next で移動
- **ファイルパスカラム** — サブディレクトリ内のファイルは相対パスを表示

### ソート・フィルター

- **カラムソート** — カラムヘッダーをクリックでソート。再クリックで逆順。複数カラムでのソートに対応
- **カラムフィルター** — カラムヘッダーの ▼ アイコンでフィルターポップオーバーを表示。テキスト入力またはバッジクリックでワンクリックフィルター
- **グローバル検索** — 全カラムを対象にした全文検索
- **アクティブフィルター表示** — 適用中のソート・フィルター条件がバッジとして表示。✕ で個別解除
- **一括クリア** — 「Clear filters」ボタンで全フィルターを一括解除

### 詳細パネル

- **分割ビュー** — 行を選択すると、リサイズ可能な右パネルにレンダリングされた Markdown を表示
- **frontmatter テーブル** — メタデータがキー・値テーブルとして表示
- **インライン Markdown** — frontmatter の値は Markdown としてレンダリング（`[テキスト](URL)` はクリック可能なリンクに）
- **クリックでコピー** — frontmatter の値をクリックするとクリップボードにコピー
- **Copy Link** — `?file=` パラメータ付きの共有用 URL を生成
- **シンタックスハイライト** — コードブロックはシンタックスハイライト表示

### Share View

フィルターやソート条件が適用されている時に「Share View」ボタンが表示されます。クリックすると、現在のフィルター/ソートパラメータ付き URL がコピーされ、チームメンバーに同じビューを共有できます。

共有 URL の例:
```
https://example.com/?sort=fm_date:desc&filter=fm_category:技術選定&q=React
```

### ダークモード

ヘッダーのテーマボタンで ライト → ダーク → システム を切り替え。設定は `localStorage` に保存され、リロードしても維持されます。

### ライブリロード

dev モード（`md-meta-view [dir]`）では [chokidar](https://github.com/paulmillr/chokidar) でファイル変更を監視します:

- **追加** — 新しい `.md` ファイルを自動検出
- **変更** — 変更されたファイルを再パースしてテーブルを更新
- **削除** — 削除されたファイルはテーブルから消える

更新は WebSocket でブラウザにプッシュされ、手動リロード不要です。

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
id: "20260320-001"
title: "フレームワークに Next.js を採用"
date: 2026-03-20
category: 技術選定
deciders:
  - 田中太郎
  - 鈴木花子
status: accepted
---

# フレームワークに Next.js を採用

本文がここに続きます...
```

- frontmatter のフィールドはテーブルのカラムとして自動検出
- 配列（例: `deciders`）はカンマ区切りで表示
- オブジェクトは JSON 文字列として表示
- 日付はソート可能
- frontmatter のないファイルも空のメタデータ行として表示

## GitHub Pages へのデプロイ

静的ビルドを GitHub Pages でホスティングできます。設定例は [`.github/workflows/pages.yml`](../.github/workflows/pages.yml) を参照してください。

ポイント:
- `VITE_BASE_PATH` を `/<リポジトリ名>/` に設定して、GitHub Pages でアセットが正しく読み込まれるようにする
- リポジトリの **Settings > Pages** で Source を **GitHub Actions** に設定する

## 制限事項

- **最大深度**: サブディレクトリのスキャンは 5 階層まで
- **file:// プロトコル**: 静的ビルドは HTTP サーバーが必要。`index.html` を直接 `file://` で開くことはできません（fetch API の制約）
- **大量データ**: ファイル数が数千件になると初回ロードが遅くなる場合があります。メタデータと HTML コンテンツは `meta.json` + `entries/*.json` に分離して軽減しています

## プロジェクト構成

```
src/
  cli/       # CLI エントリポイント（cac）
  server/    # Hono サーバー（API + 静的ファイル配信 + WebSocket）
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

## コントリビュート

Issue や Pull Request を歓迎します。

## ライセンス

MIT
