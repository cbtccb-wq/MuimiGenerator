# 無意味機構ジェネレータ (MuimiGenerator)

歯車が回り、レバーが揺れ、リンクが伝達し、最後に旗が少しだけ震える。
**壮大な徒労感**を自動生成するWebアプリ。

---

## 仕様

→ [`docs/spec_master.md`](docs/spec_master.md)（仕様の唯一の真実）

## AI運用ルール

→ [`docs/ai/agent_operating_rules.md`](docs/ai/agent_operating_rules.md)

## 現在の状態・再開手順

→ [`docs/ai/resume.md`](docs/ai/resume.md)

## 実装タスク分解

→ [`docs/ai/無意味機構ジェネレータ_実装タスク分解書.md`](docs/ai/無意味機構ジェネレータ_実装タスク分解書.md)

---

## 技術スタック

- **React + TypeScript** — UIフレームワーク
- **Vite** — ビルドツール
- **Zustand** — 状態管理
- **SVG** — 機構描画
- **Vitest** — テスト

## セットアップ

```bash
npm install
npm run dev
```

## コマンド一覧

```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run lint         # ESLint
npm run typecheck    # 型チェック
npm run test         # Vitestテスト実行
npm run test:coverage # カバレッジ付きテスト
```

## テスト階層（Level A は毎ループ必須）

```bash
# Level A（毎ループ）
npm run lint
npm run typecheck
npm run test

# Level B（フェーズ完了時）
npm run test:coverage
```

---

## ディレクトリ構成

```
MuimiGenerator/
├── src/
│   ├── app/store/          # Zustand ストア
│   ├── components/         # UI コンポーネント
│   │   ├── canvas/         # SVGキャンバス・レンダラ
│   │   ├── panels/         # パレット等
│   │   └── toolbar/        # 再生UI等
│   ├── domain/
│   │   ├── models/         # 部品・接続モデル
│   │   ├── services/       # Generator / Layout / Evaluation
│   │   └── rules/          # 接続互換ルール
│   ├── generators/         # 主経路・冗長経路生成
│   ├── simulation/         # tickエンジン・信号伝達
│   ├── persistence/        # JSON保存・読込
│   ├── types/              # 型定義
│   └── tests/
├── docs/
│   ├── spec_master.md      ← 仕様の唯一の真実
│   └── ai/                 ← AI運用ファイル群
├── CLAUDE.md
├── package.json
└── .gitignore
```

---

## MVPゴール

1. 新規生成ボタンで機構が1つ表示される
2. 因果連鎖が2D上で見える
3. 再生すると旗またはベルが反応する
4. JSONで保存・再読込できる
5. 無意味度スコアが表示される
6. 3種類以上、見た目と経路が異なる生成結果が出る
